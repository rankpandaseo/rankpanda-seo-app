import { useState } from 'react';
import { redirect, json, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { useActionData, Form, useNavigation, useSearchParams } from '@remix-run/react';
import { Card, TextField, Button, FormLayout, Page, Layout, Text, Box, Banner } from '@shopify/polaris';
import { getSession, commitSession } from '~/lib/session.server';
import { verifyPassword } from '~/lib/auth.server';
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
};

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return json({ error: 'Email e password são obrigatórios' }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return json({ error: 'Email ou password incorretos' }, { status: 401 });
  }

  const passwordValid = await verifyPassword(password, user.password);
  if (!passwordValid) {
    return json({ error: 'Email ou password incorretos' }, { status: 401 });
  }

  if (user.status === 'pending') {
    return json(
      { error: 'A tua conta está em análise. Um administrador irá aprová-la em breve.' },
      { status: 403 }
    );
  }

  if (user.status === 'banned') {
    return json({ error: 'A tua conta foi bloqueada.' }, { status: 403 });
  }

  const session = await getSession(request.headers.get('Cookie'));
  session.set('userId', user.id);

  return redirect('/app', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

export default function LoginPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isSubmitting = navigation.state === 'submitting';
  const accessDenied = searchParams.get('error') === 'access_denied';

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <Box paddingBlockEnd="400">
              <Text as="h1" variant="headingLg">
                Login
              </Text>
            </Box>

            {accessDenied && (
              <Box paddingBlockEnd="300">
                <Banner status="critical">
                  <Text as="p" variant="bodyMd">
                    A tua sessão expirou. Por favor, entra novamente.
                  </Text>
                </Banner>
              </Box>
            )}

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
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />

                {actionData?.error && (
                  <Box paddingBlockEnd="300">
                    <Banner status="critical">
                      <Text as="p" variant="bodyMd">
                        {actionData.error}
                      </Text>
                    </Banner>
                  </Box>
                )}

                <Box paddingBlockStart="300">
                  <Button type="submit" primary loading={isSubmitting}>
                    Entrar
                  </Button>
                </Box>

                <Box paddingBlockStart="200">
                  <Text as="p" variant="bodySm">
                    Não tens conta? <a href="/auth/signup">Regista-te aqui</a>
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
