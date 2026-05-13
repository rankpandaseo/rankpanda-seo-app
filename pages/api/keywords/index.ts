import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

  if (req.method === 'GET') {
    // Get all keywords for user
    const keywords = await prisma.keyword.findMany({
      where: { userId },
      orderBy: { searchVolume: 'desc' },
    });

    return res.status(200).json({ keywords });
  }

  if (req.method === 'POST') {
    // Import keywords
    const { keywords } = req.body;

    if (!Array.isArray(keywords)) {
      return res.status(400).json({ error: 'Keywords must be an array' });
    }

    let imported = 0;
    for (const kw of keywords) {
      try {
        await prisma.keyword.create({
          data: {
            userId,
            keyword: kw.keyword,
            searchVolume: kw.searchVolume ? parseInt(kw.searchVolume) : null,
            intent: kw.intent || null,
            status: 'active',
          },
        });
        imported++;
      } catch (error) {
        // Skip duplicates or other errors
        console.error('Error importing keyword:', error);
      }
    }

    return res.status(201).json({ imported, total: keywords.length });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
