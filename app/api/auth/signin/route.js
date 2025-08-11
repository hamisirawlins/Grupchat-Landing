import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json(
        { success: false, message: 'ID token is required' },
        { status: 400 }
      );
    }

    // Forward the request to the backend gateway
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const backendResponse = await fetch(`${backendUrl}/v1/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ idToken })
    });

    const data = await backendResponse.json();
    
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
