// src/chat/chat.service.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
// import { AiReplyMessage } from './interfaces/ai-reply.interface';
import { Inject } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices';
import { ChatTopic, ChatMessage } from '@prisma/client';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    // @Inject('AI_REPLY_QUEUE') private readonly aiReplyQueue: ClientProxy,
  ) {}

  /**
   * 开始一个新的聊天主题
   */
  async startChat(userId: string, title: string): Promise<ChatTopic> {
    const chatTopic = await this.prisma.chatTopic.create({
      data: {
        userId,
        // 如果需要，可以添加 title 字段
        // title,
      },
    });
    return chatTopic;
  }

  /**
   * 发送消息到聊天主题
   */
  async sendMessage(
    userId: string,
    chatId: string,
    content: string,
  ): Promise<ChatMessage> {
    // 查找聊天主题
    const chatTopic = await this.prisma.chatTopic.findUnique({
      where: { chatId },
    });
    if (!chatTopic) {
      throw new UnauthorizedException('Chat topic not found');
    }

    if (chatTopic.userId !== userId) {
      throw new UnauthorizedException('You do not have access to this chat');
    }

    // 创建用户消息
    const chatMessage = await this.prisma.chatMessage.create({
      data: {
        chatTopicId: chatTopic.id,
        userId,
        role: 'user',
        content,
      },
    });

    // 将消息添加到 Redis 的最新消息列表
    await this.addLatestMessage(userId, chatId, chatMessage);

    // // 发送 AI 回复请求到 RabbitMQ
    // const aiReplyMessage: AiReplyMessage = {
    //   chatId,
    //   userId,
    //   messageContent: content,
    // };
    // await this.aiReplyQueue.emit('generate-reply', aiReplyMessage).toPromise();

    return chatMessage;
  }

  /**
   * 获取聊天主题的所有消息
   */
  async getMessages(userId: string, chatId: string): Promise<ChatMessage[]> {
    const chatTopic = await this.prisma.chatTopic.findUnique({
      where: { chatId },
    });

    if (!chatTopic || chatTopic.userId !== userId) {
      throw new UnauthorizedException('Chat topic not found');
    }

    const messages = await this.prisma.chatMessage.findMany({
      where: { chatTopicId: chatTopic.id },
      orderBy: { createdAt: 'asc' },
    });

    return messages;
  }

  /**
   * 获取用户的聊天主题的最新 10 条消息（从 Redis）
   */
  async getLast10Messages(
    userId: string,
    chatId: string,
  ): Promise<ChatMessage[]> {
    const cachedMessages = await this.getLatestMessages(userId, chatId);
    return cachedMessages;
  }

  /**
   * 添加消息到用户的聊天主题的最新消息列表
   * @param userId 用户ID
   * @param chatId 聊天主题ID
   * @param message 聊天消息
   */
  async addLatestMessage(userId: string, chatId: string, message: ChatMessage) {
    const key = `user:${userId}:chat:${chatId}:latest_messages`;
    const messageData = JSON.stringify(message);
    await this.redisService.lpush(key, messageData);
    await this.redisService.ltrim(key, 0, 9); // 保持最新 10 条
  }

  /**
   * 获取用户的聊天主题的最新 10 条消息
   * @param userId 用户ID
   * @param chatId 聊天主题ID
   */
  async getLatestMessages(
    userId: string,
    chatId: string,
  ): Promise<ChatMessage[]> {
    const key = `user:${userId}:chat:${chatId}:latest_messages`;
    const messages = await this.redisService.lrange(key, 0, 9);
    return messages.map((msg) => JSON.parse(msg));
  }
}
