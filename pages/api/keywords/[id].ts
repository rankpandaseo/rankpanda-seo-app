import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cookies = req.headers.cookie || '';
  const sessionToken = cookies
    .split(';')
    .find((c) => c.trim().startsWith('session='))
    ?.split('=')[1];

  if (!sessionToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return res.status(401).json({ error: 'Session expired' });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing id' });
    }

    const keyword = await prisma.keywordResearch.findUnique({
      where: { id },
      include: { projeto: true },
    });

    if (!keyword || keyword.projeto.userId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.keywordResearch.delete({
      where: { id },
    });

    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
