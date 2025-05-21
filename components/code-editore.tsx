import React, { useState, useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { githubLight } from '@uiw/codemirror-theme-github';
import {  Play, RotateCcw, Sun, Moon, Maximize2, Minimize2 } from 'lucide-react';

const CodeEditore = () => {
  const [code, setCode] = useState(`# Start coding here
print("Hello World!")
`);
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('Theme');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  

  const languages = [
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'javascript', name: 'JavaScript', icon: '📜' },
    { id: 'html', name: 'HTML', icon: '🌐' },
    { id: 'css', name: 'CSS', icon: '🎨' },
  ];

  const getLanguageExtension = () => {
    switch (selectedLanguage) {
      case 'python':
        return [python()];
      case 'javascript':
        return [javascript()];
      case 'html':
        return [html()];
      case 'css':
        return [css()];
      default:
        return [python()];
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      if (newLeftWidth >= 20 && newLeftWidth <= 80) {
        setLeftWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isFullScreen]);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Function to run the code and update the output
  const runCode = async () => {
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
    <div className={`rounded-lg overflow-hidden border transition-colors duration-300 ${
      isDarkMode 
        ? 'border-gray-700 shadow-lg bg-slate-900' 
        : 'border-gray-200 shadow-lg bg-white'
    }`}>
      {/* Editor Header */}
      <div className={`border-b p-3 flex items-center justify-between transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 rounded-lg p-1 transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-700/50' : 'bg-gray-100'
          }`}>
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium
                  transition-all duration-200 flex items-center
                  ${selectedLanguage === lang.id
                    ? isDarkMode 
                      ? 'bg-slate-600 text-white' 
                      : 'bg-gray-200 text-gray-900'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-slate-600/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                  }
                `}
              >
                <span className="mr-1.5">{lang.icon}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-md transition-colors duration-200 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-slate-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button 
            onClick={resetCode}
            className={`p-2 rounded-md transition-colors duration-200 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-slate-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
            title="Reset Code"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button 
            onClick={toggleFullScreen}
            className={`p-2 rounded-md transition-colors duration-200 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-slate-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullScreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Editor + Preview Area */}
      <div 
        ref={editorContainerRef}
        className={`${
          isFullScreen 
            ? 'fixed inset-0 z-50 flex flex-col' 
            : 'flex h-96'
        } ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}
      >
        {isFullScreen && (
          <div className={`p-2 flex justify-between items-center transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-800' : 'bg-gray-50'
          }`}>
            <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Esc</span>
            <button 
              onClick={toggleFullScreen} 
              className={`transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <div 
          ref={containerRef}
          className={`${isFullScreen ? 'flex flex-grow w-full' : 'flex h-full w-full'} relative`}
        >
          {/* Left side: Code Editor */}
          <div 
            className={`${
              isFullScreen 
                ? 'h-full'
                : (activeTab === 'code' ? 'block' : 'hidden md:block')
            } border-r transition-colors duration-300 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            } overflow-hidden`}
            style={{ width: `${leftWidth}%` }}
          >
            <CodeMirror
              value={code}
              height={isFullScreen ? "calc(100vh - 110px)" : "80vh"}
              theme={isDarkMode ? dracula : githubLight}
              extensions={getLanguageExtension()}
              onChange={(value) => setCode(value)}
              className="text-base overflow-auto"
            />
          </div>

          {/* Resizer */}
          <div
            className={`absolute top-0 bottom-0 w-1 cursor-col-resize transition-colors duration-200 ${
              isDragging 
                ? 'bg-indigo-600' 
                : isDarkMode 
                  ? 'bg-gray-700 hover:bg-indigo-500' 
                  : 'bg-gray-200 hover:bg-indigo-500'
            }`}
            style={{ left: `${leftWidth}%`, transform: 'translateX(-50%)' }}
            onMouseDown={handleMouseDown}
          />

          {/* Right side: Preview */}
          <div 
            className={`${
              isFullScreen 
                ? 'h-full'
                : (activeTab === 'preview' ? 'block' : 'hidden md:block')
            } transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-slate-800 text-gray-200' 
                : 'bg-gray-50 text-gray-900'
            } font-mono text-sm overflow-auto p-4`}
            style={{ width: `${100 - leftWidth}%` }}
          >
            {output ? (
              <pre className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{output}</pre>
            ) : (
              <div className={`flex items-center justify-center h-full ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <div className="text-center">
                  <p>Run your code to see the output here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer with Run button */}
      <div className={`border-t p-3 flex justify-between items-center transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      } ${isFullScreen ? 'fixed bottom-0 left-0 right-0 z-50' : ''}`}>
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {code.split('\n').length} lines | {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
        </div>
        <button  
          onClick={runCode}
          className={`
            px-4 py-2 rounded-none font-medium tracking-wide uppercase text-xs
            flex items-center justify-center min-w-[120px]
            transition-all duration-200
            ${isDarkMode
              ? 'bg-transparent border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 active:bg-emerald-500/20'
              : 'bg-transparent border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100'
            }
            ${isFullScreen ? 'hover:scale-105 active:scale-95' : ''}
          `}
        >
          <Play className="h-3 w-3 mr-2" />
          Execute
        </button>
      </div>

      {/* Fullscreen Mode Controls */}
      {isFullScreen && (
        <div className={`fixed top-0 right-0 p-2 flex items-center space-x-2 z-50 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800/90' : 'bg-gray-50/90'
        }`}>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-md transition-all duration-200 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-slate-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            } ${isFullScreen ? 'hover:scale-110 active:scale-95' : ''}`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button 
            onClick={resetCode}
            className={`p-2 rounded-md transition-all duration-200 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-slate-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            } ${isFullScreen ? 'hover:scale-110 active:scale-95' : ''}`}
            title="Reset Code"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CodeEditore;