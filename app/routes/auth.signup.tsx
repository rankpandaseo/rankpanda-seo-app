import { useState } from 'react';
import { redirect, json, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { useActionData, Form, useNavigation } from '@remix-run/react';
import { Card, TextField, Button, FormLayout, Page, Layout, Text, Box } from '@shopify/polaris';
import { getSession } from '~/lib/session.server';
import { hashPassword } from '~/lib/auth.server';
import { db } from '~/lib/db.server';

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));
  if (session.has('userId')) {
    return redirect('/app');
  }
  return null;
};

type ActionData = {
  error?: string;
  success?: boolean;
};

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!email || !password || !confirmPassword) {
    return json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return json({ error: 'As passwords não correspondem' }, { status: 400 });
  }

  if (password.length < 8) {
    return json({ error: 'A password deve ter pelo menos 8 caracteres' }, { status: 400 });
  }

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return json({ error: 'Este email já está registado' }, { status: 400 });
  }

  const hashedPassword = await hashPassword(password);

  try {
    await db.user.create({
      data: {
        email,
        password: hashedPassword,
        status: 'pending',
        role: 'user',
      },
    });

    return json({ success: true } as ActionData);
  } catch (error) {
    return json({ error: 'Erro ao criar conta' }, { status: 500 });
  }
};

export default function SignupPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isSubmitting = navigation.state === 'submitting';

  if (actionData?.success) {
    return (
      <Page>
        <Layout>
          <Layout.Section>
            <Card>
              <Box paddingBlockEnd="400">
                <Text as="h1" variant="headingLg">
                  Conta criada com sucesso!
                </Text>
              </Box>
              <Box paddingBlockEnd="300">
                <Text as="p" variant="bodyMd">
                  A tua conta foi criada e está em análise. Um administrador aprovará o teu
                  acesso em breve.
                </Text>
              </Box>
              <Button url="/auth/login" primary>
                Ir para Login
              </Button>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <Box paddingBlockEnd="400">
              <Text as="h1" variant="headingLg">
                Criar Conta
              </Text>
            </Box>

            <Form method="POST">
              <FormLayout>
                <TextField
                  label="Email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  disabled={isSubmitting}
                />

                <TextField
                  label="Password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  helpText="Mínimo 8 caracteres"
                />

                <TextField
                  label="Confirmar Password"
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />

                {actionData?.error && (
                  <Box paddingBlockEnd="300">
                    <Text as="p" variant="bodyMd" tone="critical">
                      {actionData.error}
                    </Text>
                  </Box>
                )}

                <Box paddingBlockStart="300">
                  <Button type="submit" primary loading={isSubmitting}>
                    Criar Conta
                  </Button>
                </Box>

                <Box paddingBlockStart="200">
                  <Text as="p" variant="bodySm">
                    Já tens conta? <a href="/auth/login">Entra aqui</a>
                  </Text>
                </Box>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
