import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { name = "", replyTo, topic, message, website = "" } = await req.json();
    if (typeof website === "string" && website.trim()) return json({ ok: true });

    if (
      typeof replyTo !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo.trim()) ||
      typeof topic !== "string" || !topic.trim() || topic.length > 100 ||
      typeof message !== "string" || message.trim().length < 8 || message.length > 4000 ||
      typeof name !== "string" || name.length > 80
    ) return json({ error: "Please check the form fields and try again." }, 400);

    const scriptUrl = Deno.env.get("GOOGLE_APPS_SCRIPT_URL");
    const mailerSecret = Deno.env.get("HIKEYFX_MAILER_SECRET");
    if (!scriptUrl || !mailerSecret) {
      console.error("HIKEYFX Gmail relay is not configured.");
      return json({ error: "Support email service is not configured yet." }, 503);
    }

    const form = new URLSearchParams({
      token: mailerSecret,
      payload: JSON.stringify({
        name: name.trim(),
        replyTo: replyTo.trim(),
        topic: topic.trim(),
        message: message.trim(),
      }),
    });

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: form.toString(),
      redirect: "follow",
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok) {
      console.error("Google Apps Script mail relay rejected the request.");
      return json({ error: "Message delivery failed. Please try again later." }, 502);
    }
    return json({ ok: true });
  } catch (error) {
    console.error("HIKEYFX support function error:", error);
    return json({ error: "The support service could not send your message. Please try again later." }, 503);
  }
});
