// src/workflow/action/interfaces/action.interface.ts
export interface IAction {
  type: string;
  execute(context: ActionContext): Promise<ActionResult>;
}

export interface ActionContext {
  workflowId: string;
  step: number;
  params: Record<string, any>;
}

export interface ActionResult {
  success: boolean;
  data?: any;
  error?: Error;
}
