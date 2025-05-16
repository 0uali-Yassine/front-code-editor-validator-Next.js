import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { ChevronUp, ChevronDown, Play, RotateCcw, Code, Eye } from 'lucide-react';

const CodeEditore = () => {
  const [code, setCode] = useState(`# Start coding here
print("Hello World!")
`);
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('Theme'); // 'code' or 'preview'
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Function to run the code and update the output
  const runCode = async () => {
    // This is a mock implementation - in a real app you'd send the code to a backend
    setOutput(`Executing Python code...\n\n> ${code.split('\n').join('\n> ')}\n\nOutput:\nHello World!`);
  };

  // Reset code to default
  const resetCode = () => {
    setCode(`# Start coding here
print("Hello World!")
`);
    setOutput('');
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-lg bg-white">
      {/* Editor Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium">Python Editor</span>
          <div className="flex space-x-1">
            <button 
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${
                activeTab === 'code' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Code className="h-4 w-4 mr-1" />
              Editor
            </button>
            <button 
              onClick={() => setActiveTab('Theme')}
              className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${
                activeTab === 'Theme' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Eye className="h-4 w-4 mr-1" />
              Theme
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={resetCode}
            className="text-gray-500 hover:bg-gray-100 p-1 rounded-md"
            title="Reset Code"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="text-gray-500 hover:bg-gray-100 p-1 rounded-md"
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullScreen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Editor + Preview Area */}
      <div className={`flex ${isFullScreen ? 'h-screen' : 'h-96'}`}>
        {/* Left side: Code Editor (visible when activeTab is 'code' or on larger screens) */}
        <div className={`${
          activeTab === 'code' ? 'block w-full md:w-1/2' : 'hidden md:block md:w-1/2'
        } border-r border-gray-200`}>
          <CodeMirror
            value={code}
            height="100%"
           
            extensions={[python()]}
            onChange={(value) => setCode(value)}
            className="text-base"
          />
        </div>

        {/* Right side: Preview (visible when activeTab is 'preview' or on larger screens) */}
        <div className={`${
          activeTab === 'preview' ? 'block w-full md:w-1/2' : 'hidden md:block md:w-1/2'
        } bg-gray-900 text-white font-mono text-sm overflow-auto p-4`}>
          {output ? (
            <pre>{output}</pre>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p>Run your code to see the output here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Run button */}
      <div className="bg-gray-50 border-t border-gray-200 p-3 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {code.split('\n').length} lines | Python
        </div>
        <button  
          onClick={runCode}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition flex items-center"
        >
          <Play className="h-4 w-4 mr-2" />
          Run Code
        </button>
      </div>
    </div>
  );
};

export default CodeEditore;