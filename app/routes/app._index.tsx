import { useOutletContext } from '@remix-run/react';
import { Card, Box, Text } from '@shopify/polaris';

export default function DashboardPage() {
  const { user } = useOutletContext<{ user: any }>();

  return (
    <Card>
      <Box paddingBlockEnd="300">
        <Text as="h1" variant="headingLg">
          Bem-vindo, {user.email}!
        </Text>
      </Box>
      <Box paddingBlockEnd="300">
        <Text as="p" variant="bodyMd">
          Utiliza o menu à esquerda para navegar na aplicação.
        </Text>
      </Box>
    </Card>
  );
}
