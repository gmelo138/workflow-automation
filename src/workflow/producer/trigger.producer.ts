import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  WorkflowCommandService,
  WorkflowExecutionService,
  WorkflowStateService,
} from 'src/workflow/service';

@Injectable()
export class TriggerProducer {
  private readonly logger = new Logger(TriggerProducer.name);

  constructor(
    private readonly workflowCommandService: WorkflowCommandService,
    private readonly workflowExecutionService: WorkflowExecutionService,
    private readonly workflowStateService: WorkflowStateService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkTimeBasedWorkflows() {
    this.logger.log('Running cron job to check time-based workflows...');
    const workflows =
      await this.workflowCommandService.findWorkflowsByTriggerType(
        'time-based',
      );
    this.logger.log(
      `Found ${workflows.length} workflows with time-based triggers.`,
    );

    for (const wf of workflows) {
      try {
        const state = await this.workflowStateService.getExecutionState(wf.id);
        const interval = wf.trigger?.params?.interval;
        const actions = wf.actions || [];
        const step = state?.step ?? 0;
        const isCompleted = state?.status === 'completed';

        const workflowType = interval ? 'Recurring' : 'One-time';
        const canEnqueue = !isCompleted && step < actions.length;

        if (canEnqueue) {
          this.logger.log(
            `${workflowType} workflow ${wf.id} - enqueueing again`,
          );
          await this.workflowExecutionService.enqueueWorkflow(wf.id);
        } else {
          this.logger.log(
            `${workflowType} workflow ${wf.id} is completed or has no pending steps. No enqueue.`,
          );
        }
      } catch (error) {
        this.logger.error(`Error processing workflow: ${wf.id}`, error.stack);
      }
    }
  }

  async triggerWebhookWorkflow(workflowId: string): Promise<void> {
    this.logger.log(`Triggering webhook for workflow: ${workflowId}`);
    await this.workflowExecutionService.executeWorkflow(workflowId);
  }
}
