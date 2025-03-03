import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { ChatMessage } from 'src/models/chat-message.schema';
import { Model } from 'mongoose';
import { CreateChatBotDto } from './dto/chatbot.dto';
import { ChatTopic } from 'src/models/chat-topic.schema';
import { QueryChatHistoryDto } from './dto/query-chat-history.dto';

dotenv.config();

const APIKEY = process.env.GEMINI_API_KEY!;
@Injectable()
export class ChatbotService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>,
    @InjectModel(ChatTopic.name) private chatTopicModel: Model<ChatTopic>,
  ) {
    this.genAI = new GoogleGenerativeAI(APIKEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Method untuk menerima pesan dari user.
   * Pesan user langsung disimpan dan event untuk generate respon gemini di-emit.
   */
  async sendMessage(createMessageDto: CreateChatBotDto, userId: string) {
    let { topicId, userMessage } = createMessageDto;
    // Jika topicId belum disediakan, buat ChatTopic baru dengan title 15 karakter pertama dari userMessage
    if (!topicId) {
      const title = userMessage.substring(0, 15);
      const chatTopic = await this.chatTopicModel.create({
        user: userId,
        title,
        createdAt: new Date(),
      });
      topicId = chatTopic._id;
    }

    // Simpan pesan user ke MongoDB dengan referensi topic
    await this.chatMessageModel.create({
      topic: topicId,
      user: userId,
      sender: 'user',
      message: userMessage,
    });

    // Emit event untuk menghasilkan respon bot secara asynchronous
    this.eventEmitter.emit('chat.generate', { userMessage, userId, topicId });

    // Response cepat ke client dengan mengembalikan topicId
    return { status: 'Message received', topicId };
  }

  /**
   * Listener untuk event 'chat.generate' yang akan menghasilkan respon dari gemini.
   * Setelah mendapat respon, simpan pesan bot ke MongoDB.
   */
  @OnEvent('chat.generate')
  async handleGenerateChat(payload: {
    userMessage: string;
    userId: string;
    topicId: string;
  }) {
    try {
      // Ambil pesan terakhir berdasarkan topik (diurutkan descending berdasarkan createdAt)
      const lastMessage = await this.chatMessageModel
        .findOne({ topic: payload.topicId })
        .sort({ createdAt: -1 })
        .exec();
      const lastMessageText = lastMessage ? lastMessage.message : '-';

      // Buat prompt dengan memasukkan pesan terakhir dan pesan baru dari user
      const prompt = `kamu adalah robot teman curhat yang sangat sarkastik, setiap respon yang kamu berikan harus bernada sarkas dan jahat. Pesan terakhir: "${lastMessageText}". Pesan dari user: "${payload.userMessage}". Berikan responmu`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Simpan pesan bot ke MongoDB
      const botMessage = await this.chatMessageModel.create({
        topic: payload.topicId,
        user: payload.userId,
        sender: 'bot',
        message: text,
      });
      console.log(
        `Bot response saved for user ${payload.userId} on topic ${payload.topicId}`,
      );

      // Emit event realtime setelah pesan bot berhasil disimpan
      this.eventEmitter.emit('chat.messageSaved', botMessage);
    } catch (error) {
      console.error('Error generating response from gemini:', error);
    }
  }

  /**
   * Mengambil riwayat chat berdasarkan id topic.
   * Riwayat akan diurutkan berdasarkan waktu pembuatan (ascending).
   */
  async getChatHistory(query: QueryChatHistoryDto) {
    let { topicId, page, limit, sortBy } = query;
    page = 1;
    limit = 10;
    if (!sortBy) {
      sortBy = 'createdAt:asc';
    }

    // Parse sortBy parameter (format: "field:order")
    const [sortField, sortOrder] = sortBy.split(':');
    const sortOptions = {};
    sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Query database with pagination and sorting
    const messages = await this.chatMessageModel
      .find({ topic: topicId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Get total count of messages for the topic
    const totalCount = await this.chatMessageModel.countDocuments({
      topic: topicId,
    });

    return {
      data: messages,
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }
}
