import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendSessionReminderEmail } from '@/lib/email';

// Runs daily at 6:00 AM UTC via Vercel Cron
// Sends reminder emails for all matched sessions scheduled today
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
    const now = new Date();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Find all matched sessions scheduled for today
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, host_id, partner_id, duration, scheduled_at')
      .eq('status', 'matched')
      .gte('scheduled_at', now.toISOString())
      .lte('scheduled_at', todayEnd.toISOString());

    if (error) {
      console.error('Cron: Error fetching sessions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ message: 'No sessions today', sent: 0 });
    }

    let sent = 0;

    for (const session of sessions) {
      // Get host profile
      const { data: host } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', session.host_id)
        .single();

      // Get partner profile
      let partner = null;
      if (session.partner_id) {
        const { data } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', session.partner_id)
          .single();
        partner = data;
      }

      // Send reminder to host
      if (host?.email && partner) {
        await sendSessionReminderEmail(
          host.email,
          host.full_name,
          partner.full_name,
          session.duration
        );
        sent++;
      }

      // Send reminder to partner
      if (partner?.email && host) {
        await sendSessionReminderEmail(
          partner.email,
          partner.full_name,
          host.full_name,
          session.duration
        );
        sent++;
      }
    }

    return NextResponse.json({
      message: `Sent ${sent} reminder emails for ${sessions.length} sessions`,
      sent,
      sessions: sessions.length,
    });
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
