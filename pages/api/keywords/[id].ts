import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get session from cookie
  const sessionToken = req.cookies.session;
  if (!sessionToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Verify session
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
  });

  if (!session || new Date() > session.expiresAt) {
    return res.status(401).json({ error: 'Session expired' });
  }

  const userId = session.userId;
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Keyword ID is required' });
  }

  try {
    // Verify keyword belongs to user
    const keyword = await prisma.keyword.findUnique({
      where: { id },
    });

    if (!keyword || keyword.userId !== userId) {
      return res.status(404).json({ error: 'Keyword not found' });
    }

    // Delete keyword
    await prisma.keyword.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Keyword deleted' });
  } catch (error) {
    console.error('Error deleting keyword:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
