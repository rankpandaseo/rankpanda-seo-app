import { redirect, json, type LoaderFunctionArgs, type ActionFunction } from '@remix-run/node';
import { useLoaderData, Form, useState } from '@remix-run/react';
import { getSession } from '~/lib/session.server';
import { db } from '~/lib/db.server';
import { colors, spacing, StatusBadge } from '~/design-system';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('cookie'));
  const userId = session.get('userId');

  if (!userId) {
    return redirect('/auth/login');
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== 'active') {
    return redirect('/auth/login');
  }

  const projetos = await db.projeto.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return json({ projetos, userId });
}

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await getSession(request.headers.get('cookie'));
  const userId = session.get('userId');

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== 'active') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const shopName = formData.get('shopName') as string;

  if (!shopName || shopName.trim() === '') {
    return json({ error: 'Nome da loja é obrigatório' }, { status: 400 });
  }

  try {
    const projeto = await db.projeto.create({
      data: {
        userId,
        shopName: shopName.trim(),
      },
    });

    return redirect(`/app/projetos/${projeto.id}`);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return json({ error: 'Já existe um projeto com este nome' }, { status: 400 });
    }
    return json({ error: 'Erro ao criar projeto' }, { status: 500 });
  }
};

export default function ProjetosPage() {
  const { projetos } = useLoaderData<typeof loader>();
  const [shopName, setShopName] = useState('');

  return (
    <div
      style={{
        backgroundColor: colors.white,
        borderRadius: '8px',
        padding: spacing.xl,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.xl,
          flexWrap: 'wrap',
          gap: spacing.lg,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 600,
            color: colors.gray900,
          }}
        >
          Meus Projetos
        </h1>

        {/* Create Form */}
        <Form
          method="post"
          style={{
            display: 'flex',
            gap: spacing.md,
            alignItems: 'flex-end',
          }}
        >
          <div>
            <input
              type="text"
              name="shopName"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Nome da loja (ex: vibradores.pt)"
              required
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                border: `1px solid ${colors.gray300}`,
                borderRadius: '4px',
                fontSize: '14px',
                minWidth: '250px',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              backgroundColor: colors.primary,
              color: colors.white,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primaryDark;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
            }}
          >
            Criar Projeto
          </button>
        </Form>
      </div>

      {/* Table or Empty State */}
      {projetos.length === 0 ? (
        <p
          style={{
            color: colors.gray700,
            marginBottom: 0,
            fontSize: '14px',
          }}
        >
          Nenhum projeto criado ainda. Preenche o formulário acima para começar.
        </p>
      ) : (
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
                  Nome da Loja
                </th>
                <th
                  style={{
                    padding: spacing.md,
                    textAlign: 'left',
                    fontWeight: 600,
                    color: colors.gray900,
                  }}
                >
                  Keywords
                </th>
                <th
                  style={{
                    padding: spacing.md,
                    textAlign: 'left',
                    fontWeight: 600,
                    color: colors.gray900,
                  }}
                >
                  Status
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
              {projetos.map((p: any) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: `1px solid ${colors.gray300}`,
                  }}
                >
                  <td style={{ padding: spacing.md }}>
                    <a
                      href={`/app/projetos/${p.id}`}
                      style={{
                        color: colors.primary,
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      {p.shopName}
                    </a>
                  </td>
                  <td style={{ padding: spacing.md, color: colors.gray700 }}>
                    {p.keywords?.length || 0}
                  </td>
                  <td style={{ padding: spacing.md }}>
                    <StatusBadge status={p.setupCompleted ? 'active' : 'pending'}>
                      {p.setupCompleted ? 'Completo' : 'Em Progresso'}
                    </StatusBadge>
                  </td>
                  <td style={{ padding: spacing.md, color: colors.gray700 }}>
                    {new Date(p.createdAt).toLocaleDateString('pt-PT')}
                  </td>
                  <td style={{ padding: spacing.md }}>
                    <a
                      href={`/app/projetos/${p.id}`}
                      style={{
                        padding: `${spacing.xs} ${spacing.sm}`,
                        backgroundColor: colors.primary,
                        color: colors.white,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        textDecoration: 'none',
                        display: 'inline-block',
                        fontWeight: 600,
                      }}
                    >
                      Abrir
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
