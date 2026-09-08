import dotenv from "dotenv";

dotenv.config();

export class ImageGen {
  private apiKey?: string;

  constructor() {
    this.apiKey = process.env.POLLINATIONS_API_KEY;
  }

  public async generateImage(prompt: string, width: number = 1024, height: number = 1024): Promise<any> {
    if (!this.apiKey) {
      const errMsg = "missing_key:POLLINATIONS_API_KEY";
      console.error(errMsg);
      return { ok: false, error: errMsg };
    }

    try {
      const url = `https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${Math.floor(Math.random() * 1000000)}`;
      const response = await fetch(url);

      if (!response.ok) {
        return { ok: false, error: `Pollinations API returned status: ${response.status}` };
      }

      return { ok: true, url };
    } catch (error: any) {
      console.error("ImageGen Exception:", error);
      return { ok: false, error: error.message };
    }
  }
}
