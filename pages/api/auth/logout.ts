// pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';

type ResponseData = {
  success?: boolean;
  message?: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Clear the cookies
  res.setHeader(
    'Set-Cookie',
    [
      cookie.serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(0),
        sameSite: 'strict',
        path: '/',
      }),
      cookie.serialize('userRole', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(0),
        sameSite: 'strict',
        path: '/',
      })
    ]
  );

  return res.status(200).json({ success: true });
}