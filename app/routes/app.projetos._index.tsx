import { Card, Box, Text, Button } from '@shopify/polaris';

export default function ProjetosPage() {
  return (
    <Card>
      <Box paddingBlockEnd="300">
        <Text as="h1" variant="headingLg">
          Meus Projetos
        </Text>
      </Box>
      <Box paddingBlockEnd="300">
        <Text as="p" variant="bodyMd">
          Nenhum projeto criado ainda.
        </Text>
      </Box>
      <Button primary>Criar Projeto</Button>
    </Card>
  );
}
