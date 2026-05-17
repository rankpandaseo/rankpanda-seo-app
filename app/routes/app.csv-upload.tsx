import { redirect, json, type LoaderFunctionArgs, type ActionFunction } from '@remix-run/node';
import { useLoaderData, Form, useActionData } from '@remix-run/react';
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

  return json({ projetos });
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
  const projectoId = formData.get('projectoId') as string;
  const file = formData.get('csvFile') as File;

  if (!projectoId || !file) {
    return json({ error: 'Projeto e ficheiro CSV são obrigatórios' }, { status: 400 });
  }

  const projeto = await db.projeto.findUnique({
    where: { id: projectoId },
  });

  if (!projeto || projeto.userId !== userId) {
    return json({ error: 'Projeto não encontrado' }, { status: 404 });
  }

  try {
    const csv = await file.text();
    const lines = csv.split('\n');

    let imported = 0;
    let errors = 0;

    for (const line of lines) {
      if (!line.trim()) continue;

      const parts = line.split(',').map(p => p.trim());
      const keyword = parts[0];
      const searchVolume = parseInt(parts[1]) || null;
      const intent = parts[2] || null;

      if (!keyword) continue;

      try {
        await db.keywordResearch.create({
          data: {
            projectoId,
            keyword,
            searchVolume,
            intent,
          },
        });
        imported++;
      } catch (e) {
        // Duplicate or other error
        errors++;
      }
    }

    return json({
      success: true,
      imported,
      errors,
      message: `Importadas ${imported} keywords com ${errors} erros`,
    });
  } catch (error: any) {
    return json({ error: `Erro ao processar ficheiro: ${error.message}` }, { status: 400 });
  }
};

export default function CSVUploadPage() {
  const { projetos } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '4px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      maxWidth: '600px'
    }}>
      <h1 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
        Import de Keywords via CSV
      </h1>

      <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '4px', borderLeft: '4px solid #0071e3' }}>
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#0071e3' }}>Formato do CSV:</p>
        <p style={{ margin: 0, fontSize: '0.85rem', fontFamily: 'monospace', color: '#01579b' }}>
          keyword,searchVolume,intent
        </p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#555' }}>
          Exemplo: pilha vibrador,1200,commercial
        </p>
      </div>

      <Form method="post" encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Projeto
          </label>
          <select
            name="projectoId"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.9rem',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Seleciona um projeto...</option>
            {projetos.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.shopName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Ficheiro CSV
          </label>
          <input
            type="file"
            name="csvFile"
            accept=".csv"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '2px dashed #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              boxSizing: 'border-box'
            }}
          />
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#999' }}>
            Apenas ficheiros CSV permitidos
          </p>
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
          Importar Keywords
        </button>
      </Form>

      {actionData?.success && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#e8f5e9', borderRadius: '4px', color: '#2e7d32', borderLeft: '4px solid #4CAF50' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>✅ Import bem-sucedido!</p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            {actionData.message}
          </p>
        </div>
      )}

      {actionData?.error && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828', borderLeft: '4px solid #f44336' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>❌ {actionData.error}</p>
        </div>
      )}
    </div>
  );
}
