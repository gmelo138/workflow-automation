import { IAction } from '../interfaces/action.interface';
import { LogMessageAction } from 'src/workflow/types';
import { HttpRequestAction } from '../types/http-request.action';

const actionMap: Record<string, new () => IAction> = {
  logMessage: LogMessageAction,
  httpRequest: HttpRequestAction,
};

export function getActionInstance(type: string): IAction {
  const ActionClass = actionMap[type];
  if (!ActionClass) {
    throw new Error(`No action found for type: ${type}`);
  }
  return new ActionClass();
}
