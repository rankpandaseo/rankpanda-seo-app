import { redirect, json, type LoaderFunctionArgs, type ActionFunction } from '@remix-run/node';
import { useLoaderData, Form, useActionData } from '@remix-run/react';
import { getSession } from '~/lib/session.server';
import { db } from '~/lib/db.server';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('cookie'));
  const userId = session.get('userId');

  if (!userId || !params.id) {
    return redirect('/auth/login');
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== 'active') {
    return redirect('/auth/login');
  }

  const projeto = await db.projeto.findUnique({
    where: { id: params.id },
    include: { keywords: { orderBy: { createdAt: 'desc' } } },
  });

  if (!projeto || projeto.userId !== userId) {
    return redirect('/app/projetos');
  }

  return json({ projeto });
}

export const action: ActionFunction = async ({ request, params }) => {
  if (!['POST', 'PUT', 'DELETE'].includes(request.method)) {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const session = await getSession(request.headers.get('cookie'));
  const userId = session.get('userId');

  if (!userId || !params.id) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== 'active') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projeto = await db.projeto.findUnique({ where: { id: params.id } });
  if (!projeto || projeto.userId !== userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const actionType = formData.get('_action') as string;

  if (actionType === 'update') {
    const businessContext = formData.get('businessContext') as string;
    const businessKeywords = formData.get('businessKeywords') as string;
    const voiceTone = formData.get('voiceTone') as string;

    const updated = await db.projeto.update({
      where: { id: params.id },
      data: {
        businessContext: businessContext || null,
        businessKeywords: businessKeywords || null,
        voiceTone: voiceTone || null,
      },
    });

    return json({ updated, success: true });
  }

  if (actionType === 'addKeyword') {
    const keyword = formData.get('keyword') as string;

    if (!keyword || keyword.trim() === '') {
      return json({ error: 'Keyword é obrigatória' }, { status: 400 });
    }

    try {
      await db.keywordResearch.create({
        data: {
          projectoId: params.id,
          keyword: keyword.trim(),
        },
      });

      return json({ success: true });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return json({ error: 'Esta keyword já existe neste projeto' }, { status: 400 });
      }
      return json({ error: 'Erro ao adicionar keyword' }, { status: 500 });
    }
  }

  return json({ error: 'Invalid action' }, { status: 400 });
};

export default function ProjetoDetailPage() {
  const { projeto } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    }}>
      {/* Detalhe do Projeto */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '4px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
          {projeto.shopName}
        </h2>

        <Form method="post" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="hidden" name="_action" value="update" />

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Contexto do Negócio
            </label>
            <textarea
              name="businessContext"
              defaultValue={projeto.businessContext || ''}
              placeholder="Descreve brevemente o teu negócio..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Keywords Principais
            </label>
            <textarea
              name="businessKeywords"
              defaultValue={projeto.businessKeywords || ''}
              placeholder="Palavras-chave principais (separadas por vírgula)..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Tom de Voz
            </label>
            <input
              type="text"
              name="voiceTone"
              defaultValue={projeto.voiceTone || ''}
              placeholder="Ex: profissional, casual, amigável..."
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            Guardar Alterações
          </button>

          {actionData?.success && (
            <div style={{ padding: '0.75rem', backgroundColor: '#e8f5e9', borderRadius: '4px', color: '#2e7d32' }}>
              ✅ Projeto atualizado com sucesso
            </div>
          )}
        </Form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Informações</h3>
          <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#666' }}>
            Criado em: {new Date(projeto.createdAt).toLocaleDateString('pt-PT')}
          </p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#666' }}>
            ID: <code style={{ backgroundColor: '#f5f5f5', padding: '0.25rem 0.5rem', borderRadius: '2px' }}>{projeto.id}</code>
          </p>
        </div>
      </div>

      {/* Keywords */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '4px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>
          Keywords ({projeto.keywords.length})
        </h2>

        <Form method="post" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input type="hidden" name="_action" value="addKeyword" />
          <input
            type="text"
            name="keyword"
            placeholder="Adiciona uma keyword..."
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.9rem'
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
              fontWeight: 'bold'
            }}
          >
            Adicionar
          </button>
        </Form>

        {actionData?.error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828', marginBottom: '1rem' }}>
            ❌ {actionData.error}
          </div>
        )}

        {projeto.keywords.length === 0 ? (
          <p style={{ color: '#999', fontSize: '0.9rem' }}>
            Nenhuma keyword adicionada ainda.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {projeto.keywords.map((kw: any) => (
              <div
                key={kw.id}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '4px',
                  border: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <p style={{ margin: '0 0 0.25rem 0', fontWeight: '500' }}>
                    {kw.keyword}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#999' }}>
                    Status: {kw.status}
                    {kw.searchVolume && ` • Vol: ${kw.searchVolume}`}
                  </p>
                </div>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: kw.status === 'active' ? '#e8f5e9' : '#fff3e0',
                  borderRadius: '3px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  color: kw.status === 'active' ? '#2e7d32' : '#e65100'
                }}>
                  {kw.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
