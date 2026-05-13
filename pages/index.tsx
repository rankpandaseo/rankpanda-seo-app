import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/auth/session')
      .then((res) => {
        if (res.ok) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return null;
}
