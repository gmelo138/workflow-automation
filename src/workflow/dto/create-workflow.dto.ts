import { IsString, IsNotEmpty, IsObject, IsArray } from 'class-validator';
import { Expose } from 'class-transformer';
import { TransformerUtil } from '../util/transformer.util';

export class CreateWorkflowDto extends TransformerUtil {
  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string;

  @IsObject()
  @Expose()
  trigger: { type: string; params: Record<string, any> };

  @IsArray()
  @Expose()
  actions: { type: string; params: Record<string, any> }[];

  static fromRawData(rawData: unknown): CreateWorkflowDto {
    return CreateWorkflowDto.fromPlain(rawData);
  }
}
