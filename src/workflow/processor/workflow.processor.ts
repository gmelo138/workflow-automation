import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { WorkflowExecutionService } from 'src/workflow/service';

@Processor('workflow-queue')
export class WorkflowProcessor {
  private readonly logger = new Logger(WorkflowProcessor.name);

  constructor(
    private readonly workflowExecutionService: WorkflowExecutionService,
  ) {}

  @Process('execute-workflow')
  async handleWorkflowExecution(job: Job<{ workflowId: string }>) {
    const { workflowId } = job.data;
    try {
      await this.workflowExecutionService.executeWorkflow(workflowId);
      this.logger.log(`Workflow processed successfully: ${workflowId}`);
    } catch (error) {
      this.logger.error(
        `Error processing workflow: ${workflowId}`,
        error.stack,
      );
      throw error;
    }
  }
}
