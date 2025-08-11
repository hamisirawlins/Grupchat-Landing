import { NextResponse } from 'next/server';
import { emailService } from '../../../lib/emailService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, bugType, description, steps, device, priority } = body;

    // Validation
    if (!name || !email || !bugType || !description) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const validBugTypes = [
      'app-crash',
      'payment-issue', 
      'ui-bug',
      'performance',
      'feature-not-working',
      'other'
    ];

    const validPriorities = ['low', 'medium', 'high', 'critical'];

    if (!validBugTypes.includes(bugType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid bug type' },
        { status: 400 }
      );
    }

    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { success: false, message: 'Invalid priority level' },
        { status: 400 }
      );
    }

    // Send email notification to grupchatinfo@gmail.com
    await emailService.sendBugReport(
      name,
      email,
      bugType,
      description,
      steps || '',
      device || '',
      priority
    );

    console.log(`Bug report sent from: ${name} (${email}) - Type: ${bugType}, Priority: ${priority}`);

    return NextResponse.json({
      success: true,
      message: 'Bug report submitted successfully',
      reportId: `BUG-${Date.now().toString().slice(-6)}`,
      estimatedResponse: 'Our team will review your report within 24-48 hours'
    });

  } catch (error) {
    console.error('Bug report submission error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to submit bug report. Please try again or contact support.' 
      },
      { status: 500 }
    );
  }
}
