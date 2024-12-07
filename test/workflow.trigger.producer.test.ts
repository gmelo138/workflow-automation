import { Test, TestingModule } from '@nestjs/testing';
import { TriggerProducer } from 'src/workflow/producer';
import {
  WorkflowCommandService,
  WorkflowExecutionService,
  WorkflowStateService,
} from 'src/workflow/service';
import { Logger } from '@nestjs/common';

describe('TriggerProducer', () => {
  let triggerProducer: TriggerProducer;

  const mockWorkflowCommandService = {
    findWorkflowsByTriggerType: jest.fn(),
  };

  const mockWorkflowExecutionService = {
    enqueueWorkflow: jest.fn(),
    executeWorkflow: jest.fn(),
  };

  const mockWorkflowStateService = {
    getExecutionState: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TriggerProducer,
        {
          provide: WorkflowCommandService,
          useValue: mockWorkflowCommandService,
        },
        {
          provide: WorkflowExecutionService,
          useValue: mockWorkflowExecutionService,
        },
        {
          provide: WorkflowStateService,
          useValue: mockWorkflowStateService,
        },
      ],
    }).compile();

    triggerProducer = module.get<TriggerProducer>(TriggerProducer);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkTimeBasedWorkflows', () => {
    it('should enqueue workflows with pending steps', async () => {
      const mockWorkflows = [
        {
          id: 'workflow-1',
          trigger: { params: { interval: true } },
          actions: [{ type: 'action1', params: {} }],
        },
        {
          id: 'workflow-2',
          trigger: { params: { interval: false } },
          actions: [{ type: 'action1', params: {} }],
        },
      ];
      const mockStates = [
        { step: 0, status: 'in-progress' },
        { step: 0, status: 'in-progress' },
      ];

      mockWorkflowCommandService.findWorkflowsByTriggerType.mockResolvedValueOnce(
        mockWorkflows,
      );
      mockWorkflowStateService.getExecutionState
        .mockResolvedValueOnce(mockStates[0])
        .mockResolvedValueOnce(mockStates[1]);

      await triggerProducer.checkTimeBasedWorkflows();

      expect(
        mockWorkflowCommandService.findWorkflowsByTriggerType,
      ).toHaveBeenCalledWith('time-based');
      expect(
        mockWorkflowExecutionService.enqueueWorkflow,
      ).toHaveBeenCalledTimes(2);
      expect(mockWorkflowExecutionService.enqueueWorkflow).toHaveBeenCalledWith(
        'workflow-1',
      );
      expect(mockWorkflowExecutionService.enqueueWorkflow).toHaveBeenCalledWith(
        'workflow-2',
      );
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Found 2 workflows with time-based triggers.',
      );
    });

    it('should skip completed workflows', async () => {
      const mockWorkflows = [
        {
          id: 'workflow-1',
          trigger: { params: { interval: true } },
          actions: [{ type: 'action1', params: {} }],
        },
      ];
      const mockState = { step: 1, status: 'completed' };

      mockWorkflowCommandService.findWorkflowsByTriggerType.mockResolvedValueOnce(
        mockWorkflows,
      );
      mockWorkflowStateService.getExecutionState.mockResolvedValueOnce(
        mockState,
      );

      await triggerProducer.checkTimeBasedWorkflows();

      expect(
        mockWorkflowCommandService.findWorkflowsByTriggerType,
      ).toHaveBeenCalledWith('time-based');
      expect(
        mockWorkflowExecutionService.enqueueWorkflow,
      ).not.toHaveBeenCalled();
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Recurring workflow workflow-1 is completed or has no pending steps. No enqueue.',
      );
    });

    it('should log errors when workflow processing fails', async () => {
      const mockWorkflows = [
        {
          id: 'workflow-1',
          trigger: { params: { interval: true } },
          actions: [{ type: 'action1', params: {} }],
        },
      ];

      const error = new Error('Test error');
      mockWorkflowCommandService.findWorkflowsByTriggerType.mockResolvedValueOnce(
        mockWorkflows,
      );
      mockWorkflowStateService.getExecutionState.mockRejectedValueOnce(error);

      await triggerProducer.checkTimeBasedWorkflows();

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error processing workflow: workflow-1',
        error.stack,
      );
    });
  });

  describe('triggerWebhookWorkflow', () => {
    it('should trigger webhook for a workflow', async () => {
      await triggerProducer.triggerWebhookWorkflow('workflow-1');

      expect(mockWorkflowExecutionService.executeWorkflow).toHaveBeenCalledWith(
        'workflow-1',
      );
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Triggering webhook for workflow: workflow-1',
      );
    });
  });
});