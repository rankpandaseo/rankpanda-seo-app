
export default function ProjetosPage() {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '4px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ marginTop: 0, marginBottom: '1rem' }}>
        Meus Projetos
      </h1>
      <p style={{ color: '#666', marginBottom: '1rem' }}>
        Nenhum projeto criado ainda.
      </p>
      <button style={{
        padding: '0.75rem 1rem',
        backgroundColor: '#0071e3',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold'
      }}>
        Criar Projeto
      </button>
    </div>
  );
}
