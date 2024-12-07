import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  WorkflowCommandService,
  WorkflowStateService,
} from 'src/workflow/service';
import { getActionInstance } from '../factory';

@Injectable()
export class WorkflowExecutionService {
  private readonly logger = new Logger(WorkflowExecutionService.name);
  private readonly MAX_STEPS = 5; // max steps limit

  constructor(
    private readonly workflowStateService: WorkflowStateService,
    private readonly workflowCommandService: WorkflowCommandService,
    @InjectQueue('workflow-queue') private readonly workflowQueue: Queue,
  ) {}

  async enqueueWorkflow(workflowId: string): Promise<void> {
    this.logger.log(`Adding workflow to queue: ${workflowId}`);

    // setting up 5 retrys with exp. backoff
    // after each retry, there shall be a progressive delay starting at 5s
    await this.workflowQueue.add(
      'execute-workflow',
      { workflowId },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000, // first retry after 5s, the next one shall take longer
        },
        removeOnComplete: true, // optional, clean completed jobs from the queue
        removeOnFail: false, // optional, keep failure history
      },
    );
  }

  async executeWorkflow(workflowId: string): Promise<void> {
    this.logger.log(`Executing workflow: ${workflowId}`);

    const workflow = await this.fetchWorkflow(workflowId);
    const currentState = await this.getOrInitializeState(workflowId);

    try {
      this.logger.log(
        `Executing step ${currentState.step} for workflow: ${workflowId}`,
      );

      const actions = workflow.actions || [];
      if (!Array.isArray(actions) || actions.length === 0) {
        this.logger.warn(`No actions defined for workflow: ${workflowId}`);
        await this.completeWorkflow(workflowId);
        return;
      }

      const currentAction = actions[currentState.step];
      if (!currentAction) {
        this.logger.log(
          `No more actions to execute for workflow: ${workflowId}`,
        );
        await this.completeWorkflow(workflowId);
        return;
      }

      // checks if the steps limit was reach
      if (currentState.step >= this.MAX_STEPS) {
        this.logger.log(
          `Workflow ${workflowId} reached the maximum step limit (${this.MAX_STEPS}). Completing.`,
        );
        await this.completeWorkflow(workflowId);
        return;
      }

      await this.executeAction(currentAction, workflowId, currentState.step);
      currentState.step += 1;

      await this.workflowStateService.updateExecutionState(
        workflowId,
        currentState,
      );
    } catch (error) {
      this.logger.error(`Error while processing workflow: ${workflowId}`, error.stack);
      await this.workflowStateService.updateExecutionState(workflowId, { 
        error: error.message,
        status: 'failed'
      });
    }
  }

  private async fetchWorkflow(workflowId: string) {
    const workflow =
      await this.workflowCommandService.getWorkflowById(workflowId);
    if (!workflow) {
      this.logger.warn(`Workflow not found: ${workflowId}`);
      throw new Error(`Workflow ${workflowId} not found`);
    }
    return workflow;
  }

  private async getOrInitializeState(workflowId: string) {
    return (
      (await this.workflowStateService.getExecutionState(workflowId)) || {
        step: 0,
      }
    );
  }

  private async completeWorkflow(workflowId: string): Promise<void> {
    this.logger.log(`Completing workflow: ${workflowId}`);
    await this.workflowStateService.updateExecutionState(workflowId, {
      status: 'completed',
    });
  }

  private async executeAction(
    currentAction: any,
    workflowId: string,
    step: number,
  ): Promise<void> {
    this.logger.log(`Executing action of type: ${currentAction.type}`);
    const actionInstance = getActionInstance(currentAction.type);
    const result = await actionInstance.execute({
      workflowId,
      step,
      params: currentAction.params,
    });

    if (!result.success) {
      throw (
        result.error || new Error('Unknown error occurred in action execution')
      );
    }
  }

  private async handleError(
    error: Error,
    workflowId: string,
    currentState: any,
  ): Promise<void> {
    currentState.error = error.message;
    await this.workflowStateService.updateExecutionState(
      workflowId,
      currentState,
    );
    this.logger.error(
      `Error while processing workflow: ${workflowId}`,
      error.stack,
    );

    // Throws an error so Bull can detect the failure and 
    // trigger the retry mechanism
    throw error;
  }
}
