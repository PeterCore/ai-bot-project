// src/chat/chat.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { ChatService } from './chat.service';
// import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * 创建新的聊天主题
   * POST /chat/start
   * Body: { title?: string }
   */
  @Public()
  @Post('start')
  async startChat(@Body() body: any, @Request() req) {
    const { title } = body;
    const userId = req.user.userId;
    const chatTopic = await this.chatService.startChat(userId, title);
    return {
      code: 0,
      message: 'Chat started successfully',
      data: {
        chatId: chatTopic.chatId,
        createdAt: chatTopic.createdAt,
      },
    };
  }

  /**
   * 发送消息到聊天主题
   * POST /chat/:chatId/message
   * Body: { content: string }
   */
  @Public()
  @Post(':chatId/message')
  async sendMessage(
    @Param('chatId') chatId: string,
    @Body() body: any,
    @Request() req,
  ) {
    const { content } = body;
    const userId = req.user.userId;
    const message = await this.chatService.sendMessage(userId, chatId, content);
    return {
      code: 0,
      message: 'Message sent successfully',
      data: {
        messageId: message.messageId,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
      },
    };
  }

  /**
   * 获取聊天主题的所有消息
   * GET /chat/:chatId/messages
   */
  @Public()
  @Get(':chatId/messages')
  async getMessages(@Param('chatId') chatId: string, @Request() req) {
    const userId = req.user.userId;
    const messages = await this.chatService.getMessages(userId, chatId);
    return {
      code: 0,
      message: 'Success',
      data: messages.map((msg) => ({
        messageId: msg.messageId,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
      })),
    };
  }

  /**
   * 获取聊天主题的最新 10 条消息（从 Redis）
   * GET /chat/:chatId/messages/latest
   */
  @Public()
  @Get(':chatId/messages/latest')
  async getLatestMessages(@Param('chatId') chatId: string, @Request() req) {
    const userId = req.user.userId;
    const messages = await this.chatService.getLatestMessages(userId, chatId);
    return {
      code: 0,
      message: 'Success',
      data: messages.map((msg) => ({
        messageId: msg.messageId,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
      })),
    };
  }
}
