import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatTopic } from 'src/models/chat-topic.schema';
import { CreateChatTopicDto } from './dto/create-topic.dto';
import { QueryChatTopicDto } from './dto/query-chat-topic.dto';
import { ChatMessage } from 'src/models/chat-message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatTopic.name) private chatTopicModel: Model<ChatTopic>,
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>,
  ) {}

  async createChatTopic(
    userId: string,
    createChatTopicDto: CreateChatTopicDto,
  ): Promise<ChatTopic> {
    const newChatTopic = new this.chatTopicModel({
      user: userId, // Gunakan UUID string langsung
      title: createChatTopicDto.title,
      createdAt: new Date(),
    });

    return await newChatTopic.save();
  }

  async getChatTopicsWithPagination(
    userId: string,
    queryDto: QueryChatTopicDto,
  ): Promise<{
    data: ChatTopic[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  }> {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;
    const skip = (page - 1) * limit;

    // Buat filter dasar
    const filter: any = { user: userId };

    // Tambahkan filter pencarian jika ada
    if (search) {
      filter.title = { $regex: search, $options: 'i' }; // Pencarian case-insensitive
    }

    // Buat objek sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Eksekusi query dengan pagination dan sort
    const [data, totalItems] = await Promise.all([
      this.chatTopicModel
        .find(filter)
        .populate('user', 'username')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.chatTopicModel.countDocuments(filter),
    ]);

    // Hitung total halaman
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      totalItems,
      currentPage: page,
      totalPages,
      limit,
    };
  }

  async deleteTopicAndMessages(topicId: string): Promise<void> {
    // Validasi apakah topicId valid (misalnya, apakah ObjectId valid)
    if (!topicId) {
      throw new Error('Invalid topic ID');
    }

    const findTopic = await this.chatTopicModel.findById(topicId);
    if (!findTopic) throw new NotFoundException();

    // Hapus semua ChatMessage yang memiliki topic dengan ID yang sama
    await this.chatMessageModel.deleteMany({ topic: topicId }).exec();

    // Hapus ChatTopic dengan ID yang diberikan
    const deletedTopic = await this.chatTopicModel
      .findByIdAndDelete(topicId)
      .exec();

    // Jika topic tidak ditemukan, lempar error
    if (!deletedTopic) {
      throw new Error('Topic not found');
    }
  }
}
