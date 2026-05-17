import { redirect, json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getSession } from '~/lib/session.server';
import { db } from '~/lib/db.server';

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
    <div style={{
      backgroundColor: 'white',
      borderRadius: '4px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
        Palavras-Chave
      </h1>

      <form style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Pesquisa por keyword..."
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}
        />

        <select
          name="projectoId"
          defaultValue={projectoId}
          style={{
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}
        >
          <option value="">Todos os projetos</option>
          {projetos.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.shopName}
            </option>
          ))}
        </select>

        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0071e3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}
        >
          Pesquisar
        </button>
      </form>

      {keywords.length === 0 ? (
        <p style={{ color: '#666' }}>
          Nenhuma keyword encontrada.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f9f9f9' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Keyword</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Projeto</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Volume</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Intent</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((kw: any) => (
                <tr key={kw.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <a href={`/app/projetos/${kw.projectoId}`} style={{ color: '#0071e3', textDecoration: 'none' }}>
                      {kw.keyword}
                    </a>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{kw.projeto.shopName}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {kw.searchVolume ? kw.searchVolume.toLocaleString('pt-PT') : '—'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>{kw.intent || '—'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      backgroundColor: kw.status === 'active' ? '#4CAF50' : '#ff9800',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {kw.status}
                    </span>
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
