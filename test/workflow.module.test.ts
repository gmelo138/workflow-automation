import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowStateService } from '../src/workflow/service';
import { WorkflowRepository } from '../src/workflow/repository';

class RedisMock {
  private store: { [key: string]: string } = {};

  async get(key: string): Promise<string | null> {
    return this.store[key] || null;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    this.store[key] = value;
    return 'OK';
  }
}

describe('WorkflowStateService', () => {
  let workflowStateService: WorkflowStateService;
  let workflowRepositoryMock: jest.Mocked<WorkflowRepository>;
  let redisMock: RedisMock;

  beforeEach(async () => {
    workflowRepositoryMock = {
      updateWorkflow: jest.fn(),
    } as any;
    redisMock = new RedisMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowStateService,
        {
          provide: WorkflowRepository,
          useValue: workflowRepositoryMock,
        },
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: redisMock,
        },
      ],
    }).compile();

    workflowStateService = module.get<WorkflowStateService>(WorkflowStateService);
  });

  it('should update execution state', async () => {
    const workflowId = 'test-id';
    const state = { status: 'running' };

    await workflowStateService.updateExecutionState(workflowId, state);

    const redisState = await redisMock.get(`workflow:${workflowId}:state`);
    expect(JSON.parse(redisState)).toEqual(state);

    expect(workflowRepositoryMock.updateWorkflow).toHaveBeenCalledWith(workflowId, {
      lastExecutionState: state,
    });
  });

  it('should fetch execution state', async () => {
    const workflowId = 'test-id';
    const state = { status: 'completed' };

    await redisMock.set(`workflow:${workflowId}:state`, JSON.stringify(state));

    const fetchedState = await workflowStateService.getExecutionState(workflowId);
    expect(fetchedState).toEqual(state);
  });
});