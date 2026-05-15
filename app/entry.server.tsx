import { PassThrough } from 'stream';
import { Response } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import * as isBotModule from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';

const isbot = (isBotModule.default || isBotModule.isbot || isBotModule) as (ua: string) => boolean;

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
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onAllReady() {
          responseHeaders.set('Content-Type', 'text/html');
          resolve(
            new Response(pipe as any, {
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
          console.error(error);
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
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onShellReady() {
          responseHeaders.set('Content-Type', 'text/html');
          resolve(
            new Response(pipe as any, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );
        },
        onShellError() {
          reject(new Error('Shell error'));
        },
        onError(error: unknown) {
          console.error(error);
          responseStatusCode = 500;
        },
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
