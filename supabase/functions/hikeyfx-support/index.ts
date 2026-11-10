import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const { name = "", replyTo, topic, message, website = "" } = await req.json();
    if (website) return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
    if (typeof replyTo !== "string" || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(replyTo) ||
        typeof topic !== "string" || topic.length > 100 ||
        typeof message !== "string" || message.trim().length < 8 || message.length > 4000 ||
        typeof name !== "string" || name.length > 80) {
      return new Response(JSON.stringify({ error: "Please check the form fields and try again." }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const apiKey = Deno.env.get("RESEND_API_KEY");
    const destination = Deno.env.get("HIKEYFX_SUPPORT_EMAIL");
    if (!apiKey || !destination) throw new Error("Support email service is not configured.");
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: "HIKEYFX Help Desk <onboarding@resend.dev>",
      to: [destination],
      replyTo,
      subject: "HIKEYFX support: " + topic,
      text: "Name: " + name + "\\nReply email: " + replyTo + "\\nTopic: " + topic + "\\n\\n" + message.trim(),
    });
    if (result.error) throw new Error("Message delivery failed.");
    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: "The support service is not ready or could not send your message. Please try again later." }), { status: 503, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
