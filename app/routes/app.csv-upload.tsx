import { redirect, json, type LoaderFunctionArgs, type ActionFunction } from '@remix-run/node';
import { useLoaderData, Form, useActionData } from '@remix-run/react';
import { getSession } from '~/lib/session.server';
import { db } from '~/lib/db.server';
import { colors, spacing } from '~/design-system';

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
    <div
      style={{
        backgroundColor: colors.white,
        borderRadius: '8px',
        padding: spacing.xl,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        margin: '0 auto',
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
        Import de Keywords via CSV
      </h1>

      <div
        style={{
          marginBottom: spacing.lg,
          padding: spacing.md,
          backgroundColor: '#E3F2FD',
          borderRadius: '4px',
          borderLeft: `4px solid ${colors.primary}`,
        }}
      >
        <p
          style={{
            margin: 0,
            marginBottom: spacing.sm,
            fontWeight: 600,
            fontSize: '14px',
            color: colors.primary,
          }}
        >
          Formato do CSV:
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            fontFamily: 'monospace',
            color: colors.gray700,
          }}
        >
          keyword,searchVolume,intent
        </p>
        <p
          style={{
            margin: `${spacing.sm} 0 0 0`,
            fontSize: '12px',
            color: colors.gray600,
          }}
        >
          Exemplo: pilha vibrador,1200,commercial
        </p>
      </div>

      <Form
        method="post"
        encType="multipart/form-data"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.md,
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: spacing.sm,
              fontWeight: 600,
              fontSize: '14px',
              color: colors.gray900,
            }}
          >
            Projeto
          </label>
          <select
            name="projectoId"
            required
            style={{
              width: '100%',
              padding: `${spacing.sm} ${spacing.md}`,
              border: `1px solid ${colors.gray300}`,
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
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
          <label
            style={{
              display: 'block',
              marginBottom: spacing.sm,
              fontWeight: 600,
              fontSize: '14px',
              color: colors.gray900,
            }}
          >
            Ficheiro CSV
          </label>
          <input
            type="file"
            name="csvFile"
            accept=".csv"
            required
            style={{
              width: '100%',
              padding: `${spacing.sm} ${spacing.md}`,
              border: `2px dashed ${colors.gray300}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
          <p
            style={{
              margin: `${spacing.sm} 0 0 0`,
              fontSize: '12px',
              color: colors.gray600,
            }}
          >
            Apenas ficheiros CSV permitidos
          </p>
        </div>

        <button
          type="submit"
          style={{
            padding: `${spacing.sm} ${spacing.md}`,
            backgroundColor: colors.success,
            color: colors.white,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
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
          Importar Keywords
        </button>
      </Form>

      {actionData?.success && (
        <div
          style={{
            marginTop: spacing.lg,
            padding: spacing.md,
            backgroundColor: '#E8F5E9',
            borderRadius: '4px',
            borderLeft: `4px solid ${colors.success}`,
          }}
        >
          <p
            style={{
              margin: 0,
              marginBottom: spacing.sm,
              fontWeight: 600,
              fontSize: '14px',
              color: colors.success,
            }}
          >
            Import bem-sucedido!
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: colors.gray700,
            }}
          >
            {actionData.message}
          </p>
        </div>
      )}

      {actionData?.error && (
        <div
          style={{
            marginTop: spacing.lg,
            padding: spacing.md,
            backgroundColor: '#FFEBEE',
            borderRadius: '4px',
            borderLeft: `4px solid ${colors.critical}`,
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: '14px',
              color: colors.critical,
            }}
          >
            {actionData.error}
          </p>
        </div>
      )}
    </div>
  );
}
