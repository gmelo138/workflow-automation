import { WorkflowDomain } from 'src/workflow/domain';

describe('WorkflowDomain', () => {
  it('should create a WorkflowDomain instance with valid name and trigger', () => {
    const name = 'Test Workflow';
    const trigger = { type: 'time-based', params: { interval: '5m' } };

    const domain = new WorkflowDomain(name, trigger);

    expect(domain.getName()).toBe(name);
    expect(domain.getTrigger()).toEqual(trigger);
  });

  it('should throw an error if the trigger type is not allowed', () => {
    const name = 'Invalid Trigger Workflow';
    const invalidTrigger = { type: 'invalid-type', params: {} };

    expect(() => new WorkflowDomain(name, invalidTrigger)).toThrowError(
      'Trigger type "invalid-type" is not supported',
    );
  });

  it('should allow "time-based" as a valid trigger type', () => {
    const name = 'Valid Trigger Workflow';
    const validTrigger = { type: 'time-based', params: { interval: '5m' } };

    const domain = new WorkflowDomain(name, validTrigger);

    expect(domain.getTrigger().type).toBe('time-based');
    expect(domain.getTrigger().params).toEqual({ interval: '5m' });
  });

  it('should allow "webhook" as a valid trigger type', () => {
    const name = 'Webhook Trigger Workflow';
    const validTrigger = {
      type: 'webhook',
      params: { url: 'http://example.com' },
    };

    const domain = new WorkflowDomain(name, validTrigger);

    expect(domain.getTrigger().type).toBe('webhook');
    expect(domain.getTrigger().params).toEqual({ url: 'http://example.com' });
  });

  it('should throw an error if the name is not provided', () => {
    const trigger = { type: 'time-based', params: { interval: '5m' } };

    expect(() => new WorkflowDomain('', trigger)).toThrow();
  });

  it('should validate the trigger type during initialization', () => {
    const name = 'Validation Workflow';
    const trigger = { type: 'unsupported-type', params: {} };

    expect(() => new WorkflowDomain(name, trigger)).toThrow(
      'Trigger type "unsupported-type" is not supported',
    );
  });

  it('should retrieve the correct name and trigger after initialization', () => {
    const name = 'Retrieve Workflow';
    const trigger = { type: 'webhook', params: { url: 'http://example.com' } };

    const domain = new WorkflowDomain(name, trigger);

    expect(domain.getName()).toBe(name);
    expect(domain.getTrigger()).toEqual(trigger);
  });
});