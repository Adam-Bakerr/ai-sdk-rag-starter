// /components/DropzoneComponent.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

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

          const messages = [{ role: 'system', content }];

          const response = await fetch('/api/updateKnowledgeBase', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages }),
          });

          const text = await response.text(); // Get the raw response as text
          console.log('Raw response:', text);

          // Attempt to parse the response as JSON
          if (response.ok) {
            const result = JSON.parse(text);
            console.log(result);
            setStatus('Content added successfully!');
          } else {
            setStatus(`Error: ${text}`);
          }
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

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'], // Accept only text files with .txt extension
    },
  });

  return (
    <div>
      <div {...getRootProps()} style={{ border: '2px dashed #ccc', padding: '20px' }}>
        <input {...getInputProps()} />
        <p>Drag & drop a text file here, or click to select a file</p>
      </div>
      {loading && <p>Loading...</p>}
      {status && <p>{status}</p>}
    </div>
  );
};

export default DropzoneComponent;
