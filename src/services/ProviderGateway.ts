import dotenv from "dotenv";

dotenv.config();

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class ProviderGateway {
  private apiKey?: string;
  private baseUrl?: string;

  constructor() {
    this.apiKey = process.env.OMNIROUTE_API_KEY;
    this.baseUrl = process.env.OMNIROUTE_URL;
  }

  public async chatCompletion(messages: ChatMessage[], model: string = "gpt-4o"): Promise<any> {
    if (!this.apiKey) {
      const errMsg = "missing_key:OMNIROUTE_API_KEY";
      console.error(errMsg);
      return { ok: false, error: errMsg };
    }
    if (!this.baseUrl) {
      const errMsg = "missing_key:OMNIROUTE_URL";
      console.error(errMsg);
      return { ok: false, error: errMsg };
    }

    try {
      const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { ok: false, error: `OmniRoute API Error (${response.status}): ${errorText}` };
      }

      const data = await response.json();
      return { ok: true, data };
    } catch (error: any) {
      console.error("ProviderGateway Exception:", error);
      return { ok: false, error: error.message };
    }
  }
}
