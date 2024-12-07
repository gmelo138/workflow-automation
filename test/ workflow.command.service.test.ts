import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowCommandService } from '../src/workflow/service';
import { WorkflowRepository } from '../src/workflow/repository';
import { CreateWorkflowDto, UpdateWorkflowDto, WorkflowDto } from '../src/workflow/dto';
import { WorkflowEntity } from '../src/workflow/entities';

class MockCreateWorkflowDto extends CreateWorkflowDto {
    constructor(data: Partial<CreateWorkflowDto>) {
      super();
      Object.assign(this, data);
    }
  
    toJson() {
      return this;
    }
  }
  
  class MockUpdateWorkflowDto extends UpdateWorkflowDto {
    constructor(data: Partial<UpdateWorkflowDto>) {
      super();
      Object.assign(this, data);
    }
  
    toJson() {
      return this;
    }
  }
  
  describe('WorkflowCommandService', () => {
    let service: WorkflowCommandService;
    let repository: jest.Mocked<WorkflowRepository>;
  
    const mockWorkflowEntity: WorkflowEntity = {
      id: '1',
      name: 'Test Workflow',
      trigger: { type: 'test', params: {} },
      actions: [{ type: 'test', params: {} }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  
    beforeEach(async () => {
      const mockRepository = {
        createWorkflow: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        updateWorkflow: jest.fn(),
        deleteWorkflow: jest.fn(),
      };
  
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WorkflowCommandService,
          {
            provide: WorkflowRepository,
            useValue: mockRepository,
          },
        ],
      }).compile();
  
      service = module.get<WorkflowCommandService>(WorkflowCommandService);
      repository = module.get(WorkflowRepository);
    });
  
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  
    describe('createWorkflow', () => {
      it('should create a workflow', async () => {
        const createDto = new MockCreateWorkflowDto({
          name: 'Test Workflow',
          trigger: { type: 'time-based', params: {} },
          actions: [{ type: 'test', params: {} }],
        });
  
        repository.createWorkflow.mockResolvedValue(mockWorkflowEntity);
  
        const result = await service.createWorkflow(createDto);
  
        expect(repository.createWorkflow).toHaveBeenCalledWith(createDto);
        expect(result).toBeInstanceOf(WorkflowDto);
        expect(result.id).toBe(mockWorkflowEntity.id);
      });
    });
  
    describe('getAllWorkflows', () => {
      it('should return all workflows', async () => {
        repository.findAll.mockResolvedValue([mockWorkflowEntity]);
  
        const result = await service.getAllWorkflows();
  
        expect(repository.findAll).toHaveBeenCalled();
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(WorkflowDto);
        expect(result[0].id).toBe(mockWorkflowEntity.id);
      });
    });
  
    describe('updateWorkflow', () => {
        it('should update a workflow', async () => {
            const updateDto = new MockUpdateWorkflowDto({
              name: 'Updated Workflow',
              trigger: { type: 'time-based', params: {} }, 
            });
      
            repository.findById.mockResolvedValue(mockWorkflowEntity);
            repository.updateWorkflow.mockResolvedValue({
              ...mockWorkflowEntity,
              name: 'Updated Workflow',
              trigger: { type: 'time-based', params: {} }, 
            });
      
            const result = await service.updateWorkflow('1', updateDto);
      
            expect(repository.findById).toHaveBeenCalledWith('1');
            expect(repository.updateWorkflow).toHaveBeenCalledWith('1', {
              name: 'Updated Workflow',
              trigger: { type: 'time-based', params: {} }, 
            });
            expect(result).toBeInstanceOf(WorkflowDto);
            expect(result.name).toBe('Updated Workflow');
          });      
  
      it('should throw an error if workflow is not found', async () => {
        repository.findById.mockResolvedValue(null);
  
        await expect(
          service.updateWorkflow('1', new MockUpdateWorkflowDto({ name: 'Updated Workflow' })),
        ).rejects.toThrow('Workflow not found');
      });
    });
  
    describe('deleteWorkflow', () => {
      it('should delete a workflow', async () => {
        await service.deleteWorkflow('1');
  
        expect(repository.deleteWorkflow).toHaveBeenCalledWith('1');
      });
    });
  
    describe('findWorkflowsByTriggerType', () => {
      it('should return workflows with matching trigger type', async () => {
        const mockWorkflows = [
          { ...mockWorkflowEntity, trigger: { type: 'test', params: {} } },
          { ...mockWorkflowEntity, id: '2', trigger: { type: 'other', params: {} } },
        ];
  
        repository.findAll.mockResolvedValue(mockWorkflows);
  
        const result = await service.findWorkflowsByTriggerType('test');
  
        expect(repository.findAll).toHaveBeenCalled();
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(WorkflowDto);
        expect(result[0].id).toBe('1');
      });
    });
  
    describe('getWorkflowById', () => {
      it('should return a workflow by id', async () => {
        repository.findById.mockResolvedValue(mockWorkflowEntity);
  
        const result = await service.getWorkflowById('1');
  
        expect(repository.findById).toHaveBeenCalledWith('1');
        expect(result).toBeInstanceOf(WorkflowDto);
        expect(result?.id).toBe('1');
      });
  
      it('should return null if workflow is not found', async () => {
        repository.findById.mockResolvedValue(null);
  
        const result = await service.getWorkflowById('1');
  
        expect(repository.findById).toHaveBeenCalledWith('1');
        expect(result).toBeNull();
      });
    });
  });