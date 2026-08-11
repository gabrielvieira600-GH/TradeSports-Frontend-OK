const ALLOWED_HOSTS = new Set(['media.api-sports.io']);
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function validateSource(rawValue) {
  if (typeof rawValue !== 'string' || !rawValue.trim()) return null;

  try {
    const url = new URL(rawValue);

    if (url.protocol !== 'https:' || !ALLOWED_HOSTS.has(url.hostname)) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ erro: 'Método não permitido.' });
  }

  const source = validateSource(req.query.url);

  if (!source) {
    return res.status(400).json({ erro: 'Endereço de escudo inválido.' });
  }

  try {
    const response = await fetch(source, {
      redirect: 'error',
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'User-Agent': 'TradeSports/1.0',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return res.status(response.status === 404 ? 404 : 502).end();
    }

    const contentType = response.headers.get('content-type') || '';
    const contentLength = Number(response.headers.get('content-length') || 0);

    if (!contentType.toLowerCase().startsWith('image/')) {
      return res.status(415).end();
    }

    if (contentLength > MAX_IMAGE_BYTES) {
      return res.status(413).end();
    }

    const image = Buffer.from(await response.arrayBuffer());

    if (image.length > MAX_IMAGE_BYTES) {
      return res.status(413).end();
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000'
    );
    res.setHeader('Content-Length', String(image.length));

    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(image);
  } catch (error) {
    console.error('[ESCUDO PROXY]', error?.message || error);
    return res.status(502).end();
  }
}
