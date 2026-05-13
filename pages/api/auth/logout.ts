import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session token from cookie
    const sessionToken = req.cookies.session;

    if (sessionToken) {
      // Delete session from database
      await prisma.session.delete({
        where: { token: sessionToken },
      }).catch(() => {
        // Session might already be deleted, ignore error
      });
    }

    // Clear session cookie
    res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
