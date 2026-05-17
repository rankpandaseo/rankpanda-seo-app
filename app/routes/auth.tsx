import { Outlet } from '@remix-run/react';

export default function AuthLayout() {
  return (
    <div style={{
      background: '#f3f3f3',
      minHeight: '100vh',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <Outlet />
      </div>
    </div>
  );
}
