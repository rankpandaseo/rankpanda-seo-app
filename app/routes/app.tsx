import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { getSession } from '~/lib/session.server';
import { db } from '~/lib/db.server';
import { AppFrame } from '~/design-system';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('cookie'));
  const userId = session.get('userId');

  if (!userId) {
    return redirect('/auth/login');
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return redirect('/auth/login?error=user_not_found');
  }

  if (user.status !== 'active') {
    return redirect('/auth/login?error=access_denied');
  }

  return { user };
}

const navItems = [
  { label: 'Projetos', href: '/app/projetos' },
  { label: 'Palavras-Chave', href: '/app/keywords' },
  { label: 'Upload CSV', href: '/app/csv-upload' },
  { label: 'Definições', href: '/app/settings' },
];

const adminNavItems = [
  { label: 'Utilizadores', href: '/app/admin/users' },
];

export default function AppLayout() {
  const { user } = useLoaderData<typeof loader>();

  const allNavItems = [
    ...navItems,
    ...(user.role === 'admin' ? adminNavItems : []),
  ];

  return (
    <AppFrame
      isAdmin={user.role === 'admin'}
      navItems={allNavItems}
      activeNav={typeof window !== 'undefined' ? window.location.pathname : undefined}
    >
      <Outlet context={{ user }} />
    </AppFrame>
  );
}
