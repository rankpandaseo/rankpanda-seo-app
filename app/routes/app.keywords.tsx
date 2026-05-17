import { redirect, json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
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

  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const projectoId = url.searchParams.get('projectoId') || '';

  let where: any = { projeto: { userId } };
  if (projectoId) where.projectoId = projectoId;
  if (search) where.keyword = { contains: search, mode: 'insensitive' };

  const keywords = await db.keywordResearch.findMany({
    where,
    include: { projeto: true },
    orderBy: { searchVolume: 'desc' },
    take: 100,
  });

  const projetos = await db.projeto.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return json({ keywords, projetos, search, projectoId });
}

export default function KeywordsPage() {
  const { keywords, projetos, search, projectoId } = useLoaderData<typeof loader>();

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
        Palavras-Chave
      </h1>

      <form
        style={{
          display: 'flex',
          gap: spacing.md,
          marginBottom: spacing.lg,
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Pesquisa por keyword..."
            style={{
              width: '100%',
              padding: `${spacing.sm} ${spacing.md}`,
              border: `1px solid ${colors.gray300}`,
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div>
          <select
            name="projectoId"
            defaultValue={projectoId}
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              border: `1px solid ${colors.gray300}`,
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
          >
            <option value="">Todos os projetos</option>
            {projetos.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.shopName}
              </option>
            ))}
          </select>
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
          Pesquisar
        </button>
      </form>

      {keywords.length === 0 ? (
        <p
          style={{
            color: colors.gray700,
            marginBottom: 0,
            fontSize: '14px',
          }}
        >
          Nenhuma keyword encontrada.
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
                  Keyword
                </th>
                <th
                  style={{
                    padding: spacing.md,
                    textAlign: 'left',
                    fontWeight: 600,
                    color: colors.gray900,
                  }}
                >
                  Projeto
                </th>
                <th
                  style={{
                    padding: spacing.md,
                    textAlign: 'left',
                    fontWeight: 600,
                    color: colors.gray900,
                  }}
                >
                  Volume
                </th>
                <th
                  style={{
                    padding: spacing.md,
                    textAlign: 'left',
                    fontWeight: 600,
                    color: colors.gray900,
                  }}
                >
                  Intent
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
              </tr>
            </thead>
            <tbody>
              {keywords.map((kw: any) => (
                <tr
                  key={kw.id}
                  style={{
                    borderBottom: `1px solid ${colors.gray300}`,
                  }}
                >
                  <td style={{ padding: spacing.md }}>
                    <a
                      href={`/app/projetos/${kw.projectoId}`}
                      style={{
                        color: colors.primary,
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      {kw.keyword}
                    </a>
                  </td>
                  <td style={{ padding: spacing.md, color: colors.gray700 }}>
                    {kw.projeto.shopName}
                  </td>
                  <td style={{ padding: spacing.md, color: colors.gray700 }}>
                    {kw.searchVolume ? kw.searchVolume.toLocaleString('pt-PT') : '—'}
                  </td>
                  <td style={{ padding: spacing.md, color: colors.gray700 }}>
                    {kw.intent || '—'}
                  </td>
                  <td style={{ padding: spacing.md }}>
                    <StatusBadge status={kw.status}>
                      {kw.status === 'active' ? 'Ativo' : 'Pendente'}
                    </StatusBadge>
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
