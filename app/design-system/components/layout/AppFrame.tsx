/**
 * AppFrame — Root layout component for authenticated users
 * Provides sidebar navigation and main content area
 */

import React from 'react';
import { spacing, colors } from '../../tokens';

interface AppFrameProps {
  children: React.ReactNode;
  userEmail?: string;
  userRole?: string;
  activeNav?: string;
  isAdmin?: boolean;
  onLogout?: () => void;
}

export const AppFrame: React.FC<AppFrameProps> = ({
  children,
  userEmail = 'User',
  userRole = 'user',
  activeNav,
  isAdmin = false,
  onLogout,
}) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.gray100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: spacing.lg,
          backgroundColor: colors.white,
          borderBottom: `1px solid ${colors.gray300}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: `0 1px 3px rgba(0,0,0,0.1)`,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 600,
            color: colors.primary,
          }}
        >
          RankPanda SEO
        </h1>
        <div
          style={{
            display: 'flex',
            gap: spacing.lg,
            alignItems: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: colors.gray700,
            }}
          >
            {userEmail} ({userRole})
          </p>
          {onLogout && (
            <form method="POST" action="/auth/logout" style={{ margin: 0 }}>
              <button
                type="submit"
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  backgroundColor: colors.primary,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primaryDark;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                Logout
              </button>
            </form>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside
          style={{
            backgroundColor: colors.white,
            borderRight: `1px solid ${colors.gray300}`,
            padding: spacing.lg,
            minWidth: '200px',
            boxShadow: isAdmin ? `inset -4px 0 0 ${colors.critical}` : undefined,
          }}
        >
          <nav>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
              }}
            >
              <li style={{ marginBottom: spacing.sm }}>
                <a
                  href="/app/projetos"
                  style={{
                    display: 'block',
                    padding: `${spacing.sm} ${spacing.md}`,
                    textDecoration: 'none',
                    color: activeNav === 'projetos' ? colors.primary : colors.gray700,
                    borderRadius: '6px',
                    backgroundColor: activeNav === 'projetos' ? colors.primaryLight : 'transparent',
                    fontWeight: activeNav === 'projetos' ? 600 : 400,
                    fontSize: '14px',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (activeNav !== 'projetos') {
                      e.currentTarget.style.backgroundColor = colors.gray100;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeNav !== 'projetos') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  Projetos
                </a>
              </li>
              <li style={{ marginBottom: spacing.sm }}>
                <a
                  href="/app/keywords"
                  style={{
                    display: 'block',
                    padding: `${spacing.sm} ${spacing.md}`,
                    textDecoration: 'none',
                    color: activeNav === 'keywords' ? colors.primary : colors.gray700,
                    borderRadius: '6px',
                    backgroundColor: activeNav === 'keywords' ? colors.primaryLight : 'transparent',
                    fontWeight: activeNav === 'keywords' ? 600 : 400,
                    fontSize: '14px',
                    transition: 'all 200ms ease',
                  }}
                >
                  Palavras-Chave
                </a>
              </li>
              <li style={{ marginBottom: spacing.sm }}>
                <a
                  href="/app/csv-upload"
                  style={{
                    display: 'block',
                    padding: `${spacing.sm} ${spacing.md}`,
                    textDecoration: 'none',
                    color: activeNav === 'csv' ? colors.primary : colors.gray700,
                    borderRadius: '6px',
                    backgroundColor: activeNav === 'csv' ? colors.primaryLight : 'transparent',
                    fontWeight: activeNav === 'csv' ? 600 : 400,
                    fontSize: '14px',
                    transition: 'all 200ms ease',
                  }}
                >
                  Upload CSV
                </a>
              </li>
              <li style={{ marginBottom: spacing.sm }}>
                <a
                  href="/app/settings"
                  style={{
                    display: 'block',
                    padding: `${spacing.sm} ${spacing.md}`,
                    textDecoration: 'none',
                    color: activeNav === 'settings' ? colors.primary : colors.gray700,
                    borderRadius: '6px',
                    backgroundColor: activeNav === 'settings' ? colors.primaryLight : 'transparent',
                    fontWeight: activeNav === 'settings' ? 600 : 400,
                    fontSize: '14px',
                    transition: 'all 200ms ease',
                  }}
                >
                  Definições
                </a>
              </li>

              {isAdmin && (
                <>
                  <li
                    style={{
                      marginTop: spacing.lg,
                      marginBottom: spacing.sm,
                      paddingLeft: spacing.md,
                      fontWeight: 600,
                      fontSize: '12px',
                      color: colors.gray600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Admin
                  </li>
                  <li style={{ marginBottom: spacing.sm }}>
                    <a
                      href="/app/admin/users"
                      style={{
                        display: 'block',
                        padding: `${spacing.sm} ${spacing.md}`,
                        textDecoration: 'none',
                        color: activeNav === 'users' ? colors.critical : colors.gray700,
                        borderRadius: '6px',
                        backgroundColor: activeNav === 'users' ? '#FFEBEE' : 'transparent',
                        fontWeight: activeNav === 'users' ? 600 : 400,
                        fontSize: '14px',
                        transition: 'all 200ms ease',
                      }}
                    >
                      Utilizadores
                    </a>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            padding: spacing.lg,
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppFrame;
