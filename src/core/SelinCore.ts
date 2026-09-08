import { Database } from "../db/Database.js";
import { ProviderGateway, ChatMessage } from "../services/ProviderGateway.js";
import { ImageGen } from "../services/ImageGen.js";
import { Voice } from "../services/Voice.js";
import { Search } from "../services/Search.js";

export class SelinCore {
  private db: Database;
  private gateway: ProviderGateway;
  private imageGen: ImageGen;
  private voice: Voice;
  private search: Search;

  private systemPrompt: string = 
    "You are Selin, an elegant, highly analytical, sophisticated, and warm AI companion. " +
    "You communicate with clarity, precision, and deep empathy, avoiding standard robotic greetings. " +
    "Adhere strictly to truth and provide insightful answers.";

  constructor(db: Database) {
    this.db = db;
    this.gateway = new ProviderGateway();
    this.imageGen = new ImageGen();
    this.voice = new Voice();
    this.search = new Search();
  }

  public async processMessage(userId: string, conversationId: string, text: string): Promise<any> {
    this.logEvent("INFO", `Received message from user ${userId}`, JSON.stringify({ conversationId, text }));

    const history = this.getHistory(conversationId);
    history.push({ role: "user", content: text });

    if (text.startsWith("/image ")) {
      const prompt = text.replace("/image ", "");
      const res = await this.imageGen.generateImage(prompt);
      if (res.ok) {
        history.push({ role: "assistant", content: `Generated image: ${res.url}` });
        this.saveHistory(userId, conversationId, history);
        return { text: `I have generated the image for you: ${res.url}`, mediaUrl: res.url };
      }
      return { text: `Failed to generate image: ${res.error}` };
    }

    if (text.startsWith("/search ")) {
      const query = text.replace("/search ", "");
      const res = await this.search.searchWeb(query);
      if (res.ok) {
        const resultsSummary = res.results.map((r: any) => `- ${r.title}: ${r.content} (${r.url})`).join("\n");
        history.push({ role: "assistant", content: `Search results for "${query}":\n${resultsSummary}` });
        this.saveHistory(userId, conversationId, history);
        return { text: `Here is what I found on the web:\n\n${resultsSummary}` };
      }
      return { text: `Failed to perform search: ${res.error}` };
    }

    const gatewayRes = await this.gateway.chatCompletion(history);
    if (!gatewayRes.ok) {
      return { text: `Error generating response: ${gatewayRes.error}` };
    }

    const assistantText = gatewayRes.data.choices[0].message.content;
    history.push({ role: "assistant", content: assistantText });
    this.saveHistory(userId, conversationId, history);

    let audioUrl: string | undefined;
    if (text.includes("/voice")) {
      const voiceRes = await this.voice.textToSpeech(assistantText);
      if (voiceRes.ok) {
        audioUrl = `data:audio/mpeg;base64,${voiceRes.audioBuffer.toString("base64")}`;
      }
    }

    return { text: assistantText, audioUrl };
  }

  private getHistory(conversationId: string): ChatMessage[] {
    const row = this.db.prepare("SELECT messages FROM conversations WHERE id = ?").get(conversationId);
    if (row && row.messages) {
      try {
        return JSON.parse(row.messages);
      } catch {
        return [{ role: "system", content: this.systemPrompt }];
      }
    }
    return [{ role: "system", content: this.systemPrompt }];
  }

  private saveHistory(userId: string, conversationId: string, history: ChatMessage[]) {
    const existing = this.db.prepare("SELECT id FROM conversations WHERE id = ?").get(conversationId);
    if (existing) {
      this.db.prepare("UPDATE conversations SET messages = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(JSON.stringify(history), conversationId);
    } else {
      this.db.prepare("INSERT INTO conversations (id, user_id, messages) VALUES (?, ?, ?)")
        .run(conversationId, userId, JSON.stringify(history));
    }
  }

  private logEvent(level: string, message: string, context?: string) {
    try {
      this.db.prepare("INSERT INTO logs (level, message, context) VALUES (?, ?, ?)")
        .run(level, message, context || null);
    } catch (err) {
      console.error("Failed to write to logs table:", err);
    }
  }
}
