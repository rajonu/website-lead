export interface Env {
  PREVIEWS_KV: KVNamespace;
  ORIGIN_FALLBACK?: string;
  SHOWCASE_REDIRECT?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const pathname = url.pathname;

    // 1. Health check endpoint
    if (pathname === '/healthz' || pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', worker: 'website-lead-preview-edge', time: new Date().toISOString() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Custom Domain Resolution
    // If the request comes from a custom client domain (e.g. apexcomfortdallas.com)
    let slug = '';
    const isStandardEdgeDomain =
      host.includes('live.d4f.me') ||
      host.includes('workers.dev') ||
      host === 'localhost' ||
      host === '127.0.0.1';

    if (!isStandardEdgeDomain && env.PREVIEWS_KV) {
      try {
        const mappedSlug = await env.PREVIEWS_KV.get(`domain:${host}`);
        if (mappedSlug) {
          slug = mappedSlug;
        }
      } catch (err) {
        // KV lookup failed, proceed to path parsing
      }
    }

    // 3. Path Parsing (live.d4f.me/:slug or live.d4f.me/preview/:slug)
    if (!slug) {
      // Strip leading /preview/ or /
      let cleanPath = pathname;
      if (cleanPath.startsWith('/preview/')) {
        cleanPath = cleanPath.slice('/preview/'.length);
      } else if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.slice(1);
      }
      // Remove trailing slash
      cleanPath = cleanPath.replace(/\/$/, '').trim();

      // Root access
      if (!cleanPath) {
        const redirectUrl = env.SHOWCASE_REDIRECT || 'https://d4f.me';
        return Response.redirect(redirectUrl, 302);
      }

      // Ignore assets or system paths
      if (cleanPath.includes('.') || cleanPath.startsWith('_next') || cleanPath.startsWith('api/')) {
        return new Response('Not Found', { status: 404 });
      }

      slug = cleanPath;
    }

    // 4. Retrieve Site from Cloudflare Workers KV
    const kvKey = `site:${slug}`;
    if (env.PREVIEWS_KV) {
      try {
        const cachedHtml = await env.PREVIEWS_KV.get(kvKey);
        if (cachedHtml) {
          return new Response(cachedHtml, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
              'X-Edge-Served-By': 'Cloudflare-Workers-KV',
            },
          });
        }
      } catch (err) {
        // Continue to fallback
      }
    }

    // 5. Fallback Proxy to Raspberry Pi Tunnel Origin
    // Ensures uninterrupted service if a preview has not yet been synced to KV
    const origin = env.ORIGIN_FALLBACK || 'https://lead.d4f.me';
    try {
      const fallbackUrl = `${origin}/preview/${encodeURIComponent(slug)}`;
      const originRes = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'Cloudflare-Edge-Worker-Fallback',
          'Accept': 'text/html',
        },
      });

      if (originRes.ok) {
        const html = await originRes.text();

        // Asynchronously populate KV in the background so future requests are 100% edge-served
        if (env.PREVIEWS_KV) {
          ctx.waitUntil(
            env.PREVIEWS_KV.put(kvKey, html, {
              metadata: { cachedFromOriginAt: new Date().toISOString() },
            }).catch(() => {})
          );
        }

        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=1800, s-maxage=86400',
            'X-Edge-Served-By': 'Raspberry-Pi-Fallback-Cached',
          },
        });
      }
    } catch (err) {
      // Origin fetch failed or Raspberry Pi is currently offline
    }

    // 6. Friendly 404 Page
    const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Website Preview Not Found</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-sky-500 selection:text-white">
  <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
    <div class="w-14 h-14 mx-auto rounded-2xl bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center font-black text-2xl">
      404
    </div>
    <div class="space-y-2">
      <h1 class="text-2xl font-black text-white">Preview Not Found</h1>
      <p class="text-xs text-slate-400 leading-relaxed">
        The website preview for <code class="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[11px]">${escapeHtml(slug)}</code> has not been generated or is currently unpublished.
      </p>
    </div>
    <div class="pt-2">
      <a
        href="${env.SHOWCASE_REDIRECT || 'https://d4f.me'}"
        class="inline-flex items-center justify-center px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
      >
        Return to Homepage
      </a>
    </div>
    <div class="text-[10px] text-slate-600 pt-4 border-t border-slate-800/80">
      Cloudflare Edge Showcase &bull; Powered by Website Lead Engine
    </div>
  </div>
</body>
</html>`;

    return new Response(notFoundHtml, {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  },
};
