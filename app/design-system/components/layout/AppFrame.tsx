/**
 * AppFrame Component — Root layout with sidebar navigation
 * Responsive design: sidebar visible on desktop, hamburger on mobile
 */

import React, { useState } from 'react';
import { spacing, colors } from '../../tokens';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

interface AppFrameProps {
  children: React.ReactNode;
  activeNav?: string;
  isAdmin?: boolean;
  navItems?: NavItem[];
}

export const AppFrame: React.FC<AppFrameProps> = ({
  children,
  activeNav,
  isAdmin = false,
  navItems = [],
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarBorderColor = isAdmin ? colors.adminAccent : colors.primary;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: colors.gray100,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            display: 'none',
            '@media (max-width: 768px)': {
              display: 'block',
            },
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          backgroundColor: colors.white,
          borderRight: `4px solid ${sidebarBorderColor}`,
          padding: spacing.lg,
          overflow: 'auto',
          position: 'relative',
          zIndex: 999,
          display: 'block',
          transition: 'transform 300ms ease',
          '@media (max-width: 768px)': {
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          },
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: spacing.lg,
            fontSize: '18px',
            fontWeight: 600,
            color: colors.gray900,
          }}
        >
          RankPanda
        </h1>

        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.sm,
          }}
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                borderRadius: '4px',
                color: activeNav === item.href ? colors.primary : colors.gray700,
                backgroundColor:
                  activeNav === item.href ? colors.primaryLight : 'transparent',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: activeNav === item.href ? 600 : 400,
                transition: 'all 200ms ease',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing.md,
              }}
              onMouseEnter={(e) => {
                if (activeNav !== item.href) {
                  e.currentTarget.style.backgroundColor = colors.gray100;
                }
              }}
              onMouseLeave={(e) => {
                if (activeNav !== item.href) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <header
          style={{
            backgroundColor: colors.white,
            borderBottom: `1px solid ${colors.gray300}`,
            padding: spacing.lg,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: spacing.lg,
          }}
        >
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: colors.gray700,
              padding: '4px 8px',
              '@media (max-width: 768px)': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          <div style={{ flex: 1 }} />

          {/* Admin Badge */}
          {isAdmin && (
            <span
              style={{
                padding: `${spacing.xs} ${spacing.sm}`,
                backgroundColor: colors.adminAccent,
                color: colors.white,
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Admin
            </span>
          )}
        </header>

        {/* Content Area */}
        <main
          style={{
            flex: 1,
            overflow: 'auto',
            padding: spacing.lg,
          }}
        >
          {children}
        </main>
      </div>

      {/* Mobile styles via inline media queries */}
      <style>{`
        @media (max-width: 768px) {
          aside {
            width: 240px !important;
          }
          [role="main"] {
            padding: ${spacing.md} !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AppFrame;
