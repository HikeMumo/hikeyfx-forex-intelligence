import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { name = "", replyTo, topic, message, website = "" } = await req.json();

    // Honeypot: silently accept automated submissions without sending email.
    if (typeof website === "string" && website.trim()) return json({ ok: true });

    if (
      typeof replyTo !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo.trim()) ||
      typeof topic !== "string" || topic.trim().length < 1 || topic.length > 100 ||
      typeof message !== "string" || message.trim().length < 8 || message.length > 4000 ||
      typeof name !== "string" || name.length > 80
    ) {
      return json({ error: "Please check the form fields and try again." }, 400);
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    const destination = Deno.env.get("HIKEYFX_SUPPORT_EMAIL");
    const sender = Deno.env.get("HIKEYFX_FROM_EMAIL");

    if (!apiKey || !destination || !sender) {
      console.error("HIKEYFX support email environment is incomplete.");
      return json({ error: "Support email service is not configured yet." }, 503);
    }

    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: sender,
      to: [destination],
      replyTo: replyTo.trim(),
      subject: "HIKEYFX support: " + topic.trim(),
      text:
        "Name: " + (name.trim() || "Not provided") +
        "\nReply email: " + replyTo.trim() +
        "\nTopic: " + topic.trim() +
        "\n\n" + message.trim(),
    });

    if (result.error) {
      console.error("Resend delivery error:", result.error);
      return json({ error: "Message delivery failed. Please try again later." }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    console.error("HIKEYFX support function error:", error);
    return json({ error: "The support service could not send your message. Please try again later." }, 503);
  }
});
