import { colors, spacing } from '~/design-system/tokens';

interface NavItem {
  label: string;
  href: string;
}

interface AdminFrameProps {
  children: React.ReactNode;
  navItems: NavItem[];
  activeNav?: string;
}

export function AdminFrame({ children, navItems, activeNav }: AdminFrameProps) {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: colors.white,
      }}
    >
      {/* Sidebar - with red admin accent */}
      <div
        style={{
          width: '280px',
          backgroundColor: colors.white,
          borderRight: `1px solid ${colors.gray300}`,
          borderLeft: `4px solid ${colors.critical}`,
          display: 'flex',
          flexDirection: 'column',
          padding: spacing.lg,
        }}
      >
        <div
          style={{
            marginBottom: spacing.lg,
            paddingBottom: spacing.lg,
            borderBottom: `1px solid ${colors.gray300}`,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: colors.critical,
            }}
          >
            Painel de Administração
          </h2>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: `${spacing.md} ${spacing.md}`,
                color: activeNav?.includes(item.href) ? colors.critical : colors.gray900,
                textDecoration: 'none',
                borderRadius: '4px',
                marginBottom: spacing.sm,
                backgroundColor: activeNav?.includes(item.href) ? '#FFEBEE' : 'transparent',
                fontWeight: activeNav?.includes(item.href) ? 600 : 500,
                transition: 'all 200ms ease',
                borderLeft: activeNav?.includes(item.href) ? `3px solid ${colors.critical}` : '3px solid transparent',
                paddingLeft: `calc(${spacing.md} - 3px)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFEBEE';
              }}
              onMouseLeave={(e) => {
                if (!activeNav?.includes(item.href)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: spacing.lg,
            borderBottom: `1px solid ${colors.gray300}`,
            backgroundColor: colors.gray50,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 600,
              color: colors.gray900,
            }}
          >
            RankPanda SEO
          </h1>
          <a
            href="/auth/logout"
            style={{
              color: colors.gray700,
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: '4px',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.gray200;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Sair
          </a>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            padding: spacing.lg,
            overflow: 'auto',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
