// /app/api/updateKnowledgeBase/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createResource } from '@/lib/actions/resources';
import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText, tool } from 'ai';
import { z } from 'zod';

// Define the Message type
type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// Allow Larger Files
export const api = {
  body: {
    sizeLimit: '1mb', // Set your desired size limit (1mb, 2mb, etc.)
  },
};


export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await req.json();

    // Convert messages to core messages
    const coreMessages = convertToCoreMessages(messages);

    // Stream text and update knowledge base
    const result = await streamText({
      model: openai('gpt-4o'),
      messages: coreMessages,
      system: `You are a helpful assistant. Do not respond to the user; your only job is to update the knowledge base. do not generate a response, just log the infomation provided to the knowledge base`,
      tools: {
        addResource: tool({
          description: `Add a resource to your knowledge base.`,
          parameters: z.object({
            content: z.string().describe('The content or resource to add to the knowledge base'),
          }),
          execute: async ({ content }) => createResource({ content }),
        }),
      },
    });

    return NextResponse.json(result);
  } catch (error : any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}