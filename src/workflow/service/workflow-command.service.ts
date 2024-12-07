import { Injectable, Logger } from '@nestjs/common';
import { WorkflowRepository } from '../repository';
import { CreateWorkflowDto, UpdateWorkflowDto, WorkflowDto } from '../dto';
import { WorkflowDomain } from '../domain/workflow.domain';

@Injectable()
export class WorkflowCommandService {
  private readonly logger = new Logger(WorkflowCommandService.name);

  constructor(private readonly workflowRepository: WorkflowRepository) {}

  async createWorkflow(
    createWorkflowDto: CreateWorkflowDto,
  ): Promise<WorkflowDto> {
    this.logger.log(`Creating workflow: ${JSON.stringify(createWorkflowDto)}`);
    const workflowEntity = await this.workflowRepository.createWorkflow({
      name: createWorkflowDto.name,
      trigger: createWorkflowDto.trigger,
      actions: createWorkflowDto.actions,
    });
    this.logger.log(`Workflow created: ${workflowEntity.id}`);
    return WorkflowDto.fromEntity(workflowEntity);
  }

  async getAllWorkflows(): Promise<WorkflowDto[]> {
    this.logger.log('Fetching all workflows...');
    const workflows = await this.workflowRepository.findAll();
    this.logger.log(`Found ${workflows.length} workflows`);
    return workflows.map((wf) => WorkflowDto.fromEntity(wf));
  }

  async updateWorkflow(
    id: string,
    data: UpdateWorkflowDto,
  ): Promise<WorkflowDto> {
    this.logger.log(`Updating workflow: ${id}`);

    const existing = await this.workflowRepository.findById(id);
    if (!existing) {
      this.logger.warn(`Workflow not found: ${id}`);
      throw new Error('Workflow not found');
    }

    if (data.trigger || data.name) {
      const domain = new WorkflowDomain(
        data.name ?? existing.name,
        data.trigger ?? existing.trigger,
      );
      data.name = domain.getName();
      data.trigger = domain.getTrigger();
    }

    const updated = await this.workflowRepository.updateWorkflow(id, {
      name: data.name ?? existing.name,
      trigger: data.trigger ?? existing.trigger,
    });

    this.logger.log(`Workflow updated: ${id}`);
    return WorkflowDto.fromEntity(updated);
  }

  async deleteWorkflow(id: string): Promise<void> {
    this.logger.log(`Deleting workflow: ${id}`);
    await this.workflowRepository.deleteWorkflow(id);
    this.logger.log(`Workflow deleted: ${id}`);
  }

  async findWorkflowsByTriggerType(
    triggerType: string,
  ): Promise<WorkflowDto[]> {
    this.logger.log(`Fetching workflows with trigger type: ${triggerType}`);
    const workflows = await this.workflowRepository.findAll();

    const filtered = workflows.filter((wf) => {
      try {
        const trigger =
          typeof wf.trigger === 'string' ? JSON.parse(wf.trigger) : wf.trigger;
        return trigger.type === triggerType;
      } catch (error) {
        this.logger.error(
          `Failed to parse trigger for workflow: ${wf.id}, error: ${error.message}`,
        );
        return false;
      }
    });

    this.logger.log(
      `Found ${filtered.length} workflows with trigger type: ${triggerType}`,
    );
    return filtered.map((wf) => WorkflowDto.fromEntity(wf));
  }

  async getWorkflowById(id: string): Promise<WorkflowDto | null> {
    this.logger.log(`Fetching workflow by ID: ${id}`);
    const workflowEntity = await this.workflowRepository.findById(id);

    if (!workflowEntity) {
      this.logger.warn(`Workflow not found: ${id}`);
      return null; 
    }

    return WorkflowDto.fromEntity(workflowEntity);
  }
}
