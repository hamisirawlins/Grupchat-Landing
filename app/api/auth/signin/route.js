import { NextResponse } from 'next/server';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

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
    const backendUrl = `${baseUrl}/v1/auth/signin`;
    
    let backendResponse;
    try {
      backendResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ idToken })
      });
    } catch (fetchError) {
      console.error('Auth signin fetch error:', fetchError.message);
      throw fetchError;
    }

    let data;
    try {
      data = await backendResponse.json();
    } catch (parseError) {
      console.error('Auth signin parse error:', parseError.message);
      throw parseError;
    }
    
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Sign in failed',
        error: error.message,
        debug: {
          errorName: error.name,
          backendUrl: baseUrl,
          endpoint: '/v1/auth/signin',
          env: process.env.NODE_ENV
        }
      },
      { status: 500 }
    );
  }
}
