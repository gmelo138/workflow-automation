import axios from 'axios';
import { ActionContext } from '../src/workflow/interfaces';
import { HttpRequestAction } from 'src/workflow/types';

jest.mock('axios');

describe('HttpRequestAction', () => {
  let httpRequestAction: HttpRequestAction;

  beforeEach(() => {
    httpRequestAction = new HttpRequestAction();
  });

  it('should return success for a valid HTTP request', async () => {
    const mockResponse = { data: { message: 'Success' } };
    (axios as unknown as jest.Mock).mockResolvedValue(mockResponse);

    const context: ActionContext = {
      params: {
        url: 'https://api.example.com/data',
        method: 'GET',
        body: null,
      },
      workflowId: '',
      step: 0
    };

    const result = await httpRequestAction.execute(context);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResponse.data);
    expect(axios).toHaveBeenCalledWith({
      url: context.params.url,
      method: context.params.method,
      data: context.params.body,
    });
  });

  it('should return an error for a failed HTTP request', async () => {
    const mockError = new Error('Network Error');
    (axios as unknown as jest.Mock).mockRejectedValue(mockError);

    const context: ActionContext = {
      params: {
        url: 'https://api.example.com/data',
        method: 'GET',
        body: null,
      },
      workflowId: '',
      step: 0
    };

    const result = await httpRequestAction.execute(context);

    expect(result.success).toBe(false);
    expect(result.error).toBe(mockError);
  });

  it('should return an error if URL or method is not provided', async () => {
    const contextWithMissingUrl: ActionContext = {
      params: {
        method: 'GET',
        body: null,
      },
      workflowId: '',
      step: 0
    };

    const contextWithMissingMethod: ActionContext = {
      params: {
        url: 'https://api.example.com/data',
        body: null,
      },
      workflowId: '',
      step: 0
    };

    const resultWithoutUrl = await httpRequestAction.execute(contextWithMissingUrl);
    const resultWithoutMethod = await httpRequestAction.execute(contextWithMissingMethod);

    expect(resultWithoutUrl.success).toBe(false);
    expect(resultWithoutUrl.error).toEqual(new Error('URL and method parameters are required'));

    expect(resultWithoutMethod.success).toBe(false);
    expect(resultWithoutMethod.error).toEqual(new Error('URL and method parameters are required'));
  });
});