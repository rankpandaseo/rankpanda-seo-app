import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { getSession } from '~/lib/session.server';
import { db } from '~/lib/db.server';
import { AdminFrame } from '~/design-system';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('cookie'));
  const userId = session.get('userId');

  if (!userId) {
    return redirect('/auth/login');
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'admin') {
    return redirect('/app');
  }

  return { user };
}

const adminNavItems = [
  { label: 'Utilizadores', href: '/app/admin/users' },
];

export default function AdminLayout() {
  const { user } = useLoaderData<typeof loader>();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <AdminFrame
      navItems={adminNavItems}
      activeNav={pathname}
    >
      <Outlet context={{ user }} />
    </AdminFrame>
  );
}
