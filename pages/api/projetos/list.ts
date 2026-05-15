import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session: token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const sessionRecord = await prisma.session.findUnique({
      where: { token },
    });

    if (!sessionRecord) {
      return res.status(401).json({ error: 'Session expired' });
    }

    const projetos = await prisma.projeto.findMany({
      where: { userId: sessionRecord.userId },
    });

    return res.status(200).json(projetos);
  } catch (error) {
    console.error('Error fetching projetos:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
