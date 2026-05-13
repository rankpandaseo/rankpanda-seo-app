import { useState } from 'react';
import Link from 'next/link';

export default function CSVUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Selecione um ficheiro');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/csv/parse', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setMessage(`Erro: ${data.error}`);
      } else {
        setMessage(`✅ ${data.imported} de ${data.total} palavras-chave importadas`);
        setFile(null);
      }
    } catch (error) {
      setMessage('Erro ao processar ficheiro');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #ddd', padding: '1rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Link href="/dashboard" style={{ color: '#0066cc', textDecoration: 'none' }}>← Voltar ao Dashboard</Link>
          <h1>Importar CSV</h1>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Selecione ficheiro CSV</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>Formato: keyword, searchVolume (opcional), intent (opcional)</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: loading ? '#ccc' : '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
            >
              {loading ? 'A processar...' : 'Importar'}
            </button>
          </form>

          {message && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: message.startsWith('✅') ? '#d1fae5' : '#fee2e2', color: message.startsWith('✅') ? '#065f46' : '#991b1b', borderRadius: '4px' }}>
              {message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
