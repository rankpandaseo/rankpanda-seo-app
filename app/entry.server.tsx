import { PassThrough } from 'stream';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: any
) {
  return isbot(request.headers.get('user-agent'))
    ? handleBotRequest(request, responseStatusCode, responseHeaders, remixContext)
    : handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext);
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: any
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onAllReady() {
          shellRendered = true;
          responseHeaders.set('Content-Type', 'text/html');
          const stream = new PassThrough();
          pipe(stream);
          resolve(
            new Response(stream as any, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );
        },
        onShellError() {
          reject(new Error('Shell error'));
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          console.error('Bot render error:', error);
        },
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: any
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onShellReady() {
          shellRendered = true;
          responseHeaders.set('Content-Type', 'text/html');
          const stream = new PassThrough();
          pipe(stream);
          resolve(
            new Response(stream as any, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );
        },
        onShellError() {
          reject(new Error('Shell error'));
        },
        onError(error: unknown) {
          console.error('Browser render error:', error);
          responseStatusCode = 500;
        },
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
