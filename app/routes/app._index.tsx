import { useOutletContext } from '@remix-run/react';
import { colors, spacing } from '~/design-system';

export default function DashboardPage() {
  const { user } = useOutletContext<{ user: any }>();

  return (
    <div
      style={{
        backgroundColor: colors.white,
        borderRadius: '8px',
        padding: spacing.xl,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
        Bem-vindo, {user.email}!
      </h1>
      <p
        style={{
          color: colors.gray700,
          margin: 0,
          fontSize: '14px',
          lineHeight: 1.5,
        }}
      >
        Utiliza o menu à esquerda para navegar na aplicação.
      </p>
    </div>
  );
}
