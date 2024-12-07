import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowProcessor } from 'src/workflow/processor';
import { WorkflowExecutionService } from 'src/workflow/service';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';

describe('WorkflowProcessor', () => {
  let workflowProcessor: WorkflowProcessor;

  const mockWorkflowExecutionService = {
    executeWorkflow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowProcessor,
        {
          provide: WorkflowExecutionService,
          useValue: mockWorkflowExecutionService,
        },
      ],
    }).compile();

    workflowProcessor = module.get<WorkflowProcessor>(WorkflowProcessor);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process workflow successfully', async () => {
    const job = {
      data: { workflowId: 'test-workflow-id' },
    } as Job<{ workflowId: string }>;

    mockWorkflowExecutionService.executeWorkflow.mockResolvedValueOnce(
      undefined,
    );

    await expect(
      workflowProcessor.handleWorkflowExecution(job),
    ).resolves.not.toThrow();

    expect(mockWorkflowExecutionService.executeWorkflow).toHaveBeenCalledWith(
      'test-workflow-id',
    );
    expect(Logger.prototype.log).toHaveBeenCalledWith(
      'Workflow processed successfully: test-workflow-id',
    );
  });

  it('should log an error and rethrow it if workflow processing fails', async () => {
    const job = {
      data: { workflowId: 'test-workflow-id' },
    } as Job<{ workflowId: string }>;

    const error = new Error('Test error');
    mockWorkflowExecutionService.executeWorkflow.mockRejectedValueOnce(error);

    await expect(
      workflowProcessor.handleWorkflowExecution(job),
    ).rejects.toThrow(error);

    expect(mockWorkflowExecutionService.executeWorkflow).toHaveBeenCalledWith(
      'test-workflow-id',
    );
    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'Error processing workflow: test-workflow-id',
      error.stack,
    );
  });
});