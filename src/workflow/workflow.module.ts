import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { WorkflowEntity } from './entities';
import { WorkflowController } from './controller';
import {
  WorkflowCommandService,
  WorkflowExecutionService,
  WorkflowStateService,
} from './service';
import { WorkflowRepository } from './repository';
import { TriggerProducer } from './producer';
import { WorkflowProcessor } from './processor/workflow.processor';
import { connection } from './database';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => connection(), // uses its central configs
    }),
    TypeOrmModule.forFeature([WorkflowEntity]),
    BullModule.registerQueue({
      name: 'workflow-queue',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    }),
  ],
  controllers: [WorkflowController],
  providers: [
    WorkflowRepository, // database
    WorkflowStateService, // Redis
    WorkflowCommandService, // command logic
    WorkflowExecutionService, // execution logic
    WorkflowProcessor, // Bull consumer
    TriggerProducer, // Cron and events
  ],
  exports: [WorkflowCommandService, WorkflowExecutionService],
})
export class WorkflowModule {}
