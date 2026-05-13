import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

// Simple CSV parser
function parseCSV(content: string) {
  const lines = content.trim().split('\n');
  const keywords = [];

  for (let i = 1; i < lines.length; i++) {
    // Skip header and empty lines
    if (!lines[i].trim()) continue;

    const [keyword, searchVolume, intent] = lines[i].split(',').map((s) => s.trim());

    if (keyword) {
      keywords.push({
        keyword,
        searchVolume: searchVolume ? parseInt(searchVolume) : undefined,
        intent: intent || undefined,
      });
    }
  }

  return keywords;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
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

  try {
    // For simplicity, we'll extract CSV from the request body
    // In a real app, you'd use multer or similar for file uploads
    const { csvContent } = req.body;

    if (!csvContent) {
      return res.status(400).json({ error: 'CSV content required' });
    }

    // Parse CSV
    const keywords = parseCSV(csvContent);

    if (keywords.length === 0) {
      return res.status(400).json({ error: 'No keywords found in CSV' });
    }

    // Import keywords
    let imported = 0;
    for (const kw of keywords) {
      try {
        await prisma.keyword.create({
          data: {
            userId,
            keyword: kw.keyword,
            searchVolume: kw.searchVolume || null,
            intent: kw.intent || null,
            status: 'active',
          },
        });
        imported++;
      } catch (error) {
        // Skip duplicates
        console.error('Error importing keyword:', error);
      }
    }

    return res.status(201).json({
      imported,
      total: keywords.length,
      message: `Importadas ${imported} de ${keywords.length} palavras-chave`,
    });
  } catch (error) {
    console.error('Error processing CSV:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
