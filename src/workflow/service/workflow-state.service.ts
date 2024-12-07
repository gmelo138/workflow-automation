import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { WorkflowRepository } from '../repository';

@Injectable()
export class WorkflowStateService {
  private readonly logger = new Logger(WorkflowStateService.name);

  constructor(
    @InjectRedis() private readonly redisClient: Redis,
    private readonly workflowRepository: WorkflowRepository,
  ) {}

  private getRedisKey(workflowId: string): string {
    return `workflow:${workflowId}:state`;
  }
  async updateExecutionState(
    workflowId: string,
    state: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Updating state for workflow: ${workflowId}`);
    await this.redisClient.set(
      this.getRedisKey(workflowId),
      JSON.stringify(state),
      'EX',
      3600,
    ); // 1hr TTL 

    // Updates the 'lastExecutionState' field on database
    await this.workflowRepository.updateWorkflow(workflowId, {
      lastExecutionState: state,
    });
  }

  async getExecutionState(
    workflowId: string,
  ): Promise<Record<string, any> | null> {
    this.logger.log(`Fetching state for workflow: ${workflowId}`);
    const state = await this.redisClient.get(this.getRedisKey(workflowId));
    return state ? JSON.parse(state) : null;
  }
}
