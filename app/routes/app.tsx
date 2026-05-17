import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        padding: '1rem',
        backgroundColor: '#f0f0f0',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
          RankPanda SEO
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            {user.email} ({user.role})
          </p>
          <form method="POST" action="/auth/logout" style={{ margin: 0 }}>
            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        <aside style={{
          backgroundColor: '#f9f9f9',
          borderRight: '1px solid #ddd',
          padding: '1rem',
          minWidth: '200px'
        }}>
          <nav>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a
                  href="/app/projetos"
                  style={{
                    display: 'block',
                    padding: '0.5rem 0.75rem',
                    textDecoration: 'none',
                    color: '#007bff',
                    borderRadius: '4px',
                  }}
                >
                  Projetos
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a
                  href="/app/keywords"
                  style={{
                    display: 'block',
                    padding: '0.5rem 0.75rem',
                    textDecoration: 'none',
                    color: '#007bff',
                    borderRadius: '4px',
                  }}
                >
                  Palavras-Chave
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a
                  href="/app/csv-upload"
                  style={{
                    display: 'block',
                    padding: '0.5rem 0.75rem',
                    textDecoration: 'none',
                    color: '#007bff',
                    borderRadius: '4px',
                  }}
                >
                  Upload CSV
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a
                  href="/app/settings"
                  style={{
                    display: 'block',
                    padding: '0.5rem 0.75rem',
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
                  <li style={{ marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Admin
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a
                      href="/app/admin/users"
                      style={{
                        display: 'block',
                        padding: '0.5rem 0.75rem',
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
        </aside>

        <main style={{ flex: 1, padding: '1rem' }}>
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
