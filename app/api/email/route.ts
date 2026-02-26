import { NextRequest, NextResponse } from 'next/server';
import {
  sendWelcomeEmail,
  sendSessionMatchedEmail,
  sendSessionReminderEmail,
  sendSessionCompleteEmail,
  sendStreakBrokenEmail,
} from '@/lib/email';

// POST /api/email
// Body: { type: 'welcome' | 'matched' | 'reminder' | 'complete' | 'streak_broken', ...data }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, ...data } = body;

    let result;

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(data.to, data.name);
        break;

      case 'matched':
        result = await sendSessionMatchedEmail(
          data.to,
          data.name,
          data.partnerName,
          data.duration,
          data.scheduledAt
        );
        break;

      case 'reminder':
        result = await sendSessionReminderEmail(
          data.to,
          data.name,
          data.partnerName,
          data.duration
        );
        break;

      case 'complete':
        result = await sendSessionCompleteEmail(
          data.to,
          data.name,
          data.duration,
          data.streak,
          data.totalSessions
        );
        break;

      case 'streak_broken':
        result = await sendStreakBrokenEmail(data.to, data.name, data.previousStreak);
        break;

      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    if (result?.success) {
      return NextResponse.json({ success: true, id: result.id });
    } else {
      return NextResponse.json(
        { success: false, error: result?.error || 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
