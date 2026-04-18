import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NOTIFY_TO = "harshkaithwas.outreach@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let userEmail = "unknown";
  let displayName = "";
  let userId: string | null = null;
  let createdAt = new Date().toISOString();

  try {
    const body = await req.json().catch(() => ({}));
    userId = body.user_id ?? null;

    if (userId) {
      const { data } = await supabase.auth.admin.getUserById(userId);
      if (data?.user) {
        userEmail = data.user.email ?? "unknown";
        displayName =
          (data.user.user_metadata?.display_name as string) ||
          (data.user.user_metadata?.full_name as string) ||
          (data.user.user_metadata?.name as string) ||
          "";
        createdAt = data.user.created_at ?? createdAt;
      }
    }

    // Try to send email if RESEND_API_KEY is set
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;
    let emailError: string | null = null;

    if (RESEND_API_KEY) {
      const subject = `🎬 New Uncleflix signup: ${userEmail}`;
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0d0d0d;color:#fff;border-radius:12px">
          <h1 style="font-size:22px;margin:0 0 16px">New user signed up on Uncleflix</h1>
          <table style="width:100%;font-size:14px;line-height:1.6">
            <tr><td style="color:#888;padding:6px 0;width:120px">Email</td><td><strong>${userEmail}</strong></td></tr>
            <tr><td style="color:#888;padding:6px 0">Display name</td><td>${displayName || "—"}</td></tr>
            <tr><td style="color:#888;padding:6px 0">User ID</td><td style="font-family:monospace;font-size:12px">${userId ?? "—"}</td></tr>
            <tr><td style="color:#888;padding:6px 0">Signed up</td><td>${createdAt}</td></tr>
          </table>
          <p style="margin-top:24px;font-size:12px;color:#666">Sent automatically by Uncleflix.</p>
        </div>`;

      try {
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Uncleflix <onboarding@resend.dev>",
            to: [NOTIFY_TO],
            subject,
            html,
          }),
        });
        if (resp.ok) emailSent = true;
        else emailError = `${resp.status} ${await resp.text()}`;
      } catch (e) {
        emailError = String(e);
      }
    } else {
      emailError = "RESEND_API_KEY not configured";
    }

    // Always log to DB so user can review signups in Cloud dashboard
    await supabase.from("signup_notifications").insert({
      user_id: userId,
      email: userEmail,
      display_name: displayName || null,
      email_sent: emailSent,
      email_error: emailError,
    });

    return new Response(JSON.stringify({ ok: true, email_sent: emailSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-signup error", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
