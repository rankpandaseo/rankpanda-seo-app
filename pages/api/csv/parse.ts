import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    const { csv, projectoId } = req.body;

    if (!csv || !projectoId) {
      return res.status(400).json({ error: 'Missing csv or projectoId' });
    }

    // Verify projeto ownership
    const projeto = await prisma.projeto.findUnique({
      where: { id: projectoId },
    });

    if (!projeto || projeto.userId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const lines = csv.split('\n');
    const keywords = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      keywords.push({
        keyword: line.trim(),
        searchVolume: null,
        intent: null,
      });
    }

    for (const kw of keywords) {
      try {
        await prisma.keywordResearch.create({
          data: {
            projectoId,
            keyword: kw.keyword,
            searchVolume: kw.searchVolume || null,
            intent: kw.intent || null,
          },
        });
      } catch (e: any) {
        if (e.code === 'P2002') {
          continue;
        }
        throw e;
      }
    }

    res.status(200).json({ success: true, imported: keywords.length });
  } catch (error) {
    console.error('CSV parse error:', error);
    res.status(500).json({ error: 'Failed to parse CSV' });
  }
}
