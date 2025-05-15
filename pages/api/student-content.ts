// pages/api/student-content.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Handling student-content request');
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    
    try {
      // Get token from cookie or header
      const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        console.log(`Fetching student content from ${backendUrl}/api/student-content with token`);
        
        // get data from backend
        const response = await axios.get(`${backendUrl}/api/student-content`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        return res.status(200).json(response.data);
      }
    } catch (fetchError) {
      console.error('Error fetching from backend:', fetchError);
    }
    
    // If we cant get data or theres no token, return mock data for development
    console.log('Returning mock data');
    return res.status(200).json({
      page: {
        _id: 'mock-page-id',
        title: 'Introduction to Programming'
      },
      sections: [
        {
          _id: 'section-1',
          title: 'Getting Started',
          description: '<p>Welcome to your first programming lesson!</p>',
          type: 'lecture'
        },
        {
          _id: 'section-2',
          title: 'Your First Exercise',
          description: '<p>Write a program that prints "Hello World"</p>',
          type: 'exercise'
        },
        {
          _id: 'section-3',
          title: 'Basic Concepts Quiz',
          description: '<p>Test your understanding of basic programming concepts</p>',
          type: 'quiz'
        }
      ],
      sectionWithCode: [],
      userId: 'user-1'
    });
  } catch (error) {
    console.error('Error in student-content API route:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
}