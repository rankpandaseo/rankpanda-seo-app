import { Outlet } from '@remix-run/react';
import { Box } from '@shopify/polaris';

export default function AuthLayout() {
  return (
    <Box background="bg-surface-secondary" minHeight="100vh" padding="400">
      <Box maxWidth="400px" marginInline="auto">
        <Outlet />
      </Box>
    </Box>
  );
}
