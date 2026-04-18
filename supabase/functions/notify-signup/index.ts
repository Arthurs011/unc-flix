import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NOTIFY_TO = "harshkaithwas.outreach@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id } = await req.json().catch(() => ({}));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let userEmail = "unknown";
    let displayName = "";
    let createdAt = new Date().toISOString();

    if (user_id) {
      const { data } = await supabase.auth.admin.getUserById(user_id);
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY missing");
      return new Response(JSON.stringify({ ok: false, error: "missing_api_key" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subject = `🎬 New Uncleflix signup: ${userEmail}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0d0d0d;color:#fff;border-radius:12px">
        <h1 style="font-size:22px;margin:0 0 16px">New user signed up on Uncleflix</h1>
        <table style="width:100%;font-size:14px;line-height:1.6">
          <tr><td style="color:#888;padding:6px 0;width:120px">Email</td><td><strong>${userEmail}</strong></td></tr>
          <tr><td style="color:#888;padding:6px 0">Display name</td><td>${displayName || "—"}</td></tr>
          <tr><td style="color:#888;padding:6px 0">User ID</td><td style="font-family:monospace;font-size:12px">${user_id ?? "—"}</td></tr>
          <tr><td style="color:#888;padding:6px 0">Signed up</td><td>${createdAt}</td></tr>
        </table>
        <p style="margin-top:24px;font-size:12px;color:#666">Sent automatically by Uncleflix.</p>
      </div>
    `;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/email/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: NOTIFY_TO,
        subject,
        html,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("email send failed", resp.status, txt);
      return new Response(JSON.stringify({ ok: false, status: resp.status, body: txt }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
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
