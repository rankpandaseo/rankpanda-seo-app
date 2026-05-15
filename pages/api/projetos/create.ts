import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
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

    const projeto = await prisma.projeto.create({
      data: {
        userId: sessionRecord.userId,
        shopName: req.body.shopName,
        businessContext: req.body.businessContext,
        businessKeywords: req.body.businessKeywords,
        merchantCenterCategories: req.body.merchantCenterCategories,
        voiceTone: req.body.voiceTone,
        ga4PropertyId: req.body.ga4PropertyId,
        gscPropertyUrl: req.body.gscPropertyUrl,
        bingWebmasterToken: req.body.bingWebmasterToken,
        seRankingApiKey: req.body.seRankingApiKey,
        setupCompleted: true,
      },
    });

    return res.status(201).json(projeto);
  } catch (error) {
    console.error('Error creating projeto:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
