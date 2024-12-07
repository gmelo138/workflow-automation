import { Expose } from 'class-transformer';
import { TransformerUtil } from '../util/transformer.util';

export class WorkflowDto extends TransformerUtil {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  trigger: { type: string; params: Record<string, any> };

  @Expose()
  lastExecutionState?: Record<string, any>;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  actions: { type: string; params: Record<string, any> }[];

  static fromEntity(entity: any): WorkflowDto {
    return WorkflowDto.fromPlain(entity);
  }
}
