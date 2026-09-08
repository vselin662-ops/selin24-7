import dotenv from "dotenv";

dotenv.config();

export class Search {
  private apiKey?: string;

  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY;
  }

  public async searchWeb(query: string, limit: number = 5): Promise<any> {
    if (!this.apiKey) {
      const errMsg = "missing_key:TAVILY_API_KEY";
      console.error(errMsg);
      return { ok: false, error: errMsg };
    }

    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query,
          max_results: limit
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { ok: false, error: `Tavily API Error (${response.status}): ${errorText}` };
      }

      const data = await response.json();
      return { ok: true, results: data.results || [] };
    } catch (error: any) {
      console.error("Search Exception:", error);
      return { ok: false, error: error.message };
    }
  }
}
