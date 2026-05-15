import { type ActionFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { getSession, destroySession } from '~/lib/session.server';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return { status: 405 };
  }

  const session = await getSession(request.headers.get('Cookie'));

  return redirect('/auth/login', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
};

export default function LogoutPage() {
  return null;
}
