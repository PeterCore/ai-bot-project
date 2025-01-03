// src/chat/chat.service.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { Inject } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices';
import { ChatTopic, ChatMessage } from '@prisma/client';
@Injectable()
export class ChatService {}
