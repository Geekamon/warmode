import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendStreakBrokenEmail } from '@/lib/email';

// Runs daily at 1:00 AM UTC via Vercel Cron
// Checks for users who had a streak yesterday but didn't complete a session today
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Get yesterday's date range (UTC)
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
    const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();

    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();

    // Find users who had a streak > 0 but no completed session yesterday
    // Step 1: Get all users with active streaks
    const { data: activeStreakUsers, error: streakError } = await supabase
      .from('profiles')
      .select('id, email, full_name, streak_current')
      .gt('streak_current', 0);

    if (streakError) {
      console.error('Streak check error:', streakError);
      return NextResponse.json({ error: streakError.message }, { status: 500 });
    }

    if (!activeStreakUsers || activeStreakUsers.length === 0) {
      return NextResponse.json({ message: 'No active streaks to check', sent: 0 });
    }

    let sent = 0;
    let streaksBroken = 0;

    for (const user of activeStreakUsers) {
      // Check if this user completed a session yesterday
      const { data: yesterdaySessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('status', 'completed')
        .gte('ended_at', yesterdayStart)
        .lte('ended_at', yesterdayEnd)
        .or(`host_id.eq.${user.id},partner_id.eq.${user.id}`)
        .limit(1);

      // If no session yesterday, their streak is broken
      if (!yesterdaySessions || yesterdaySessions.length === 0) {
        const previousStreak = user.streak_current;

        // Reset their streak
        await supabase
          .from('profiles')
          .update({ streak_current: 0 })
          .eq('id', user.id);

        // Send streak broken email
        if (user.email && previousStreak > 1) {
          await sendStreakBrokenEmail(user.email, user.full_name, previousStreak);
          sent++;
        }

        streaksBroken++;
      }
    }

    return NextResponse.json({
      message: `Checked ${activeStreakUsers.length} users, ${streaksBroken} streaks broken, ${sent} emails sent`,
      checked: activeStreakUsers.length,
      streaksBroken,
      sent,
    });
  } catch (error: any) {
    console.error('Streak cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
