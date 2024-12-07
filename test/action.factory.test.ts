import { getActionInstance } from 'src/workflow/factory';
import { HttpRequestAction, LogMessageAction } from 'src/workflow/types';
import { IAction } from 'src/workflow/interfaces';

describe('ActionFactory', () => {
  it('should return an instance of LogMessageAction when type is "logMessage"', () => {
    const action = getActionInstance('logMessage');

    expect(action).toBeInstanceOf(LogMessageAction);
    expect((action as IAction).type).toBe('logMessage');
  });

  it('should return an instance of HttpRequestAction when type is "httpRequest"', () => {
    const action = getActionInstance('httpRequest');

    expect(action).toBeInstanceOf(HttpRequestAction);
    expect((action as IAction).type).toBe('httpRequest');
  });

  it('should throw an error if no action is found for the given type', () => {
    expect(() => getActionInstance('invalidType')).toThrowError(
      'No action found for type: invalidType',
    );
  });
});
