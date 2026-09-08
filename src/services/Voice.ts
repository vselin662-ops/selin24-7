import { EdgeTTS } from "edge-tts-universal";
import dotenv from "dotenv";

dotenv.config();

export class Voice {
  private voiceName?: string;

  constructor() {
    this.voiceName = process.env.EDGE_TTS_VOICE;
  }

  public async textToSpeech(text: string): Promise<any> {
    if (!this.voiceName) {
      const errMsg = "missing_key:EDGE_TTS_VOICE";
      console.error(errMsg);
      return { ok: false, error: errMsg };
    }

    try {
      const tts = new EdgeTTS(text, this.voiceName);
      const result = await tts.synthesize();
      
      const arrayBuffer = await result.audio.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return {
        ok: true,
        audioBuffer: buffer,
        contentType: "audio/mpeg"
      };
    } catch (error: any) {
      console.error("Voice Exception:", error);
      return { ok: false, error: error.message };
    }
  }
}
