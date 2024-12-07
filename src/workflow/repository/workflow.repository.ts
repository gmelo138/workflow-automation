import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { WorkflowEntity } from '../entities/workflow.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class WorkflowRepository {
  constructor(
    @InjectRepository(WorkflowEntity)
    private readonly repo: Repository<WorkflowEntity>,
  ) {}

  async createWorkflow(data: Partial<WorkflowEntity>): Promise<WorkflowEntity> {
    const workflow = this.repo.create(data);
    return this.repo.save(workflow);
  }

  async findAll(): Promise<WorkflowEntity[]> {
    return this.repo.find();
  }

  async findById(id: string): Promise<WorkflowEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async updateWorkflow(
    id: string,
    data: Partial<WorkflowEntity>,
  ): Promise<WorkflowEntity> {
    await this.repo.update({ id }, data);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Workflow not found');
    }
    return updated;
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
