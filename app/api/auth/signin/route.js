import { NextResponse } from 'next/server';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request) {
  try {
    console.log('\n========== [Auth API] POST /api/auth/signin ==========');
    console.log('[Auth API] Timestamp:', new Date().toISOString());
    console.log('[Auth API] Backend URL:', baseUrl);
    console.log('[Auth API] Node ENV:', process.env.NODE_ENV);
    
    const { idToken } = await request.json();
    console.log('[Auth API] Request body parsed. Token length:', idToken?.length);
    
    if (!idToken) {
      console.error('[Auth API] ❌ No ID token provided');
      return NextResponse.json(
        { success: false, message: 'ID token is required' },
        { status: 400 }
      );
    }

    // Forward the request to the backend gateway
    const backendUrl = `${baseUrl}/v1/auth/signin`;
    console.log('[Auth API] 🔄 Forwarding to backend:', backendUrl);
    
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
      console.log('[Auth API] ✅ Backend response received. Status:', backendResponse.status);
    } catch (fetchError) {
      console.error('[Auth API] ❌ Fetch error when calling backend:', {
        name: fetchError.name,
        message: fetchError.message,
        code: fetchError.code
      });
      throw fetchError;
    }

    let data;
    try {
      data = await backendResponse.json();
      console.log('[Auth API] Backend response data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('[Auth API] ❌ Failed to parse backend response:', parseError.message);
      console.log('[Auth API] Raw response status:', backendResponse.status);
      console.log('[Auth API] Raw response ok:', backendResponse.ok);
      throw parseError;
    }
    
    console.log('[Auth API] ✅ Returning response with status:', backendResponse.status);
    console.log('========== [Auth API] Complete ==========\n');
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('\n========== [Auth API] ERROR ==========');
    console.error('[Auth API] Error name:', error.name);
    console.error('[Auth API] Error message:', error.message);
    console.error('[Auth API] Error code:', error.code);
    console.error('[Auth API] Error cause:', error.cause);
    console.error('[Auth API] Backend URL was:', baseUrl);
    console.error('[Auth API] Stack:', error.stack);
    console.error('========== [Auth API] ERROR END ==========\n');
    
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
