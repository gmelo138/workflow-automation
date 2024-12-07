import { LogMessageAction } from '../src/workflow/types'; 
import { ActionContext } from '../src/workflow/interfaces';

describe('LogMessageAction', () => {
  let logMessageAction: LogMessageAction;

  beforeEach(() => {
    logMessageAction = new LogMessageAction();
    jest.spyOn(console, 'log').mockImplementation(); 
  });

  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  it('should log the message and return success', async () => {
    const context: ActionContext = {
        params: {
            message: 'This is a log message',
        },
        workflowId: 'test-id',
        step: 0
    };

    const result = await logMessageAction.execute(context);

    expect(result.success).toBe(true);
    expect(console.log).toHaveBeenCalledWith('Log Message Action: This is a log message');
  });

  it('should return an error if message parameter is not provided', async () => {
    const context: ActionContext = {
        params: {
            message: null,
        },
        workflowId: 'test-id',
        step: 0
    };

    const result = await logMessageAction.execute(context);

    expect(result.success).toBe(false);
    expect(result.error).toEqual(new Error('Message parameter is required'));
  });
});