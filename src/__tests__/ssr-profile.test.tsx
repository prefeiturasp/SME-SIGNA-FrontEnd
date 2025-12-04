// src/pages/__tests__/ssr-profile.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import SSRProfile, { getServerSideProps } from '../pages/ssr-profile';

// helper para mockar Response-like
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

describe('getServerSideProps (SSRProfile)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    // restaura o fetch original após cada teste
    global.fetch = originalFetch;
  });

  it('retorna props com tokenPreview e resultado do fetch (com token)', async () => {
    const token = 'abcdef0123456789TOKENMAIOR';
    const mockResponse = makeFetchResponse({
      status: 200,
      body: '{"ok":true}',
      headers: {
        'content-type': 'application/json',
        vary: 'Origin',
        'www-authenticate': 'Bearer realm="example"',
      },
    });

    global.fetch = vi.fn().mockResolvedValue(mockResponse); // sem redeclarar tipos

    const context: any = { query: { token } };
    const result = await getServerSideProps(context);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/profile/',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
        }),
        redirect: 'manual',
      })
    );

    const { props }: any = result;
    expect(props.tokenPreview).toBe(`${token.slice(0, 20)}... (len=${token.length})`);
    expect(props.tokenExists).toBe(true);
    expect(props.fetchStatus).toBe(200);
    expect(props.fetchBody).toBe('{"ok":true}');
    expect(props.fetchHeaders).toEqual(
      expect.objectContaining({
        'content-type': 'application/json',
        vary: 'Origin',
        'www-authenticate': 'Bearer realm="example"',
      })
    );
  });

  it('retorna props sem Authorization quando não há token', async () => {
    const mockResponse = makeFetchResponse({
      status: 401,
      body: 'Unauthorized',
      headers: { 'content-type': 'text/plain' },
    });
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const context: any = { query: {} };
    const result = await getServerSideProps(context);
    const { props }: any = result;

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/profile/',
      expect.objectContaining({
        method: 'GET',
        headers: {},
        redirect: 'manual',
      })
    );

    expect(props.tokenPreview).toBe(null);
    expect(props.tokenExists).toBe(false);
    expect(props.fetchStatus).toBe(401);
    expect(props.fetchBody).toBe('Unauthorized');
    expect(props.fetchHeaders).toEqual(
      expect.objectContaining({ 'content-type': 'text/plain' })
    );
  });

  it('retorna fetchError quando fetch lança erro', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Falha na rede'));

    const context: any = { query: { token: 'abc' } };
    const result = await getServerSideProps(context);
    const { props }: any = result;

    expect(props.tokenPreview).toBe(`abc... (len=3)`);
    expect(props.tokenExists).toBe(true);
    expect(props.fetchError).toContain('Error: Falha na rede');
  });
});

describe('SSRProfile component render', () => {
  it('renderiza com erro (fetchError)', () => {
    render(
      <SSRProfile
        tokenPreview={null}
        tokenExists={false}
        fetchStatus={undefined as any}
        fetchBody={undefined as any}
        fetchHeaders={{}}
        fetchError="Error: Falha na rede"
      />
    );
    expect(screen.getByText('SSR Profile — debug')).toBeInTheDocument();
    expect(screen.getByText('Token presente na query:')).toBeInTheDocument();
    expect(screen.getByText('false')).toBeInTheDocument();
    expect(screen.getByText(/Falha na rede/)).toBeInTheDocument();
  });

  it('renderiza com dados do fetch', () => {
    render(
      <SSRProfile
        tokenPreview={'abcdef... (len=12)'}
        tokenExists={true}
        fetchStatus={200}
        fetchBody={'{"ok":true}'}
        fetchHeaders={{ 'content-type': 'application/json' }}
        fetchError={undefined as any}
      />
    );
    expect(screen.getByText('SSR Profile — debug')).toBeInTheDocument();
    expect(screen.getByText('Token presente na query:')).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
    expect(screen.getByText('status:')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText(/"content-type": "application\/json"/)).toBeInTheDocument();
    expect(screen.getByText('{"ok":true}')).toBeInTheDocument();
  });
});