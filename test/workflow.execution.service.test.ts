import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowExecutionService } from '../src/workflow/service/workflow-execution.service';
import { WorkflowStateService } from '../src/workflow/service/workflow-state.service';
import { WorkflowCommandService } from '../src/workflow/service/workflow-command.service';
import { getQueueToken } from '@nestjs/bull';
import { WorkflowDto } from '../src/workflow/dto';
import * as ActionFactory from '../src/workflow/factory/action.factory';

// Mocking the action factory
jest.mock('../src/workflow/factory/action.factory', () => ({
  getActionInstance: jest.fn().mockReturnValue({
    execute: jest.fn().mockResolvedValue({ success: true }),
  }),
}));

describe('WorkflowExecutionService', () => {
  let service: WorkflowExecutionService;
  let workflowStateServiceMock: jest.Mocked<WorkflowStateService>;
  let workflowCommandServiceMock: jest.Mocked<WorkflowCommandService>;
  let queueMock: jest.Mocked<any>;

  beforeEach(async () => {
    workflowStateServiceMock = {
      getExecutionState: jest.fn(),
      updateExecutionState: jest.fn(),
    } as any;

    workflowCommandServiceMock = {
      getWorkflowById: jest.fn(),
    } as any;

    queueMock = {
      add: jest.fn(),
    };

    jest.spyOn(ActionFactory, 'getActionInstance').mockReturnValue({
        execute: jest.fn().mockResolvedValue({ success: true }),
        type: 'time-based'
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowExecutionService,
        {
          provide: WorkflowStateService,
          useValue: workflowStateServiceMock,
        },
        {
          provide: WorkflowCommandService,
          useValue: workflowCommandServiceMock,
        },
        {
          provide: getQueueToken('workflow-queue'),
          useValue: queueMock,
        },
      ],
    }).compile();

    service = module.get<WorkflowExecutionService>(WorkflowExecutionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enqueueWorkflow', () => {
    it('should add workflow to queue', async () => {
      const workflowId = 'test-workflow-id';
      await service.enqueueWorkflow(workflowId);

      expect(queueMock.add).toHaveBeenCalledWith(
        'execute-workflow',
        { workflowId },
        expect.objectContaining({
          attempts: 5,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: false,
        })
      );
    });
  });

  describe('executeWorkflow', () => {
    const workflowId = 'test-workflow-id';
    const mockWorkflow: WorkflowDto = {
      id: workflowId,
      name: 'Test Workflow',
      trigger: { type: 'manual', params: {} },
      actions: [{ type: 'testAction', params: {} }],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastExecutionState: {},
      toJson: jest.fn().mockReturnValue({
        id: workflowId,
        name: 'Test Workflow',
        trigger: { type: 'manual', params: {} },
        actions: [{ type: 'testAction', params: {} }],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        lastExecutionState: {},
      }),
    };
  
    beforeEach(() => {
      workflowCommandServiceMock.getWorkflowById.mockResolvedValue(mockWorkflow);
      workflowStateServiceMock.getExecutionState.mockResolvedValue({ step: 0 });
      (ActionFactory.getActionInstance as jest.Mock).mockReturnValue({
        execute: jest.fn().mockResolvedValue({ success: true }),
      });
    });
  
    it('should execute workflow successfully', async () => {
      await service.executeWorkflow(workflowId);
  
      expect(workflowCommandServiceMock.getWorkflowById).toHaveBeenCalledWith(workflowId);
      expect(workflowStateServiceMock.getExecutionState).toHaveBeenCalledWith(workflowId);
      expect(ActionFactory.getActionInstance).toHaveBeenCalledWith('testAction');
      expect(workflowStateServiceMock.updateExecutionState).toHaveBeenCalledWith(
        workflowId,
        expect.objectContaining({ step: 1 })
      );
    });
  
    it('should complete workflow when no more actions', async () => {
      workflowStateServiceMock.getExecutionState.mockResolvedValue({ step: 1 });
  
      await service.executeWorkflow(workflowId);
  
      expect(workflowStateServiceMock.updateExecutionState).toHaveBeenCalledWith(
        workflowId,
        expect.objectContaining({ status: 'completed' })
      );
    });
  
    it('should handle errors during execution', async () => {
        const error = new Error('Test error');
        (ActionFactory.getActionInstance as jest.Mock).mockReturnValue({
          execute: jest.fn().mockRejectedValue(error),
        });
      
        // We're not expecting the error to be thrown here, but rather handled internally
        await service.executeWorkflow(workflowId);
      
        // Verify that the error was caught and the workflow state was updated
        expect(workflowStateServiceMock.updateExecutionState).toHaveBeenCalledWith(
          workflowId,
          expect.objectContaining({ 
            error: expect.stringContaining('Test error'),
            status: 'failed'
          })
        );
      });
  
    it('should complete workflow when max steps reached', async () => {
      workflowStateServiceMock.getExecutionState.mockResolvedValue({ step: 5 });
  
      await service.executeWorkflow(workflowId);
  
      expect(workflowStateServiceMock.updateExecutionState).toHaveBeenCalledWith(
        workflowId,
        expect.objectContaining({ status: 'completed' })
      );
    });
  });
});