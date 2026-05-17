import { useOutletContext } from '@remix-run/react';

export default function DashboardPage() {
  const { user } = useOutletContext<{ user: any }>();

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '4px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ marginTop: 0, marginBottom: '1rem' }}>
        Bem-vindo, {user.email}!
      </h1>
      <p style={{ color: '#666', marginBottom: 0 }}>
        Utiliza o menu à esquerda para navegar na aplicação.
      </p>
    </div>
  );
}
