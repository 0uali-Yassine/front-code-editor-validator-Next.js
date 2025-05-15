// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';

type ResponseData = {
  success?: boolean;
  user?: any;
  message?: string;
  error?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://back-code-editor-validator.vercel.app';

    console.log('Login request body:', { email, password: '******' });
    console.log('Backend URL:', backendUrl);

    // Forward request to your existing backend
    try {
      const response = await fetch(`${backendUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Backend response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error text:', errorText);
        
        let errorJson;
        try {
          errorJson = JSON.parse(errorText);
        } catch (parseError) {
          console.error('Failed to parse error as JSON:', parseError instanceof Error ? parseError.message : String(parseError));
          errorJson = { message: 'Unknown error from backend' };
        }
        
        return res.status(response.status).json(errorJson);
      }

      const responseText = await response.text();
      console.log('Backend response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError instanceof Error ? parseError.message : String(parseError));
        return res.status(500).json({ 
          message: 'Invalid JSON response from backend',
          error: parseError instanceof Error ? parseError.message : String(parseError)
        });
      }
      
      const { token, user } = data;
      
      if (!token || !user) {
        console.error('Missing token or user in response:', data);
        return res.status(500).json({ 
          message: 'Invalid response format from backend',
          error: 'Missing token or user'
        });
      }

      // Set the token as an HTTP-only cookie
      res.setHeader(
        'Set-Cookie',
        [
          cookie.serialize('token', token, {
            httpOnly: true,
            secure: false, // Set to true in production if using HTTPS
            maxAge: 60 * 60 * 24 * 7, // 1 week
            sameSite: 'strict',
            path: '/',
          }),
          cookie.serialize('userRole', user.role, {
            httpOnly: true,
            secure: false, // Set to true in production if using HTTPS
            maxAge: 60 * 60 * 24 * 7, // 1 week
            sameSite: 'strict',
            path: '/',
          })
        ]
      );

      return res.status(200).json({ success: true, user });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError instanceof Error ? fetchError.message : String(fetchError));
      return res.status(500).json({ 
        message: 'Failed to communicate with backend',
        error: fetchError instanceof Error ? fetchError.message : String(fetchError)
      });
    }
  } catch (error) {
    console.error('Login error:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}