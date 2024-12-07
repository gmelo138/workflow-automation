import { IsOptional, IsString, IsObject } from 'class-validator';
import { Expose } from 'class-transformer';
import { TransformerUtil } from '../util/transformer.util';

export class UpdateWorkflowDto extends TransformerUtil {
  @IsOptional()
  @IsString()
  @Expose()
  name?: string;

  @IsOptional()
  @IsObject()
  @Expose()
  trigger?: { type: string; params: Record<string, any> };
}
