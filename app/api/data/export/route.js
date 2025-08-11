import { NextResponse } from 'next/server';
import { emailService } from '../../../../lib/emailService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, format } = body;

    // Validation
    if (!email || !format) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['json', 'csv'].includes(format.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: 'Invalid format. Must be json or csv' },
        { status: 400 }
      );
    }

    // Send email notification to grupchatinfo@gmail.com
    await emailService.sendDataExportRequest(email, format.toLowerCase());

    console.log(`Data export request sent for: ${email} in ${format} format`);

    return NextResponse.json({
      success: true,
      message: 'Data export request submitted successfully',
      requestId: `EXP-${Date.now().toString().slice(-6)}`,
      estimatedProcessingTime: '7-14 business days'
    });

  } catch (error) {
    console.error('Data export request error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to submit export request. Please try again or contact support.' 
      },
      { status: 500 }
    );
  }
}