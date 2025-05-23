import React, { useState, useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { githubLight } from '@uiw/codemirror-theme-github';
import { ChevronUp, ChevronDown, Play, RotateCcw, Sun, Moon, Maximize2, Minimize2 } from 'lucide-react';
import { FaPython } from "react-icons/fa";
import { FaJsSquare } from "react-icons/fa";
import { FaHtml5 } from "react-icons/fa6";
import { FaCss3Alt } from "react-icons/fa";
// import { loadPyodide } from '@pyodide/pyodide';
// import { loadPyodide } from 'pyodide';
// @ts-ignore - Skulpt types aren't great
import Sk from 'skulpt';

declare global {
  interface Window {
    loadPyodide: any;
    Sk: typeof Sk;
  }
}

// Add Language type
type Language = 'python' | 'javascript' | 'html' | 'css';

const CodeEditor = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('python');
  const [codes, setCodes] = useState<Record<Language, string>>({
    python: `# Start coding here\nprint("Hello World!")`,
    javascript: `// Start coding here\nconsole.log("Hello World!");`,
    html: `<!DOCTYPE html>\n<html>\n<head>\n  <title>Page</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>`,
    css: `/* Start coding here */\nbody {\n  background-color: lightblue;\n}`,
  });
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('Theme');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [executionEngine, setExecutionEngine] = useState<'pyodide' | 'skulpt'>('pyodide');
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pyodide, setPyodide] = useState<any>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);

  const languages = [
    { id: 'python', name: 'Python', icon: <FaPython/> },
    { id: 'javascript', name: 'JavaScript', icon: <FaJsSquare/> },
    { id: 'html', name: 'HTML', icon: <FaHtml5/> },
    { id: 'css', name: 'CSS', icon: <FaCss3Alt/> },
  ];

  // Initialize Pyodide
  useEffect(() => {
    if (selectedLanguage === 'python' && !pyodide && executionEngine === 'pyodide') {
      const loadPyodideInstance = async () => {
        setIsPyodideLoading(true);
        try {
          if (!window.loadPyodide) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js';
            script.onload = async () => {
              const pyodideInstance = await window.loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
                stdout: (text: string) => {
                  text.split('\n').forEach((line, idx, arr) => {
                    if (line !== '' || idx < arr.length - 1) {
                      setOutput(prev => prev + line + '\n');
                    }
                  });
                },
                stderr: (text: string) => setOutput(prev => prev + `\x1b[31m${text}\x1b[0m`),
              });
              await pyodideInstance.loadPackage(['micropip']);
              setPyodide(pyodideInstance);
              setOutput('✅ Pyodide loaded successfully! Ready to run Python code.\n');
            };
            document.body.appendChild(script);
          } else {
            const pyodideInstance = await window.loadPyodide({
              indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
              stdout: (text: string) => {
                text.split('\n').forEach((line, idx, arr) => {
                  if (line !== '' || idx < arr.length - 1) {
                    setOutput(prev => prev + line + '\n');
                  }
                });
              },
              stderr: (text: string) => setOutput(prev => prev + `\x1b[31m${text}\x1b[0m`),
            });
            await pyodideInstance.loadPackage(['micropip']);
            setPyodide(pyodideInstance);
            setOutput('✅ Pyodide loaded successfully! Ready to run Python code.\n');
          }
        } catch (error) {
          setOutput(`❌ Failed to load Pyodide: ${error}\n`);
        } finally {
          setIsPyodideLoading(false);
        }
      };
      loadPyodideInstance();
    }
    

    // Initialize Skulpt
    if (selectedLanguage === 'python' && executionEngine === 'skulpt') {
      window.Sk = Sk;
      configureSkulpt();
    }
  }, [selectedLanguage, executionEngine]);


  // Configure Skulpt for Python execution
  const configureSkulpt = () => {
    Sk.configure({
      output: (text: string) => {
        setOutput(prev => prev + text);
      },
      read: (x: string) => {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
          throw `File not found: '${x}'`;
        }
        return Sk.builtinFiles["files"][x];
      },
      __future__: Sk.python3,
    });
  };

  const getLanguageExtension = () => {
    switch (selectedLanguage) {
      case 'python': return [python()];
      case 'javascript': return [javascript()];
      case 'html': return [html()];
      case 'css': return [css()];
      default: return [python()];
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

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isFullScreen]);

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  const resetCode = () => {
    setCodes(prev => ({
      ...prev,
      [selectedLanguage]:
        selectedLanguage === 'python' 
          ? `# Start coding here\nprint("Hello World!")`
          : selectedLanguage === 'javascript'
          ? `// Start coding here\nconsole.log("Hello World!");`
          : selectedLanguage === 'html'
          ? `<!DOCTYPE html>\n<html>\n<head>\n  <title>Page</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>`
          : `/* Start coding here */\nbody {\n  background-color: lightblue;\n}`
    }));
    setOutput('');
  };

  const runCode = async () => {
    setOutput(''); // Clear previous output
    
    try {
      switch (selectedLanguage) {
        case 'python':
          await runPythonCode();
          break;
        case 'javascript':
          runJavaScriptCode();
          break;
        case 'html':
        case 'css':
          renderHtmlCss();
          break;
        default:
          setOutput('Unsupported language');
      }
    } catch (error) {
      setOutput(formatError(error));
    }
  };

  const runPythonCode = async () => {
    setOutput('Running Python code...\n');
    
    if (executionEngine === 'pyodide') {
      if (!pyodide) {
        setOutput('Pyodide is still loading...');
        return;
      }
      try {
        //why? The environment is not being reset, so old state persists.
        // Create a fresh namespace for each run
      const pyNamespace = pyodide.globals.get("dict")();
      await pyodide.runPythonAsync(codes['python'], { globals: pyNamespace });
      } catch (error) {
        setOutput(formatError(error));
      }
    } else {
      // Skulpt execution
      try {
        Sk.importMainWithBody("<stdin>", false, codes['python'], true);
      } catch (error) {
        setOutput(formatError(error));
      }
    }
  };

  const runJavaScriptCode = () => {
    setOutput('Running JavaScript code...\n');
    try {
      // Capture console.log output
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        setOutput(prev => prev + args.join(' ') + '\n');
        originalConsoleLog(...args);
      };
      
      // Execute the code
      new Function(codes['javascript'])();
      
      // Restore original console.log
      console.log = originalConsoleLog;
    } catch (error) {
      setOutput(formatError(error));
    }
  };

  const renderHtmlCss = () => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // Always combine HTML, CSS, and JS
    let htmlCode = codes['html'] || '';
    const cssCode = codes['css'] || '';
    const jsCode = codes['javascript'] || '';

    // Inject CSS into <head>
    if (htmlCode.includes('<head>')) {
      htmlCode = htmlCode.replace(
        '<head>',
        `<head><style>${cssCode}</style>`
      );
    } else {
      htmlCode = htmlCode.replace(
        '<html>',
        `<html><head><style>${cssCode}</style></head>`
      );
    }

    const wrappedJsCode = `
    document.addEventListener('DOMContentLoaded', function() {
      try {
        ${jsCode}
      } catch (e) {
        console.error(e);
      }
    });
    `;
    // Inject JS before </body>
    if (htmlCode.includes('</body>')) {
      htmlCode = htmlCode.replace(
        '</body>',
        `<script>${wrappedJsCode}</script></body>`
      );
    } else {
      htmlCode += `<script>${wrappedJsCode}</script>`;
    }

    doc.open();
    doc.write(htmlCode);
    doc.close();

    setOutput('Rendered HTML/CSS/JS in preview pane');
  };

  function formatError(error:any) {
    // Check if it's a Python traceback
    if (error.toString().includes('Traceback')) {
        // Clean up the error message
        let errorMsg = error.toString();
        
        // Remove Pyodide-specific parts
        errorMsg = errorMsg.replace(/Error: \n/, '');
        errorMsg = errorMsg.replace(/at executePython.*/, '');
        
        // Highlight the error type
        const lines = errorMsg.split('\n');
        if (lines.length > 2) {
            const lastLine = lines[lines.length-1];
            errorMsg = errorMsg.replace(lastLine, `\n💥 ${lastLine.trim()}`);
        }
        
        return errorMsg;
    }
    return `Error: ${error}`;
}
  // const formatError = (error: any) => {
  //   if (typeof error === 'string') return error;
  //   if (error.message) return error.message;
  //   if (error.toString) return error.toString();
  //   return 'Unknown error occurred';
  // };

  return (
    <div className={`rounded-lg overflow-hidden border transition-colors duration-300 ${
      isDarkMode ? 'border-gray-700 shadow-lg bg-slate-900' : 'border-gray-200 shadow-lg bg-white'
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
                onClick={() =>{ 
                  setSelectedLanguage(lang.id as Language)
                  setOutput('')
                }}
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
          
          {selectedLanguage === 'python' && (
            <div className={`flex items-center space-x-1 rounded-lg p-1 ml-2 transition-colors duration-300 ${
              isDarkMode ? 'bg-slate-700/50' : 'bg-gray-100'
            }`}>
              <button
                onClick={() => setExecutionEngine('pyodide')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  executionEngine === 'pyodide'
                    ? isDarkMode ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-900'
                    : isDarkMode ? 'text-gray-400 hover:bg-slate-600/50' : 'text-gray-600 hover:bg-gray-200/50'
                }`}
              >
                Pyodide
              </button>
              <button
                onClick={() => setExecutionEngine('skulpt')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  executionEngine === 'skulpt'
                    ? isDarkMode ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-900'
                    : isDarkMode ? 'text-gray-400 hover:bg-slate-600/50' : 'text-gray-600 hover:bg-gray-200/50'
                }`}
              >
                Skulpt
              </button>
            </div>
          )}
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
              value={codes[selectedLanguage]}
              height={isFullScreen ? "calc(100vh - 110px)" : "80vh"}
              theme={isDarkMode ? dracula : githubLight}
              extensions={getLanguageExtension()}
              onChange={(value) => setCodes(prev => ({ ...prev, [selectedLanguage]: value }))}
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

          {/* Right side: Output/Preview */}
          <div 
            className={`${
              isFullScreen 
                ? 'h-full'
                : (activeTab === 'preview' ? 'block' : 'hidden md:block')
            } transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-slate-800 text-gray-200' 
                : 'bg-gray-50 text-gray-900'
            } font-mono text-sm overflow-hidden flex flex-col`}
            style={{ width: `${100 - leftWidth}%` }}
          >
            {(selectedLanguage === 'html' || selectedLanguage === 'css') ? (
              <iframe
                ref={iframeRef}
                title="output-preview"
                className="flex-grow w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="p-4 flex-grow  overflow-y-auto  h-full">
                {output ? (
                  <pre className={`whitespace-pre-wrap h-[100%] ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {output}
                  </pre>
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
            )}
          </div>
        </div>
      </div>

      {/* Footer with Run button */}
      <div className={`border-t p-3 flex justify-between items-center transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      } ${isFullScreen ? 'fixed bottom-0 left-0 right-0 z-50' : ''}`}>
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {codes[selectedLanguage].split('\n').length} lines | {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
          {selectedLanguage === 'python' && ` (${executionEngine})`}
        </div>
        <button  
          onClick={runCode}
          disabled={isPyodideLoading}
          className={`
            px-4 py-2 rounded-none font-medium tracking-wide uppercase text-xs
            flex items-center justify-center min-w-[120px]
            transition-all duration-200
            ${isPyodideLoading 
              ? isDarkMode
                ? 'bg-gray-700 text-gray-400 cursor-wait'
                : 'bg-gray-200 text-gray-500 cursor-wait'
              : isDarkMode
                ? 'bg-transparent border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 active:bg-emerald-500/20'
                : 'bg-transparent border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100'
            }
            ${isFullScreen ? 'hover:scale-105 active:scale-95' : ''}
          `}
        >
          {isPyodideLoading ? (
            <svg className="animate-spin h-3 w-3 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Play className="h-3 w-3 mr-2" />
          )}
          {isPyodideLoading ? 'Loading...' : 'Execute'}
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

export default CodeEditor;