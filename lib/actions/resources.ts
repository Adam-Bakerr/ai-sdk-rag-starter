'use server';

import {
  NewResourceParams,
  insertResourceSchema,
  resources,
} from '@/lib/db/schema/resources';
import { db } from '../db';
import ToolResult from "ai"
import { generateEmbeddings } from '../ai/embedding';
import { embeddings as embeddingsTable } from '../db/schema/embeddings';
import { tool } from 'ai';
import { z } from 'zod';


export const createResource = async (input: NewResourceParams) => {
  try {
    const { content } = insertResourceSchema.parse(input);

    const [resource] = await db
      .insert(resources)
      .values({ content })
      .returning();

    const embeddings = await generateEmbeddings(content);
    await db.insert(embeddingsTable).values(
      embeddings.map(embedding => ({
        resourceId: resource.id,
        ...embedding,
      })),
    );

    return 'Resource successfully created and embedded.';
  } catch (error) {
    return error instanceof Error && error.message.length > 0
      ? error.message
      : 'Error, please try again.';
  }
};

// src/lib/actions/resources.ts
import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// Server-side function
export async function updateKnowledgeBase(messages: Message[]) {
  const coreMessages = convertToCoreMessages(messages);

  const result = await streamText({
    model: openai('gpt-4o'),
    messages: coreMessages,
    system: `You are a helpful assistant.
    Do not respond to the user or generate any responses; your only job is to update the knowledge base.`,
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
  return JSON.parse(JSON.stringify(result));
}

export async function addStringToKnowledgeBase(content : string) {
    try {
      const messages : Message[]= [{ role: 'system', content }];
      const result = await updateKnowledgeBase(messages); // Call to the server function
      console.log(result);
    } catch (error : any){
      console.log(error.message);
    }
};
