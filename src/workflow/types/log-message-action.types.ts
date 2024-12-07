// src/workflow/action/types/log-message.action.ts
import {
  IAction,
  ActionContext,
  ActionResult,
} from '../interfaces/action.interface';

export class LogMessageAction implements IAction {
  type = 'logMessage';

  async execute(context: ActionContext): Promise<ActionResult> {
    const { params } = context;
    const { message } = params;

    if (!message) {
      return {
        success: false,
        error: new Error('Message parameter is required'),
      };
    }

    console.log(`Log Message Action: ${message}`);
    return { success: true };
  }
}
