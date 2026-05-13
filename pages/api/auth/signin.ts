import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { comparePassword, generateSessionToken, getSessionExpiry } from '@/lib/auth';
import { validateEmail, validatePassword } from '@/lib/validation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ error: emailError.message });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const passwordMatches = await comparePassword(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create session
    const token = generateSessionToken();
    const expiresAt = getSessionExpiry();

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Set session cookie (HttpOnly, Secure, SameSite)
    res.setHeader(
      'Set-Cookie',
      `session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}`
    );

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
      },
      redirectUrl: '/dashboard',
    });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
