import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendWelcomeEmail,
  sendSessionMatchedEmail,
  sendSessionCompleteEmail,
} from '@/lib/email';

// Supabase Database Webhook Handler
// Set up webhooks in Supabase Dashboard → Database → Webhooks
// pointing to: https://warmode-drab.vercel.app/api/webhooks/supabase
//
// Recommended webhooks:
// 1. profiles → INSERT → sends welcome email
// 2. sessions → UPDATE → sends matched/complete emails

const WEBHOOK_SECRET = process.env.CRON_SECRET; // reuse cron secret for webhook auth

export async function POST(req: NextRequest) {
  try {
    // Optional: verify webhook secret via header
    const authHeader = req.headers.get('x-webhook-secret');
    if (WEBHOOK_SECRET && authHeader && authHeader !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { type, table, record, old_record } = payload;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // --- Handle new profile (welcome email) ---
    if (table === 'profiles' && type === 'INSERT') {
      const { email, full_name } = record;
      if (email && full_name) {
        await sendWelcomeEmail(email, full_name);
        return NextResponse.json({ sent: 'welcome' });
      }
    }

    // --- Handle session status changes ---
    if (table === 'sessions' && type === 'UPDATE') {
      const oldStatus = old_record?.status;
      const newStatus = record.status;

      // Session just matched — notify both users
      if (oldStatus === 'open' && newStatus === 'matched' && record.partner_id) {
        // Get host info
        const { data: host } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', record.host_id)
          .single();

        // Get partner info
        const { data: partner } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', record.partner_id)
          .single();

        if (host?.email && partner) {
          await sendSessionMatchedEmail(
            host.email,
            host.full_name,
            partner.full_name,
            record.duration,
            record.scheduled_at
          );
        }

        if (partner?.email && host) {
          await sendSessionMatchedEmail(
            partner.email,
            partner.full_name,
            host.full_name,
            record.duration,
            record.scheduled_at
          );
        }

        return NextResponse.json({ sent: 'matched', to: 'both' });
      }

      // Session completed — notify both users
      if (oldStatus !== 'completed' && newStatus === 'completed') {
        // Get host info
        const { data: host } = await supabase
          .from('profiles')
          .select('email, full_name, streak_current, total_sessions')
          .eq('id', record.host_id)
          .single();

        // Get partner info
        let partner = null;
        if (record.partner_id) {
          const { data } = await supabase
            .from('profiles')
            .select('email, full_name, streak_current, total_sessions')
            .eq('id', record.partner_id)
            .single();
          partner = data;
        }

        if (host?.email) {
          await sendSessionCompleteEmail(
            host.email,
            host.full_name,
            record.duration,
            host.streak_current,
            host.total_sessions
          );
        }

        if (partner?.email) {
          await sendSessionCompleteEmail(
            partner.email,
            partner.full_name,
            record.duration,
            partner.streak_current,
            partner.total_sessions
          );
        }

        return NextResponse.json({ sent: 'complete', to: 'both' });
      }
    }

    return NextResponse.json({ message: 'No action taken' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
