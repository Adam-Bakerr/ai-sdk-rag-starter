import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { updateKnowledgeBase } from '@/lib/actions/resources';


type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const DropzoneComponent: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onload = async () => {
        const content = reader.result as string;

        try {
          setLoading(true);
          setStatus('');

          const messages : Message[] = [{ role: 'system', content }];
          const result = await updateKnowledgeBase(messages); // Call the server function

          console.log(result);
          setStatus('Content added successfully!');
        } catch (error: any) {
          setStatus(`Error: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setStatus('Error reading file');
      };

      reader.readAsText(file); // Read file as text
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {
    'text/plain': ['.txt', '.pdf'],
  } });

  return (
    <div>
      <div {...getRootProps()} style={{ border: '2px dashed #ccc', padding: '20px' }}>
        <input {...getInputProps()} />
        <p>Drag & drop a file here, or click to select a file to add to the knowledge base</p>
      </div>
      {loading && <p>Loading...</p>}
      {status && <p>{status}</p>}
    </div>
  );
};

export default DropzoneComponent;