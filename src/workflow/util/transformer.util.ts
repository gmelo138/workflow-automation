import { instanceToPlain, plainToInstance } from 'class-transformer';
export abstract class TransformerUtil {
  static fromPlain<T>(
    this: new (...args: any[]) => T,
    plainObject: unknown,
  ): T {
    return plainToInstance(this, plainObject, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    });
  }

  toJson(): object {
    return instanceToPlain(this);
  }
}
