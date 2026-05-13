import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch current session
    fetch('/api/auth/session')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => {
        // Redirect to login if not authenticated
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #ddd', padding: '1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>RankPanda SEO</h1>
          <div>
            <span>{user?.email}</span>
            <button
              onClick={handleLogout}
              style={{ marginLeft: '1rem', padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Keywords Card */}
          <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2>Palavras-chave</h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>Gerir e analisar palavras-chave</p>
            <Link href="/keywords">
              <button style={{ width: '100%', padding: '0.75rem', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Aceder às Palavras-chave
              </button>
            </Link>
          </div>

          {/* CSV Upload Card */}
          <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2>Importar CSV</h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>Importar palavras-chave de ficheiro CSV</p>
            <Link href="/csv-upload">
              <button style={{ width: '100%', padding: '0.75rem', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Importar CSV
              </button>
            </Link>
          </div>

          {/* Settings Card */}
          <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2>Definições</h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>Configurar preferências</p>
            <Link href="/settings">
              <button style={{ width: '100%', padding: '0.75rem', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Aceder às Definições
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
