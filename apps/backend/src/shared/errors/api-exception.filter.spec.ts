import { ArgumentsHost } from '@nestjs/common';
import { ServiceUnavailableError } from '@oitenta/shared';
import { ApiExceptionFilter } from './api-exception.filter';

function hostFor(url: string) {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url }),
    }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('ApiExceptionFilter', () => {
  test('ServiceUnavailableError vira 503 com a mensagem do domínio', () => {
    const { host, status, json } = hostFor('/goals/assistant/draft');

    new ApiExceptionFilter().catch(
      new ServiceUnavailableError('assistant.unavailable'),
      host,
    );

    expect(status).toHaveBeenCalledWith(503);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 503,
        error: 'ServiceUnavailableError',
        message: 'assistant.unavailable',
        path: '/goals/assistant/draft',
      }),
    );
  });
});
