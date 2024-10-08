import AWS from "aws-sdk";

import db from "@/lib/server/db";
import { NOT_EXISTS_POST_MESSAGE } from "@/constants/messages";
import { NotFoundError } from "@/lib/error/customError";
import { createSuccessResponse } from "@/lib/server/createServerResponse";

const sqs = new AWS.SQS({ region: "ap-northeast-2" });

interface MessageBody {
  userId: number;
  postId: number;
  description: string;
  imageUrl: string | null;
}

export const sendAiCommentToSQS = async (messageBody: MessageBody): Promise<string> => {
  const params = {
    QueueUrl: process.env.SQS_QUEUE_URL as string,
    MessageBody: JSON.stringify(messageBody),
  };

  try {
    const result = await sqs.sendMessage(params).promise();
    return result.MessageId!;
  } catch (error) {
    console.error("Error sending message to SQS:", error);
    throw new Error("Failed to send message to SQS");
  }
};

export const fetchInitialComment = async (postId: number) => {
  const post = await db.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      aiComments: {
        include: {
          aiBot: true,
        },
      },
    },
  });
  if (!post) {
    throw new NotFoundError(NOT_EXISTS_POST_MESSAGE);
  }
  const aiComments = post.aiComments.map((comment) => ({
    text: comment.text,
    AiBot: { name: comment.aiBot.name, avatar: comment.aiBot.avatar! },
  }));

  const [firstAiComment] = aiComments;
  // 글 작성시, ai comment가 존재하지 않기 않는다.
  // null 값으로 주어 ai comment가 등록되지 않은 상태로 명시하여, 비동기적으로 ai comment를 생성하고 등록하는 시간 동안 로딩상태를 보여준다.
  return createSuccessResponse({ data: firstAiComment ?? null });
};
