import { NextResponse } from 'next/server';
import { emailService } from '../../../../lib/emailService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, type, description } = body;

    // Validation
    if (!email || !type || !description) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const validTypes = [
      'personal-info',
      'transaction-data', 
      'pool-information',
      'account-settings',
      'other'
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid correction type' },
        { status: 400 }
      );
    }

    // Send email notification to grupchatinfo@gmail.com
    await emailService.sendDataCorrectionRequest(email, type, description);

    console.log(`Data correction request sent for: ${email} - Type: ${type}`);

    return NextResponse.json({
      success: true,
      message: 'Data correction request submitted successfully',
      requestId: `COR-${Date.now().toString().slice(-6)}`,
      estimatedProcessingTime: '5-10 business days'
    });

  } catch (error) {
    console.error('Data correction request error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to submit correction request. Please try again or contact support.' 
      },
      { status: 500 }
    );
  }
}