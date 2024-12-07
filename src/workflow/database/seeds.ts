import { dataSource } from './datasource.database';
import { WorkflowEntity } from '../entities/workflow.entity';

async function seed() {
  const manager = dataSource.manager;

  const workflows: Partial<WorkflowEntity>[] = [
    {
      name: 'Daily Report Generator',
      trigger: { type: 'time-based', params: { interval: 'daily' } },
      actions: [
        { type: 'httpRequest', params: { url: 'https://api.example.com/report', method: 'GET' } },
        { type: 'logMessage', params: { message: 'Daily report generated' } },
      ],
    },
    {
      name: 'Webhook Example',
      trigger: { type: 'webhook', params: {} },
      actions: [
        { type: 'logMessage', params: { message: 'Webhook triggered' } },
      ],
    },
    {
      name: 'Monthly Cleanup',
      trigger: { type: 'time-based', params: { interval: 'monthly' } },
      actions: [
        { type: 'httpRequest', params: { url: 'https://api.example.com/cleanup', method: 'POST' } },
        { type: 'logMessage', params: { message: 'Monthly cleanup completed' } },
      ],
    },
  ];

  console.log('Starting database seed...');
  for (const workflow of workflows) {
    const exists = await manager.findOne(WorkflowEntity, { where: { name: workflow.name } });
    if (!exists) {
      console.log(`Inserting workflow: ${workflow.name}`);
      await manager.save(manager.create(WorkflowEntity, workflow));
    } else {
      console.log(`Workflow already exists: ${workflow.name}`);
    }
  }

  console.log('Seeding complete.');
}

seed()
  .then(() => {
    console.log('Seed operation finished successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed operation failed:', error);
    process.exit(1);
  });
