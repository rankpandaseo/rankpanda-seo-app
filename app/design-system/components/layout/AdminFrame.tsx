import { colors, spacing } from '~/design-system/tokens';

interface AdminFrameProps {
  children: React.ReactNode;
  navItems: Array<{ label: string; href: string }>;
  activeNav?: string;
}

export function AdminFrame({ children, navItems, activeNav }: AdminFrameProps) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: colors.gray100,
      }}
    >
      {/* Admin Sidebar - with red accent border */}
      <div
        style={{
          width: '240px',
          backgroundColor: colors.gray900,
          color: colors.white,
          padding: spacing.lg,
          borderLeft: `4px solid #D32F2F`,
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            marginBottom: spacing.xl,
            paddingBottom: spacing.lg,
            borderBottom: `1px solid ${colors.gray700}`,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: colors.white,
            }}
          >
            Admin
          </h2>
          <p
            style={{
              margin: `${spacing.xs} 0 0 0`,
              fontSize: '12px',
              color: colors.gray400,
            }}
          >
            Gestão do sistema
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                color: activeNav === item.href ? '#D32F2F' : colors.gray300,
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: activeNav === item.href ? 600 : 400,
                borderRadius: '4px',
                backgroundColor: activeNav === item.href ? 'rgba(211, 47, 47, 0.1)' : 'transparent',
                transition: 'all 200ms ease',
                display: 'block',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  activeNav === item.href ? 'rgba(211, 47, 47, 0.1)' : 'transparent';
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div
          style={{
            marginTop: spacing.xl,
            paddingTop: spacing.lg,
            borderTop: `1px solid ${colors.gray700}`,
          }}
        >
          <a
            href="/app"
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              color: colors.gray400,
              textDecoration: 'none',
              fontSize: '12px',
              display: 'block',
              borderRadius: '4px',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = colors.white;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = colors.gray400;
            }}
          >
            Voltar ao App
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: colors.white,
            borderBottom: `1px solid ${colors.gray300}`,
            padding: `${spacing.md} ${spacing.lg}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              color: colors.gray600,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Painel de Administração
          </p>
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            padding: spacing.xl,
            overflow: 'auto',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
