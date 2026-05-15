import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AppShell, Frame, TopBar } from '@shopify/polaris';
import { getSession, logout } from '../lib/auth';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function ProtectedLayout({ children, title }: ProtectedLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        setUser(session.user);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={{
        actions: [{ items: [{ content: 'Logout', onAction: handleLogout }] }],
        name: user.email,
      }}
    />
  );

  return (
    <Frame topBar={topBarMarkup}>
      <AppShell>
        {children}
      </AppShell>
    </Frame>
  );
}
