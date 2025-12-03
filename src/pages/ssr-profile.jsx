// pages/ssr-profile.jsx (debug)
export async function getServerSideProps(context) {
  const token = context.query.token || null;

  // DEBUG: mostrar o token (string curta) e o tamanho
  const tokenPreview = token ? `${token.slice(0,20)}... (len=${token.length})` : null;

  try {
    const resp = await fetch('http://localhost:8000/api/profile/', {
      method: 'GET',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      // não seguir redirect automaticamente pode ajudar a detectar redirects:
      redirect: 'manual',
    });

    const status = resp.status;
    // tenta ler texto (pode falhar se não for json)
    const text = await resp.text();
    // também pega alguns headers úteis
    const serverHeaders = {};
    ['www-authenticate','content-type','vary','set-cookie'].forEach(h => {
      if (resp.headers.get(h)) serverHeaders[h] = resp.headers.get(h);
    });

    return {
      props: {
        tokenPreview,
        tokenExists: !!token,
        fetchStatus: status,
        fetchBody: text,
        fetchHeaders: serverHeaders,
      },
    };
  } catch (err) {
    return { props: { tokenPreview, tokenExists: !!token, fetchError: String(err) } };
  }
}

export default function SSRProfile({ tokenPreview, tokenExists, fetchStatus, fetchBody, fetchHeaders, fetchError }) {
  return (
    <div style={{ padding: 20 }}>
      <h1>SSR Profile — debug</h1>
      <p><strong>Token presente na query:</strong> {String(tokenExists)}</p>
      <p><strong>Token (preview):</strong> {tokenPreview || 'null'}</p>

      <h2>Fetch result</h2>
      {fetchError ? (
        <pre style={{ color: 'red' }}>{fetchError}</pre>
      ) : (
        <>
          <p><strong>status:</strong> {fetchStatus}</p>
          <h3>headers</h3>
          <pre>{JSON.stringify(fetchHeaders, null, 2)}</pre>
          <h3>body</h3>
          <pre>{fetchBody}</pre>
        </>
      )}
    </div>
  );
}
