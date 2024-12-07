import {
  IAction,
  ActionContext,
  ActionResult,
} from '../interfaces/action.interface';
import axios from 'axios';

export class HttpRequestAction implements IAction {
  type = 'httpRequest';

  async execute(context: ActionContext): Promise<ActionResult> {
    const { params } = context;
    const { url, method, body } = params;

    if (!url || !method) {
      return {
        success: false,
        error: new Error('URL and method parameters are required'),
      };
    }

    try {
      const response = await axios({ url, method, data: body });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }
}
