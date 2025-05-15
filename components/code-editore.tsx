import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { dracula } from '@uiw/codemirror-theme-dracula';

const CodeEditore: React.FC = () => {
  const [code, setCode] = useState<string>(`#start code here`);

  const runCode = async () => {
    // Implementation for running code would go here
    console.log('Running code:', code);
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
        onClick={runCode}
        className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition"
      >
        Run code
      </button>
    </div>
  );
};

export default CodeEditore;