/**
 * HIKEYFX private support mail relay.
 * Set HIKEYFX_SUPPORT_EMAIL and HIKEYFX_MAILER_SECRET in
 * Apps Script > Project Settings > Script properties.
 */
function doPost(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    const expected = props.getProperty("HIKEYFX_MAILER_SECRET");
    const destination = props.getProperty("HIKEYFX_SUPPORT_EMAIL");
    const supplied = e && e.parameter ? e.parameter.token : "";
    if (!expected || !destination || !supplied || supplied !== expected) {
      return output({ ok: false, error: "Unauthorized" });
    }

    const payloadText = e && e.parameter ? e.parameter.payload : "";
    const data = JSON.parse(payloadText || "{}");
    const name = String(data.name || "").trim().slice(0, 80);
    const replyTo = String(data.replyTo || "").trim();
    const topic = String(data.topic || "").trim().slice(0, 100);
    const message = String(data.message || "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo) ||
        topic.length < 1 || message.length < 8 || message.length > 4000) {
      return output({ ok: false, error: "Invalid message" });
    }

    const body =
      "Name: " + (name || "Not provided") +
      "\nReply email: " + replyTo +
      "\nTopic: " + topic +
      "\n\n" + message;

    GmailApp.sendEmail(destination, "HIKEYFX support: " + topic, body, {
      replyTo: replyTo,
      name: "HIKEYFX Help Desk"
    });
    return output({ ok: true });
  } catch (err) {
    console.error(err);
    return output({ ok: false, error: "Delivery failed" });
  }
}

function output(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
