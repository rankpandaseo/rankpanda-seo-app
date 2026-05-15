import { redirect, json, type LoaderFunctionArgs, type ActionFunction } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { Card, Box, Text, IndexTable, Badge } from '@shopify/polaris';
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
      <Card>
        <Text as="p" variant="bodyMd">
          Não tens permissão para aceder a esta página.
        </Text>
      </Card>
    );
  }

  const rows = users.map((u: any) => {
    const statusColor = u.status === 'active' ? 'success' : u.status === 'pending' ? 'warning' : 'critical';

    return (
      <IndexTable.Row key={u.id} id={u.id}>
        <IndexTable.Cell>{u.email}</IndexTable.Cell>
        <IndexTable.Cell>{u.role}</IndexTable.Cell>
        <IndexTable.Cell>
          <Badge progress={statusColor}>{u.status}</Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>{new Date(u.createdAt).toLocaleDateString('pt-PT')}</IndexTable.Cell>
        <IndexTable.Cell>
          {u.status === 'pending' && (
            <Box display="flex" gap="200">
              <form method="POST" style={{ display: 'inline' }}>
                <input type="hidden" name="action" value="approve" />
                <input type="hidden" name="userId" value={u.id} />
                <button type="submit" style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Aprovar
                </button>
              </form>
              <form method="POST" style={{ display: 'inline' }}>
                <input type="hidden" name="action" value="reject" />
                <input type="hidden" name="userId" value={u.id} />
                <button type="submit" style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Rejeitar
                </button>
              </form>
            </Box>
          )}
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <Card>
      <Box paddingBlockEnd="300">
        <Text as="h1" variant="headingLg">
          Gestão de Utilizadores
        </Text>
      </Box>

      <IndexTable
        resourceName={{ singular: 'utilizador', plural: 'utilizadores' }}
        itemCount={users.length}
        headings={[
          { title: 'Email' },
          { title: 'Papel' },
          { title: 'Estado' },
          { title: 'Criado em' },
          { title: 'Ações' },
        ]}
      >
        {rows}
      </IndexTable>
    </Card>
  );
}
