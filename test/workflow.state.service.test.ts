import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowStateService } from '../src/workflow/service/workflow-state.service';
import { WorkflowRepository } from '../src/workflow/repository';

describe('WorkflowStateService', () => {
  let workflowStateService: WorkflowStateService;
  let workflowRepositoryMock: jest.Mocked<WorkflowRepository>;
  let redisMock: jest.Mocked<any>;

  beforeEach(async () => {
    workflowRepositoryMock = {
      updateWorkflow: jest.fn(),
    } as any;

    redisMock = {
      set: jest.fn(),
      get: jest.fn(),
    };

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

    redisMock.set.mockResolvedValue('OK');

    await workflowStateService.updateExecutionState(workflowId, state);

    expect(redisMock.set).toHaveBeenCalledWith(
      `workflow:${workflowId}:state`,
      JSON.stringify(state),
      'EX',
      3600
    );

    expect(workflowRepositoryMock.updateWorkflow).toHaveBeenCalledWith(workflowId, {
      lastExecutionState: state,
    });
  });

  it('should fetch execution state', async () => {
    const workflowId = 'test-id';
    const state = { status: 'completed' };

    redisMock.get.mockResolvedValue(JSON.stringify(state));

    const fetchedState = await workflowStateService.getExecutionState(workflowId);

    expect(redisMock.get).toHaveBeenCalledWith(`workflow:${workflowId}:state`);
    expect(fetchedState).toEqual(state);
  });

  it('should return null when fetching non-existent state', async () => {
    const workflowId = 'non-existent-id';

    redisMock.get.mockResolvedValue(null);

    const fetchedState = await workflowStateService.getExecutionState(workflowId);

    expect(redisMock.get).toHaveBeenCalledWith(`workflow:${workflowId}:state`);
    expect(fetchedState).toBeNull();
  });
});