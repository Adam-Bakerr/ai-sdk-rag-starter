// /pages/api/updateKnowledgeBase.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createResource } from '@/lib/actions/resources';
import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText, tool } from 'ai';
import { z } from 'zod';

// Set the body size limit to 10 MB
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Set desired file size limit
    },
  },
};

// Define the Message type
type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { messages }: { messages: Message[] } = req.body;

    // Convert messages to core messages
    const coreMessages = convertToCoreMessages(messages);

    // Stream text and update knowledge base
    const result = await streamText({
      model: openai('gpt-4o'),
      messages: coreMessages,
      system: `You are a helpful assistant. Do not respond to the user; your only job is to update the knowledge base.`,
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

    // Convert result to a plain object if necessary
    res.status(200).json(JSON.parse(JSON.stringify(result)));
  } catch (error : any) {
    res.status(500).json({ error: error.message });
  }
};

export default handler;
