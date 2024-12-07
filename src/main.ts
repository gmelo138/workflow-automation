import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { SwaggerConfig } from './swagger.config';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(json({ limit: '50mb' }));

  new SwaggerConfig().setup(app);

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const workflowQueue = app.get<Queue>(getQueueToken('workflow-queue'));

  createBullBoard({
    queues: [new BullAdapter(workflowQueue)],
    serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());

  await app.listen(3000, () => {
    console.log('Application running on http://localhost:3000');
    console.log('Bull Board running on http://localhost:3000/admin/queues');
    console.log('Docs running on http://localhost:3000/docs');
  });
}

bootstrap();
