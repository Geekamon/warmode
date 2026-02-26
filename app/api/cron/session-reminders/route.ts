import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendSessionReminderEmail } from '@/lib/email';

// Runs every 5 minutes via Vercel Cron
// Finds sessions starting in 10-15 minutes and sends reminder emails
export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sends this automatically for cron jobs)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service-level supabase client (bypass RLS for cron)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const now = new Date();
    const in10min = new Date(now.getTime() + 10 * 60 * 1000);
    const in15min = new Date(now.getTime() + 15 * 60 * 1000);

    // Find matched sessions starting in the next 10-15 minutes
    // that haven't been reminded yet
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, host_id, partner_id, duration, scheduled_at')
      .eq('status', 'matched')
      .gte('scheduled_at', in10min.toISOString())
      .lte('scheduled_at', in15min.toISOString());

    if (error) {
      console.error('Cron: Error fetching sessions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ message: 'No upcoming sessions', sent: 0 });
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
      message: `Sent ${sent} reminder emails`,
      sent,
      sessions: sessions.length,
    });
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
