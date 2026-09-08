import dotenv from "dotenv";
import crypto from "crypto";
import { SelinCore } from "../core/SelinCore.js";

dotenv.config();

export class MaxAdapter {
  private apiKey?: string;
  private webhookSecret?: string;
  private core: SelinCore;

  constructor(core: SelinCore) {
    this.core = core;
    this.apiKey = process.env.MAX_API_KEY;
    this.webhookSecret = process.env.MAX_WEBHOOK_SECRET;
  }

  public verifySignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.warn("MAX_WEBHOOK_SECRET is missing; skipping signature validation.");
      return true;
    }
    const hmac = crypto.createHmac("sha256", this.webhookSecret);
    const digest = hmac.update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  }

  public async handleWebhook(body: any, signature?: string): Promise<any> {
    if (!this.apiKey) {
      const errMsg = "missing_key:MAX_API_KEY";
      console.error(errMsg);
      return { ok: false, error: errMsg };
    }

    if (signature && !this.verifySignature(JSON.stringify(body), signature)) {
      return { ok: false, error: "invalid_signature" };
    }

    const { userId, conversationId, message } = body;
    if (!userId || !conversationId || !message || !message.text) {
      return { ok: false, error: "missing_required_payload_fields" };
    }

    try {
      const selinResponse = await this.core.processMessage(userId, conversationId, message.text);

      const maxApiUrl = process.env.MAX_API_URL || "https://api.max.com/v1/messages";
      const response = await fetch(maxApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          recipientId: userId,
          conversationId,
          message: {
            text: selinResponse.text,
            mediaUrl: selinResponse.mediaUrl
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Failed to send message to MAX platform: ${response.status} ${errText}`);
        return { ok: false, error: `MAX delivery error: ${response.status}` };
      }

      return { ok: true, response: selinResponse };
    } catch (err: any) {
      console.error("MaxAdapter Exception:", err);
      return { ok: false, error: err.message };
    }
  }
}
