import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowController } from '../src/workflow/controller';
import { WorkflowCommandService, WorkflowExecutionService, WorkflowStateService } from '../src/workflow/service';
import { CreateWorkflowDto, UpdateWorkflowDto, WorkflowDto } from '../src/workflow/dto';

describe('WorkflowController', () => {
  let controller: WorkflowController;
  let workflowCommandService: jest.Mocked<WorkflowCommandService>;
  let workflowExecutionService: jest.Mocked<WorkflowExecutionService>;
  let workflowStateService: jest.Mocked<WorkflowStateService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowController],
      providers: [
        {
          provide: WorkflowCommandService,
          useValue: {
            createWorkflow: jest.fn(),
            getAllWorkflows: jest.fn(),
            updateWorkflow: jest.fn(),
            deleteWorkflow: jest.fn(),
            getWorkflowById: jest.fn(),
          },
        },
        {
          provide: WorkflowExecutionService,
          useValue: {
            enqueueWorkflow: jest.fn(),
          },
        },
        {
          provide: WorkflowStateService,
          useValue: {
            getExecutionState: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WorkflowController>(WorkflowController);
    workflowCommandService = module.get(WorkflowCommandService);
    workflowExecutionService = module.get(WorkflowExecutionService);
    workflowStateService = module.get(WorkflowStateService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new workflow', async () => {
      const createWorkflowDto: CreateWorkflowDto = CreateWorkflowDto.fromRawData({
        name: 'Test Workflow',
        trigger: { type: 'manual', params: {} },
        actions: [{ type: 'logMessage', params: { message: 'Test' } }],
      });
      const expectedResult: WorkflowDto = WorkflowDto.fromEntity({
        id: '1',
        name: 'Test Workflow',
        trigger: { type: 'manual', params: {} },
        actions: [{ type: 'logMessage', params: { message: 'Test' } }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      workflowCommandService.createWorkflow.mockResolvedValue(expectedResult);

      const result = await controller.create(createWorkflowDto);
      expect(result).toEqual(expectedResult);
      expect(workflowCommandService.createWorkflow).toHaveBeenCalledWith(createWorkflowDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of workflows', async () => {
      const expectedResult: WorkflowDto[] = [
        WorkflowDto.fromEntity({ id: '1', name: 'Workflow 1', trigger: { type: 'manual', params: {} }, actions: [], createdAt: new Date(), updatedAt: new Date() }),
        WorkflowDto.fromEntity({ id: '2', name: 'Workflow 2', trigger: { type: 'manual', params: {} }, actions: [], createdAt: new Date(), updatedAt: new Date() }),
      ];

      workflowCommandService.getAllWorkflows.mockResolvedValue(expectedResult);

      const result = await controller.findAll();
      expect(result).toEqual(expectedResult);
      expect(workflowCommandService.getAllWorkflows).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a workflow', async () => {
      const id = '1';
      const updateWorkflowDto: UpdateWorkflowDto = UpdateWorkflowDto.fromPlain({
        name: 'Updated Workflow',
        trigger: { type: 'time-based', params: { interval: 'daily' } },
      });
      const expectedResult: WorkflowDto = WorkflowDto.fromEntity({
        id,
        name: 'Updated Workflow',
        trigger: { type: 'time-based', params: { interval: 'daily' } },
        actions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      workflowCommandService.updateWorkflow.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateWorkflowDto);
      expect(result).toEqual(expectedResult);
      expect(workflowCommandService.updateWorkflow).toHaveBeenCalledWith(id, updateWorkflowDto);
    });
  });

  describe('remove', () => {
    it('should remove a workflow', async () => {
      const id = '1';

      await controller.remove(id);
      expect(workflowCommandService.deleteWorkflow).toHaveBeenCalledWith(id);
    });
  });

  describe('trigger', () => {
    it('should trigger a workflow', async () => {
      const id = '1';

      await controller.trigger(id);
      expect(workflowExecutionService.enqueueWorkflow).toHaveBeenCalledWith(id);
    });
  });

  describe('getState', () => {
    it('should get the state of a workflow', async () => {
      const id = '1';
      const expectedState = { step: 1, status: 'running', error: null };

      workflowStateService.getExecutionState.mockResolvedValue(expectedState);

      const result = await controller.getState(id);
      expect(result).toEqual(expectedState);
      expect(workflowStateService.getExecutionState).toHaveBeenCalledWith(id);
    });
  });
});