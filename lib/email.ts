// Email notification service for WarMode
// Uses Resend (free tier: 100 emails/day)

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'WarMode <onboarding@resend.dev>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://warmode-drab.vercel.app';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(payload: EmailPayload) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email send');
    return { success: false, error: 'No API key' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Email send failed:', err);
      return { success: false, error: err };
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}

// --- Email Templates ---

const baseStyle = `
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #0A0A0A;
  color: #FFFFFF;
  padding: 40px 20px;
`;

const buttonStyle = `
  display: inline-block;
  background-color: #F9A825;
  color: #0A0A0A;
  font-weight: bold;
  padding: 14px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 16px;
`;

const cardStyle = `
  background-color: #1E1E1E;
  border: 1px solid #2A2A2A;
  border-radius: 12px;
  padding: 32px;
  max-width: 520px;
  margin: 0 auto;
`;

function emailWrapper(content: string) {
  return `
    <div style="${baseStyle}">
      <div style="${cardStyle}">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 28px; font-weight: bold; color: #F9A825;">⚔️ WARMODE</span>
        </div>
        ${content}
        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #2A2A2A;">
          <p style="color: #9E9E9E; font-size: 12px; margin: 0;">
            WarMode — Accountability for the Nigerian hustle
          </p>
        </div>
      </div>
    </div>
  `;
}

// 1. Welcome email after signup
export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: '⚔️ Welcome to WarMode, Warrior!',
    html: emailWrapper(`
      <h2 style="color: #FFFFFF; margin: 0 0 16px;">Welcome, ${name}!</h2>
      <p style="color: #CCCCCC; line-height: 1.6;">
        You just joined the most serious accountability community in Nigeria.
        No excuses. No distractions. Just work.
      </p>
      <p style="color: #CCCCCC; line-height: 1.6;">
        Book your first session now and start building your streak.
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${APP_URL}/dashboard/book" style="${buttonStyle}">
          Book Your First Session
        </a>
      </div>
      <p style="color: #9E9E9E; font-size: 14px;">
        Tip: Consistency beats motivation. Even 25 minutes counts.
      </p>
    `),
  });
}

// 2. Session matched — you got a partner
export async function sendSessionMatchedEmail(
  to: string,
  name: string,
  partnerName: string,
  duration: number,
  scheduledAt: string
) {
  const time = new Date(scheduledAt).toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return sendEmail({
    to,
    subject: `🤝 Matched! Your ${duration}-min session is set`,
    html: emailWrapper(`
      <h2 style="color: #FFFFFF; margin: 0 0 16px;">You're matched, ${name}!</h2>
      <p style="color: #CCCCCC; line-height: 1.6;">
        Your accountability partner is ready. Don't keep them waiting.
      </p>
      <div style="background: #0A0A0A; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; color: #CCCCCC;">
          <tr>
            <td style="padding: 8px 0; color: #9E9E9E;">Partner</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #FFFFFF;">${partnerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9E9E9E;">Duration</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #FFFFFF;">${duration} minutes</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9E9E9E;">Time</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #FFFFFF;">${time}</td>
          </tr>
        </table>
      </div>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${APP_URL}/dashboard" style="${buttonStyle}">
          Go to Dashboard
        </a>
      </div>
    `),
  });
}

// 3. Session reminder — 15 minutes before
export async function sendSessionReminderEmail(
  to: string,
  name: string,
  partnerName: string,
  duration: number
) {
  return sendEmail({
    to,
    subject: `⏰ Your session starts in 15 minutes!`,
    html: emailWrapper(`
      <h2 style="color: #FFFFFF; margin: 0 0 16px;">Heads up, ${name}!</h2>
      <p style="color: #CCCCCC; line-height: 1.6;">
        Your ${duration}-minute session with <strong>${partnerName}</strong> starts in 15 minutes.
        Get your workspace ready and your goals clear.
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${APP_URL}/dashboard" style="${buttonStyle}">
          Join Session
        </a>
      </div>
      <p style="color: #9E9E9E; font-size: 14px;">
        Remember: showing up is 90% of the battle.
      </p>
    `),
  });
}

// 4. Session completed — streak update
export async function sendSessionCompleteEmail(
  to: string,
  name: string,
  duration: number,
  streak: number,
  totalSessions: number
) {
  return sendEmail({
    to,
    subject: `⚔️ Mission Complete! ${streak > 1 ? `${streak}-day streak!` : 'Great session!'}`,
    html: emailWrapper(`
      <h2 style="color: #F9A825; margin: 0 0 16px; text-align: center;">MISSION COMPLETE</h2>
      <p style="color: #CCCCCC; line-height: 1.6; text-align: center;">
        ${duration} minutes of pure focus. Well done, ${name}.
      </p>
      <div style="display: flex; gap: 12px; margin: 24px 0; text-align: center;">
        <div style="flex: 1; background: #0A0A0A; border-radius: 8px; padding: 16px;">
          <p style="color: #F9A825; font-size: 28px; font-weight: bold; margin: 0;">${streak}</p>
          <p style="color: #9E9E9E; font-size: 12px; margin: 4px 0 0;">Day Streak</p>
        </div>
        <div style="flex: 1; background: #0A0A0A; border-radius: 8px; padding: 16px;">
          <p style="color: #4CAF50; font-size: 28px; font-weight: bold; margin: 0;">${totalSessions}</p>
          <p style="color: #9E9E9E; font-size: 12px; margin: 4px 0 0;">Total Sessions</p>
        </div>
      </div>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${APP_URL}/dashboard/book" style="${buttonStyle}">
          Book Next Session
        </a>
      </div>
    `),
  });
}

// 5. Streak broken — come back!
export async function sendStreakBrokenEmail(
  to: string,
  name: string,
  previousStreak: number
) {
  return sendEmail({
    to,
    subject: `💔 Your ${previousStreak}-day streak ended. Come back!`,
    html: emailWrapper(`
      <h2 style="color: #FFFFFF; margin: 0 0 16px;">Don't let up, ${name}!</h2>
      <p style="color: #CCCCCC; line-height: 1.6;">
        Your ${previousStreak}-day streak just ended. But every warrior falls — what matters is getting back up.
      </p>
      <p style="color: #CCCCCC; line-height: 1.6;">
        One session. That's all it takes to start a new streak.
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${APP_URL}/dashboard/book" style="${buttonStyle}">
          Start a New Streak
        </a>
      </div>
    `),
  });
}
