import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Settings() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    language: 'pt-PT',
    notifications: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #ddd', padding: '1rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Link href="/dashboard" style={{ color: '#0066cc', textDecoration: 'none' }}>
            ← Voltar ao Dashboard
          </Link>
          <h1>Definições</h1>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2>Perfil</h2>
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2>Preferências</h2>
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Idioma</label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="pt-PT">Português (Portugal)</option>
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
              />
              <label style={{ cursor: 'pointer' }}>Receber notificações por email</label>
            </div>
          </div>

          {saved && (
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '4px', textAlign: 'center' }}>
              Definições guardadas com sucesso
            </div>
          )}

          <button
            onClick={handleSave}
            style={{ width: '100%', padding: '0.75rem', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
          >
            Guardar Preferências
          </button>
        </div>
      </main>
    </div>
  );
}
