export class WorkflowDomain {
  private readonly name: string;
  private readonly trigger: { type: string; params: Record<string, any> };

  constructor(
    name: string,
    trigger: { type: string; params: Record<string, any> },
  ) {
    this.name = name;
    this.trigger = trigger;
    this.validate();
  }

  private validate() {
    const allowedTriggers = ['time-based', 'webhook'];
    if (!allowedTriggers.includes(this.trigger.type)) {
      throw new Error(`Trigger type "${this.trigger.type}" is not supported`);
    }
  }

  getName(): string {
    return this.name;
  }

  getTrigger(): { type: string; params: Record<string, any> } {
    return this.trigger;
  }
}
