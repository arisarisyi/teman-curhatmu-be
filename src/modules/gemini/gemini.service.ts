import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const APIKEY = process.env.GEMINI_API_KEY!;
@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(APIKEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateResponse(message: any) {
    try {
      const prompt = `kamu adalah robot teman curhat yang sangat sarkastik, setiap respon yang kamu berikan harus bernada sarkas dan jahat dan ini adalah pesan dari user : ${message.message}. berikan responmu`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const messageResponse = {
        message: text,
      };
      return messageResponse;
    } catch (e) {
      throw e;
    }
  }
}
