// :: CONFIG
const CUSTOM_SCRIPT = `
console.log('HELLO *<]:{)');
`
const HOME_PAGE_PATH = '/Hi-06-02-67';
const PAGE_TITLE = 'ZJH.IM'

// :: MAIN
addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

class MetaRewriter {
    element(e) {
        if (e.tagName !== 'title') {
            return;
        }

        e.setInnerContent(PAGE_TITLE);
    }
}
// :: CLASS
class HeadRewriter {
    element(e) {
        e.append(`
            <script>
                ${CUSTOM_SCRIPT}
            </script>
        `, { html: true });
    }
}

async function rewriteHTML(res) {
    return new HTMLRewriter()
        .on('head', new HeadRewriter())
        .on('title', new MetaRewriter())
        .transform(res);
}

async function disableAuth(res) {
    let body = await res.text();
    const response = new Response(body.replace(',checkAuth();', ';'), res);
    response.headers.set('Content-Type', 'application/x-javascript');
    return response;
}

async function handleRequest(request) {
  let url = new URL(request.url);
  url.hostname = 'telegra.ph';

  let res;
  
  const isHome = url.pathname === '/';
  const isCoreJs = url.pathname.startsWith('/js/core.min.js');

  const articlePath = isHome ? HOME_PAGE_PATH : '';
  res = await fetch(url.toString() + articlePath, {
    body: request.body,
    headers: request.headers,
    method: request.method,
  });

  if (isCoreJs) {
      return disableAuth(res);
  }

  res = new Response(res.body, res);

  return rewriteHTML(res);
}
