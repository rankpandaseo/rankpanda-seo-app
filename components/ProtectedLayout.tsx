import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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
    return <div style={{ padding: '20px' }}>Carregando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #e5e5e5', backgroundColor: '#fafafa' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{title || 'Dashboard'}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>{user.email}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f3f3',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
