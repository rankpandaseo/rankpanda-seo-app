import { redirect, json, type LoaderFunctionArgs, type ActionFunction } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { getSession } from '~/lib/session.server';
import { db } from '~/lib/db.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('cookie'));
  const userId = session.get('userId');

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'admin') {
    return redirect('/app');
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return json({ users });
}

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await getSession(request.headers.get('cookie'));
  const userId = session.get('userId');

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'admin') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const actionType = formData.get('action') as string;
  const targetUserId = formData.get('userId') as string;
  const reason = formData.get('reason') as string;

  if (actionType === 'approve') {
    await db.user.update({
      where: { id: targetUserId },
      data: { status: 'active' },
    });

    await db.userApprovalLog.create({
      data: {
        userId: targetUserId,
        action: 'approved',
        approvedBy: userId,
        reason,
      },
    });
  } else if (actionType === 'reject') {
    await db.user.update({
      where: { id: targetUserId },
      data: { status: 'banned' },
    });

    await db.userApprovalLog.create({
      data: {
        userId: targetUserId,
        action: 'rejected',
        approvedBy: userId,
        reason,
      },
    });
  }

  return json({ success: true });
};

export default function AdminUsersPage() {
  const { users } = useLoaderData<typeof loader>();
  const { user } = useOutletContext<{ user: any }>();

  if (user.role !== 'admin') {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '4px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <p style={{ color: '#666' }}>
          Não tens permissão para aceder a esta página.
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    if (status === 'active') return '#4CAF50';
    if (status === 'pending') return '#ff9800';
    return '#f44336';
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '4px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
        Gestão de Utilizadores
      </h1>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f9f9f9' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Email</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Papel</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Estado</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Criado em</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>{u.email}</td>
                <td style={{ padding: '0.75rem' }}>{u.role}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    backgroundColor: getStatusColor(u.status),
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {new Date(u.createdAt).toLocaleDateString('pt-PT')}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {u.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <form method="POST" style={{ display: 'inline' }}>
                        <input type="hidden" name="action" value="approve" />
                        <input type="hidden" name="userId" value={u.id} />
                        <button type="submit" style={{
                          padding: '0.35rem 0.7rem',
                          fontSize: '0.75rem',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}>
                          Aprovar
                        </button>
                      </form>
                      <form method="POST" style={{ display: 'inline' }}>
                        <input type="hidden" name="action" value="reject" />
                        <input type="hidden" name="userId" value={u.id} />
                        <button type="submit" style={{
                          padding: '0.35rem 0.7rem',
                          fontSize: '0.75rem',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}>
                          Rejeitar
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
