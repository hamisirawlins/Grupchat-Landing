import { NextResponse } from 'next/server';
import { emailService } from '../../../../lib/emailService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, reason, confirmation, additionalComments } = body;

    // Validation
    if (!email || !reason || !confirmation) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { success: false, message: 'Invalid confirmation text' },
        { status: 400 }
      );
    }

    // Send email notification to info@grupchat.net
    await emailService.sendAccountDeletionRequest(
      email,
      reason,
      confirmation,
      additionalComments || ''
    );

    console.log(`Account deletion request sent for: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Account deletion request submitted successfully',
      requestId: `DEL-${Date.now().toString().slice(-6)}`
    });

  } catch (error) {
    console.error('Account deletion request error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to submit deletion request. Please try again or contact support.' 
      },
      { status: 500 }
    );
  }
}