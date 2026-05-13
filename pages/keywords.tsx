import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Keyword {
  id: string;
  keyword: string;
  searchVolume?: number;
  intent?: string;
  status: string;
}

export default function Keywords() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      const res = await fetch('/api/keywords');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setKeywords(data.keywords || []);
    } catch (error) {
      console.error('Error fetching keywords:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteKeyword = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar?')) return;
    try {
      const res = await fetch(`/api/keywords/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setKeywords((prev) => prev.filter((k) => k.id !== id));
    } catch (error) {
      console.error('Error deleting keyword:', error);
      alert('Erro ao apagar palavra-chave');
    }
  };

  const filteredKeywords = keywords.filter((k) =>
    k.keyword.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #ddd', padding: '1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Link href="/dashboard" style={{ color: '#0066cc', textDecoration: 'none' }}>← Voltar ao Dashboard</Link>
          <h1>Palavras-chave</h1>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Pesquisar palavras-chave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' }}
          />
        </div>

        {loading ? (
          <div>Carregando...</div>
        ) : filteredKeywords.length === 0 ? (
          <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
            Nenhuma palavra-chave encontrada
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Palavra-chave</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Volume</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Intenção</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredKeywords.map((kw) => (
                  <tr key={kw.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>{kw.keyword}</td>
                    <td style={{ padding: '1rem' }}>{kw.searchVolume || '-'}</td>
                    <td style={{ padding: '1rem' }}>{kw.intent || '-'}</td>
                    <td style={{ padding: '1rem' }}>{kw.status}</td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => deleteKeyword(kw.id)}
                        style={{ padding: '0.25rem 0.75rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        Apagar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
