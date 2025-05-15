import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { dracula } from '@uiw/codemirror-theme-dracula';
import useSWRMutation from 'swr/mutation';
import { SectionType, PageType } from '../types';

interface CheckEditorProps {
  data: {
    page: PageType;
    sections: SectionType[];
    sectionWithCode: any[];
    userId: string;
  };
  Sections: SectionType[];
  onChange: () => void;
}

const submitCodeFetcher = async (url: string, { arg }: { arg: any }) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important: include cookies in the request
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit code');
  }

  return await response.json();
};

const CheckEditor: React.FC<CheckEditorProps> = ({ data, Sections, onChange }) => {
  const [code, setCode] = useState<string>(`#start code here & hit submit code`);
  
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/student/check-code',
    submitCodeFetcher
  );

  const submitCode = async () => {
    try {
      const result = await trigger({
        code,
        userId: data.userId,
        pageId: data.page._id,
        sectionId: Sections[0]._id,
        exercise: Sections[0].description,
      });
      console.log('Code check response:', result);
      onChange();  
    } catch (err) {
      console.error('Error submitting code:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div>
      <CodeMirror
        value={code}
        height="200px"
        width="80%"
        theme={dracula}
        extensions={[python()]}
        onChange={(value) => setCode(value)}
      />
      <button 
        onClick={submitCode}
        className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition"
        disabled={isMutating}
      >
        {isMutating ? 'Submitting...' : 'Submit code'}
      </button>
    </div>
  );
};

export default CheckEditor;