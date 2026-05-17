import { redirect, json, type LoaderFunctionArgs, type ActionFunction } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { getSession } from '~/lib/session.server';
import { db } from '~/lib/db.server';
import { colors, spacing, StatusBadge } from '~/design-system';

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
  } else if (actionType === 'ban') {
    await db.user.update({
      where: { id: targetUserId },
      data: { status: 'banned' },
    });

    await db.userApprovalLog.create({
      data: {
        userId: targetUserId,
        action: 'banned',
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
      <div
        style={{
          backgroundColor: colors.white,
          borderRadius: '8px',
          padding: spacing.xl,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <p style={{ color: colors.gray700, margin: 0 }}>
          Não tens permissão para aceder a esta página.
        </p>
      </div>
    );
  }

  const handleApprove = (userId: string) => {
    const reason = prompt('Motivo da aprovação (opcional):');
    const form = document.createElement('form');
    form.method = 'POST';
    form.innerHTML = `
      <input type="hidden" name="action" value="approve" />
      <input type="hidden" name="userId" value="${userId}" />
      <input type="hidden" name="reason" value="${reason || ''}" />
    `;
    document.body.appendChild(form);
    form.submit();
  };

  const handleReject = (userId: string) => {
    const reason = prompt('Motivo da rejeição:');
    if (!reason) return;
    const form = document.createElement('form');
    form.method = 'POST';
    form.innerHTML = `
      <input type="hidden" name="action" value="reject" />
      <input type="hidden" name="userId" value="${userId}" />
      <input type="hidden" name="reason" value="${reason}" />
    `;
    document.body.appendChild(form);
    form.submit();
  };

  const handleBan = (userId: string) => {
    if (confirm('Tens a certeza que queres banir este utilizador?')) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.innerHTML = `
        <input type="hidden" name="action" value="ban" />
        <input type="hidden" name="userId" value="${userId}" />
        <input type="hidden" name="reason" value="Banido pelo admin" />
      `;
      document.body.appendChild(form);
      form.submit();
    }
  };

  return (
    <div
      style={{
        backgroundColor: colors.white,
        borderRadius: '8px',
        padding: spacing.xl,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h1
        style={{
          margin: 0,
          marginBottom: spacing.lg,
          fontSize: '24px',
          fontWeight: 600,
          color: colors.gray900,
        }}
      >
        Gestão de Utilizadores
      </h1>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: `2px solid ${colors.gray300}`,
                backgroundColor: colors.gray100,
              }}
            >
              <th
                style={{
                  padding: spacing.md,
                  textAlign: 'left',
                  fontWeight: 600,
                  color: colors.gray900,
                }}
              >
                Email
              </th>
              <th
                style={{
                  padding: spacing.md,
                  textAlign: 'left',
                  fontWeight: 600,
                  color: colors.gray900,
                }}
              >
                Papel
              </th>
              <th
                style={{
                  padding: spacing.md,
                  textAlign: 'left',
                  fontWeight: 600,
                  color: colors.gray900,
                }}
              >
                Estado
              </th>
              <th
                style={{
                  padding: spacing.md,
                  textAlign: 'left',
                  fontWeight: 600,
                  color: colors.gray900,
                }}
              >
                Criado em
              </th>
              <th
                style={{
                  padding: spacing.md,
                  textAlign: 'left',
                  fontWeight: 600,
                  color: colors.gray900,
                }}
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr
                key={u.id}
                style={{
                  borderBottom: `1px solid ${colors.gray300}`,
                }}
              >
                <td style={{ padding: spacing.md, color: colors.gray700 }}>{u.email}</td>
                <td style={{ padding: spacing.md, color: colors.gray700 }}>
                  {u.role === 'admin' ? 'Administrador' : 'Utilizador'}
                </td>
                <td style={{ padding: spacing.md }}>
                  <StatusBadge status={u.status}>
                    {u.status === 'active' ? 'Ativo' : u.status === 'pending' ? 'Pendente' : 'Bloqueado'}
                  </StatusBadge>
                </td>
                <td style={{ padding: spacing.md, color: colors.gray700 }}>
                  {new Date(u.createdAt).toLocaleDateString('pt-PT')}
                </td>
                <td style={{ padding: spacing.md }}>
                  {u.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                      <button
                        onClick={() => handleApprove(u.id)}
                        style={{
                          padding: `${spacing.xs} ${spacing.sm}`,
                          fontSize: '12px',
                          backgroundColor: colors.success,
                          color: colors.white,
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 200ms ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#388E3C';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.success;
                        }}
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleReject(u.id)}
                        style={{
                          padding: `${spacing.xs} ${spacing.sm}`,
                          fontSize: '12px',
                          backgroundColor: colors.critical,
                          color: colors.white,
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 200ms ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#D32F2F';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.critical;
                        }}
                      >
                        Rejeitar
                      </button>
                    </div>
                  ) : u.status === 'active' ? (
                    <button
                      onClick={() => handleBan(u.id)}
                      style={{
                        padding: `${spacing.xs} ${spacing.sm}`,
                        fontSize: '12px',
                        backgroundColor: colors.warning,
                        color: colors.white,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 200ms ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F57C00';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colors.warning;
                      }}
                    >
                      Banir
                    </button>
                  ) : (
                    <span style={{ fontSize: '12px', color: colors.gray600 }}>—</span>
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
