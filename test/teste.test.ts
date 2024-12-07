import { Test } from '@nestjs/testing';
import { WorkflowModule } from 'src/workflow/workflow.module';

describe('WorkflowModule', () => {
  it('should compile the module without errors', async () => {
    const module = await Test.createTestingModule({
      imports: [WorkflowModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
