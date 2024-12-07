import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowRepository } from '../src/workflow/repository';
import { WorkflowEntity } from '../src/workflow/entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('WorkflowRepository', () => {
  let repository: WorkflowRepository;
  let mockRepo: Partial<Record<keyof Repository<WorkflowEntity>, jest.Mock>>;

  const mockWorkflow: Partial<WorkflowEntity> = {
    id: '1',
    name: 'Test Workflow',
    trigger: { type: 'http', params: {} },
    actions: [],
    lastExecutionState: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn().mockReturnValue(mockWorkflow),
      save: jest.fn().mockResolvedValue(mockWorkflow),
      find: jest.fn().mockResolvedValue([mockWorkflow]),
      findOne: jest.fn().mockResolvedValue(mockWorkflow),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowRepository,
        {
          provide: getRepositoryToken(WorkflowEntity),
          useValue: mockRepo,
        },
      ],
    }).compile();

    repository = module.get<WorkflowRepository>(WorkflowRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWorkflow', () => {
    it('should create and save a workflow', async () => {
      const result = await repository.createWorkflow(mockWorkflow as WorkflowEntity);
      expect(mockRepo.create).toHaveBeenCalledWith(mockWorkflow);
      expect(mockRepo.save).toHaveBeenCalledWith(mockWorkflow);
      expect(result).toEqual(mockWorkflow);
    });
  });

  describe('findAll', () => {
    it('should return an array of workflows', async () => {
      const result = await repository.findAll();
      expect(mockRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockWorkflow]);
    });
  });

  describe('findById', () => {
    it('should return a workflow by id', async () => {
      const result = await repository.findById('1');
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockWorkflow);
    });

    it('should return null if workflow not found', async () => {
      (mockRepo.findOne as jest.Mock).mockResolvedValueOnce(null);
      const result = await repository.findById('2');
      expect(result).toBeNull();
    });
  });

  describe('updateWorkflow', () => {
    it('should update and return the updated workflow', async () => {
      const result = await repository.updateWorkflow('1', { name: 'Updated Workflow' });
      expect(mockRepo.update).toHaveBeenCalledWith({ id: '1' }, { name: 'Updated Workflow' });
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockWorkflow);
    });

    it('should throw an error if workflow not found', async () => {
      (mockRepo.findOne as jest.Mock).mockResolvedValueOnce(null);
      await expect(repository.updateWorkflow('2', { name: 'Updated Workflow' })).rejects.toThrow('Workflow not found');
    });
  });

  describe('deleteWorkflow', () => {
    it('should delete a workflow by id', async () => {
      await repository.deleteWorkflow('1');
      expect(mockRepo.delete).toHaveBeenCalledWith({ id: '1' });
    });
  });
});