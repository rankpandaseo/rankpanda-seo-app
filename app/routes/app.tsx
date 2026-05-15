import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { Box, Text } from '@shopify/polaris';
import { getSession } from '~/lib/session.server';
import { db } from '~/lib/db.server';

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

export default function AppLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <Box background="bg-surface">
      <Box
        padding="400"
        background="bg-fill-secondary"
        borderBottomWidth="1"
        borderColor="border"
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text as="h1" variant="headingLg">
            RankPanda SEO
          </Text>
          <Box display="flex" gap="300" alignItems="center">
            <Text as="p" variant="bodySm">
              {user.email} ({user.role})
            </Text>
            <form method="POST" action="/auth/logout" style={{ margin: 0 }}>
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Logout
              </button>
            </form>
          </Box>
        </Box>
      </Box>

      <Box display="flex">
        <Box background="bg-fill-tertiary" borderRightWidth="1" borderColor="border">
          <Box padding="400">
            <nav style={{ minWidth: '200px' }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                <li style={{ marginBottom: '8px' }}>
                  <a
                    href="/app/projetos"
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      textDecoration: 'none',
                      color: '#007bff',
                      borderRadius: '4px',
                    }}
                  >
                    Projetos
                  </a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a
                    href="/app/keywords"
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      textDecoration: 'none',
                      color: '#007bff',
                      borderRadius: '4px',
                    }}
                  >
                    Palavras-Chave
                  </a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a
                    href="/app/csv-upload"
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      textDecoration: 'none',
                      color: '#007bff',
                      borderRadius: '4px',
                    }}
                  >
                    Upload CSV
                  </a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a
                    href="/app/settings"
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      textDecoration: 'none',
                      color: '#007bff',
                      borderRadius: '4px',
                    }}
                  >
                    Definições
                  </a>
                </li>
                {user.role === 'admin' && (
                  <>
                    <li style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
                      Admin
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                      <a
                        href="/app/admin/users"
                        style={{
                          display: 'block',
                          padding: '8px 12px',
                          textDecoration: 'none',
                          color: '#007bff',
                          borderRadius: '4px',
                        }}
                      >
                        Utilizadores
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </Box>
        </Box>

        <Box flex="1" padding="400">
          <Outlet context={{ user }} />
        </Box>
      </Box>
    </Box>
  );
}
