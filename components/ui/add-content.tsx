// src/components/AddContentForm.tsx
"use client";

import React, { useState } from 'react';
import { updateKnowledgeBase } from '@/lib/actions/resources';
// Define the Message type
type Message = {
  role: 'user' | 'assistant' | 'system'; // specific allowed roles
  content: string;
};
const AddContentForm: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);

    try {
      const messages : Message[]= [{ role: 'system', content }];
      const result = await updateKnowledgeBase(messages); // Call to the server function
      console.log(result);
      setContent('');
      setStatus('Content added successfully!');
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add content to knowledge base"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Content'}
      </button>
      {status && <p>{status}</p>}
    </form>
  );
};

export default AddContentForm;

