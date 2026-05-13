import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    DATABASE_URL: process.env.DATABASE_URL ? '✅ set' : '❌ not set',
    NODE_ENV: process.env.NODE_ENV,
  });
}
