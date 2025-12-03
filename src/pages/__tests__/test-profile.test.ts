// src/pages/api/__tests__/test-profile.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Importe o handler da sua rota
// Ajuste o caminho se necessário:
import handler from '../api/test-profile';

type Req = {
  query?: Record<string, any>;
  headers?: Record<string, any>;
  method?: string;
};

function createRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function makeFetchResponse({
  status = 200,
  body = '',
  headers = {},
}: {
  status?: number;
  body?: string;
  headers?: Record<string, string>;
}) {
  const headersMap = new Map<string, string>();
  for (const [k, v] of Object.entries(headers)) {
    headersMap.set(k.toLowerCase(), v);
  }
  return {
    status,
    text: vi.fn().mockResolvedValue(body),
    headers: {
      get: (key: string) => headersMap.get(key.toLowerCase()) ?? null,
    },
  } as any;
}

describe('API route: test-profile handler', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('usa token da query sem Bearer e prefixa corretamente', async () => {
    const req: Req = {
      query: { token: 'abc123' },
      headers: {},
      method: 'GET',
    };
    const res = createRes();

    const mockResp = makeFetchResponse({
      status: 200,
      body: '{"ok":true}',
      headers: { 'content-type': 'application/json' },
    });
    global.fetch = vi.fn().mockResolvedValue(mockResp);

    await handler(req as any, res as any);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/profile/',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Accept: 'application/json',
          Authorization: 'Bearer abc123',
        }),
      })
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('{"ok":true}');
    expect(res.json).not.toHaveBeenCalled();
  });

  it('usa header Authorization já com Bearer sem modificar', async () => {
    const req: Req = {
      query: {},
      headers: { authorization: 'Bearer tokenXYZ' },
      method: 'GET',
    };
    const res = createRes();

    const mockResp = makeFetchResponse({
      status: 200,
      body: 'OK',
      headers: { 'content-type': 'text/plain' },
    });
    global.fetch = vi.fn().mockResolvedValue(mockResp);

    await handler(req as any, res as any);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/profile/',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Accept: 'application/json',
          Authorization: 'Bearer tokenXYZ',
        }),
      })
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('OK');
  });

  it('usa header Authorization sem Bearer e adiciona prefixo', async () => {
    const req: Req = {
      query: {},
      headers: { authorization: 'rawToken' },
      method: 'GET',
    };
    const res = createRes();

    const mockResp = makeFetchResponse({
      status: 401,
      body: 'Unauthorized',
    });
    global.fetch = vi.fn().mockResolvedValue(mockResp);

    await handler(req as any, res as any);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/profile/',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Accept: 'application/json',
          Authorization: 'Bearer rawToken',
        }),
      })
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith('Unauthorized');
  });

  it('não envia Authorization quando não há token em query nem header', async () => {
    const req: Req = {
      query: {},
      headers: {},
      method: 'GET',
    };
    const res = createRes();

    const mockResp = makeFetchResponse({
      status: 200,
      body: '{"guest":true}',
      headers: { 'content-type': 'application/json' },
    });
    global.fetch = vi.fn().mockResolvedValue(mockResp);

    await handler(req as any, res as any);

    // headers deve conter apenas Accept sem Authorization
    const call = (global.fetch as any).mock.calls[0];
    const options = call[1];
    expect(options.headers).toEqual({ Accept: 'application/json' });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('{"guest":true}');
  });

  it('retorna 500 com json quando fetch rejeita', async () => {
    const req: Req = {
      query: { token: 'willFail' },
      headers: {},
      method: 'GET',
    };
    const res = createRes();

    global.fetch = vi.fn().mockRejectedValue(new Error('Falha na rede'));

    await handler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining('Error: Falha na rede'),
    });
    expect(res.send).not.toHaveBeenCalled();
  });
});