import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session token from cookie
    const sessionToken = req.cookies.session;

    if (!sessionToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Find session
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      // Delete expired session
      await prisma.session.delete({
        where: { token: sessionToken },
      });
      return res.status(401).json({ error: 'Session expired' });
    }

    return res.status(200).json({
      user: {
        id: session.user.id,
        email: session.user.email,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
