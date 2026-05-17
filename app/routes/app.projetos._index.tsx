import { redirect, json, type LoaderFunctionArgs, type ActionFunction } from '@remix-run/node';
import { useLoaderData, Form } from '@remix-run/react';
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

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '4px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Meus Projetos</h1>
        <Form method="post" style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            name="shopName"
            placeholder="Nome da loja (ex: vibradores.pt)"
            required
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.9rem',
              minWidth: '250px'
            }}
          />
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
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}
          >
            Criar Projeto
          </button>
        </Form>
      </div>

      {projetos.length === 0 ? (
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Nenhum projeto criado ainda. Preenche o formulário acima para começar.
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
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Nome da Loja</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Keywords</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Criado em</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {projetos.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <a href={`/app/projetos/${p.id}`} style={{ color: '#0071e3', textDecoration: 'none' }}>
                      {p.shopName}
                    </a>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {p.keywords?.length || 0}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      backgroundColor: p.setupCompleted ? '#4CAF50' : '#ff9800',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {p.setupCompleted ? 'Completo' : 'Em Progresso'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {new Date(p.createdAt).toLocaleDateString('pt-PT')}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <a
                      href={`/app/projetos/${p.id}`}
                      style={{
                        padding: '0.35rem 0.7rem',
                        backgroundColor: '#0071e3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        textDecoration: 'none',
                        display: 'inline-block'
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
