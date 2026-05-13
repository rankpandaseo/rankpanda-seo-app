import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { hashPassword, generateSessionToken, getSessionExpiry } from '@/lib/auth';
import { validateEmail, validatePassword, validatePasswords } from '@/lib/validation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, confirmPassword } = req.body;

    // Validate input
    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ error: emailError.message });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError.message });
    }

    const confirmError = validatePasswords(password, confirmPassword);
    if (confirmError) {
      return res.status(400).json({ error: confirmError.message });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

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

    // Set session cookie
    res.setHeader(
      'Set-Cookie',
      `session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}`
    );

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
      },
      redirectUrl: '/dashboard',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
