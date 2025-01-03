-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'ai');

-- CreateTable
CREATE TABLE "ChatTopic" (
    "id" SERIAL NOT NULL,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "messageId" SERIAL NOT NULL,
    "chatTopicId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatTopic_chatId_key" ON "ChatTopic"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMessage_messageId_key" ON "ChatMessage"("messageId");

-- AddForeignKey
ALTER TABLE "ChatTopic" ADD CONSTRAINT "ChatTopic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatTopicId_fkey" FOREIGN KEY ("chatTopicId") REFERENCES "ChatTopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
