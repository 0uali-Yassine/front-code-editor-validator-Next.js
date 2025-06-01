'use client';

import React, { useState, useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { githubLight } from '@uiw/codemirror-theme-github';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { materialDark } from '@uiw/codemirror-theme-material';
import {
  Play, RotateCcw, Sun, Moon, Maximize2, Minimize2, Edit2, 
  Trash2, FilePlus2, X, FileText, Terminal, Settings, 
  Download, Upload, Copy, BookOpen, Lightbulb, Code2
} from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaPython, FaJsSquare } from "react-icons/fa";
import { FaHtml5, FaCss3Alt } from "react-icons/fa6";
import JSZip from 'jszip';
import { EditorView } from '@codemirror/view';
import { indentUnit } from '@codemirror/language';

type FileType = 'html' | 'css' | 'js' | 'py' | 'txt';

interface FileData {
  name: string;
  type: FileType;
  content: string;
}

interface SettingsState {
  fontSize: number;
  theme: 'dark' | 'light' | 'vscode' | 'material';
  wordWrap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  tabSize: number;
  autoComplete: boolean;
}

const defaultFiles: FileData[] = [
  { name: 'index.html', type: 'html', content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>My Project</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <h1>Hello World!</h1>\n    <script src="main.js"></script>\n</body>\n</html>' },
  { name: 'style.css', type: 'css', content: 'body {\n    font-family: Arial, sans-serif;\n    background: #f0f0f0;\n    margin: 0;\n    padding: 20px;\n}\n\nh1 {\n    color: #333;\n    text-align: center;\n}' },
  { name: 'main.js', type: 'js', content: 'console.log("Hello from JavaScript!");\n\n// Add interactivity\ndocument.addEventListener("DOMContentLoaded", function() {\n    console.log("Page loaded!");\n});' },
  { name: 'main.py', type: 'py', content: 'def hello_world():\n    print("Hello from Python!")\n    return "Python is working!"\n\nresult = hello_world()\nprint(f"Result: {result}")' },
];

const defaultSettings: SettingsState = {
  fontSize: 14,
  theme: 'dark',
  wordWrap: true,
  lineNumbers: true,
  autoSave: false,
  tabSize: 4,
  autoComplete: true,
};

const codeTemplates = {
  python: {
    'Basic Function': 'def my_function():\n    """Description of function"""\n    pass\n\nmy_function()',
    'Class Template': 'class MyClass:\n    def _init_(self):\n        self.attribute = None\n    \n    def method(self):\n        pass',
    'For Loop': 'for i in range(10):\n    print(i)',
    'Try-Except': 'try:\n    # Your code here\n    pass\nexcept Exception as e:\n    print(f"Error: {e}")',
    'List Comprehension': 'result = [x for x in range(10) if x % 2 == 0]\nprint(result)',
  },
  javascript: {
    'Function': 'function myFunction() {\n    console.log("Hello World");\n}\n\nmyFunction();',
    'Arrow Function': 'const myFunction = () => {\n    console.log("Hello World");\n};\n\nmyFunction();',
    'For Loop': 'for (let i = 0; i < 10; i++) {\n    console.log(i);\n}',
    'Object': 'const myObject = {\n    property: "value",\n    method() {\n        console.log(this.property);\n    }\n};',
  },
  html: {
    'Basic HTML': '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n</body>\n</html>',
    'Form': '<form>\n    <label for="name">Name:</label>\n    <input type="text" id="name" name="name" required>\n    <button type="submit">Submit</button>\n</form>',
  },
  css: {
    'Basic Styles': 'body {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f0f0f0;\n}',
    'Flexbox': '.container {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    height: 100vh;\n}',
  }
};

const getLanguageExtension = (type: FileType) => {
  switch (type) {
    case 'html': return [html()];
    case 'css': return [css()];
    case 'js': return [javascript()];
    case 'py': return [python()];
    default: return [];
  }
};

const getFileIcon = (fileName: string) => {
  const FileIcons = {
    py: <FaPython className="w-4 h-4 text-[#3572A5] mr-2" />,
    js: <FaJsSquare className="w-4 h-4 text-[#F7DF1E] mr-2" />,
    html: <FaHtml5 className="w-4 h-4 text-[#E34F26] mr-2" />,
    css: <FaCss3Alt className="w-4 h-4 text-[#1572B6] mr-2" />,
    txt: <FileText className="w-4 h-4 text-[#6e6e6e] mr-2" />,
  };
  const extension = fileName.split('.').pop() as keyof typeof FileIcons;
  return FileIcons[extension] || <FileText className="w-4 h-4 mr-2" />;
};

const getTheme = (themeName: string, isDarkMode: boolean) => {
  switch (themeName) {
    case 'vscode': return vscodeDark;
    case 'material': return materialDark;
    case 'dark': return oneDark;
    case 'light': return githubLight;
    default: return isDarkMode ? oneDark : githubLight;
  }
};

interface SortableFileProps {
  file: FileData;
  activeFile: string;
  isDarkMode: boolean;
  onClick: (name: string) => void;
  onDelete: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
  renamingFile: string | null;
  setRenamingFile: (name: string | null) => void;
  renameValue: string;
  setRenameValue: (v: string) => void;
}

function SortableFile({
  file,
  activeFile,
  isDarkMode,
  onClick,
  onDelete,
  onRename,
  renamingFile,
  setRenamingFile,
  renameValue,
  setRenameValue,
}: SortableFileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: file.name });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  const handleFileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging && renamingFile !== file.name) {
      onClick(file.name);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isDragging) {
      setRenamingFile(file.name);
      setRenameValue(file.name);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center px-3 py-1.5 group transition-all duration-150 text-sm
        ${activeFile === file.name
          ? isDarkMode
            ? "bg-[#37373d] text-white border-l-2 border-l-blue-500"
            : "bg-[#e8f4fd] text-[#0066cc] border-l-2 border-l-blue-500"
          : isDarkMode
            ? "hover:bg-[#2a2d2e] text-[#cccccc]"
            : "hover:bg-[#f3f3f3] text-[#383838]"
        }`}
    >
      {/* Drag handle */}
      <div 
        {...attributes}
        {...listeners}
        className="flex items-center justify-center w-3 h-3 mr-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-60 transition-opacity"
        title="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        ⋮⋮
      </div>

      {/* File content area */}
      <div 
        className="flex items-center flex-1 cursor-pointer select-none"
        onClick={handleFileClick}
        onDoubleClick={handleDoubleClick}
      >
        {getFileIcon(file.name)}
        {renamingFile === file.name ? (
          <input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className={`flex-1 p-1 rounded bg-transparent border ${
              isDarkMode ? "border-[#464647] text-white focus:border-blue-500" : "border-gray-300 text-gray-900 focus:border-blue-500"
            } outline-none`}
            onBlur={() => {
              if (renameValue.trim() && renameValue.trim() !== file.name) {
                onRename(file.name, renameValue.trim());
              }
              setRenamingFile(null);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                if (renameValue.trim() && renameValue.trim() !== file.name) {
                  onRename(file.name, renameValue.trim());
                }
                setRenamingFile(null);
              }
              if (e.key === "Escape") {
                setRenamingFile(null);
              }
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate font-mono">
            {file.name}
          </span>
        )}
      </div>
      
      {/* Action buttons */}
      {renamingFile !== file.name && (
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRenamingFile(file.name);
              setRenameValue(file.name);
            }}
            className={`p-1 rounded hover:bg-opacity-20 ${isDarkMode ? "hover:bg-white" : "hover:bg-black"}`}
            title="Rename file (or double-click)"
            tabIndex={-1}
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file.name);
            }}
            className={`p-1 rounded hover:bg-opacity-20 ${isDarkMode ? "hover:bg-white" : "hover:bg-black"}`}
            title="Delete file"
            tabIndex={-1}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

const UnifiedEditor = () => {
  const [files, setFiles] = useState<FileData[]>(defaultFiles);
  const [activeFile, setActiveFile] = useState('index.html');
  const [openTabs, setOpenTabs] = useState<string[]>(['index.html']);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [output, setOutput] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [leftWidth, setLeftWidth] = useState(25);
  const [isDragging, setIsDragging] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  const [activeView, setActiveView] = useState<'web' | 'python'>('web');
  const [showTemplates, setShowTemplates] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('unified-editor-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('unified-editor-settings', JSON.stringify(settings));
  }, [settings]);

  // Load Pyodide for Python execution
  useEffect(() => {
    const loadPyodideInstance = async () => {
      setIsPyodideLoading(true);
      try {
        if (!window.loadPyodide) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
          script.onload = async () => {
            const pyodideInstance = await window.loadPyodide({
              indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
              stdout: (text: string) => setOutput(prev => prev + text),
              stderr: (text: string) => setOutput(prev => prev + `\x1b[31m${text}\x1b[0m`),
            });
            setPyodide(pyodideInstance);
            setOutput('✅ Python environment loaded! Ready to run Python code.\n');
          };
          document.body.appendChild(script);
        }
      } catch (error) {
        setOutput(`❌ Failed to load Python environment: ${error}\n`);
      } finally {
        setIsPyodideLoading(false);
      }
    };
    loadPyodideInstance();
  }, []);

  // File management functions
  const getFile = (name: string) => files.find(f => f.name === name);
  
  const updateFile = (name: string, content: string) => {
    setFiles(files => files.map(f => f.name === name ? { ...f, content } : f));
  };
  
  const addFile = () => {
    let idx = 1;
    let newName = 'untitled.txt';
    while (files.some(f => f.name === newName)) {
      newName = `untitled${idx}.txt`;
      idx++;
    }
    const newFile = { name: newName, content: '', type: 'txt' as FileType };
    setFiles(prev => [...prev, newFile]);
    setActiveFile(newName);
    setOpenTabs(prev => [...prev, newName]);
    setTimeout(() => {
      setRenamingFile(newName);
      setRenameValue(newName);
    }, 100);
  };
  
  const deleteFile = (name: string) => {
    if (files.length === 1) return;
    setFiles(files => files.filter(f => f.name !== name));
    setOpenTabs(tabs => tabs.filter(tab => tab !== name));
    
    if (activeFile === name) {
      const remainingTabs = openTabs.filter(tab => tab !== name);
      if (remainingTabs.length > 0) {
        setActiveFile(remainingTabs[remainingTabs.length - 1]);
      } else {
        setActiveFile(files[0]?.name || 'index.html');
        setOpenTabs([files[0]?.name || 'index.html']);
      }
    }
  };
  
  const renameFile = (oldName: string, newName: string) => {
    if (!newName || files.some(f => f.name === newName)) return;
    
    // Get the new file type from extension
    const extension = newName.split('.').pop() as FileType;
    const newType: FileType = ['py', 'js', 'html', 'css', 'txt'].includes(extension) ? extension : 'txt';
    
    setFiles(files => files.map(f => 
      f.name === oldName ? { ...f, name: newName, type: newType } : f
    ));
    setOpenTabs(tabs => tabs.map(tab => tab === oldName ? newName : tab));
    if (activeFile === oldName) setActiveFile(newName);
  };

  // Drag and drop handler
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = files.findIndex(f => f.name === active.id);
      const newIndex = files.findIndex(f => f.name === over.id);
      setFiles(arrayMove(files, oldIndex, newIndex));
    }
  };

  // Resize handler
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
      if (newLeftWidth >= 15 && newLeftWidth <= 50) {
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

  // Web preview renderer (HTML/CSS/JS)
  const renderWebPreview = () => {
    if (!iframeRef.current) return;
    setActiveView('web');
    const iframe = iframeRef.current;
    iframe.src = 'about:blank';
    
    iframe.onload = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      // Create blob URLs for all JS files
      const jsModules = new Map();
      const jsFiles = files.filter(f => f.type === 'js');

      // First pass: create blob URLs for all files
      jsFiles.forEach(file => {
        const blob = new Blob([file.content], { type: 'application/javascript' });
        jsModules.set(file.name, URL.createObjectURL(blob));
      });

      // Second pass: replace imports in each file
      const processedJs = jsFiles.map(file => {
        let processedContent = file.content;
        jsFiles.forEach(otherFile => {
          if (otherFile.name !== file.name) {
            const importPath = `./${otherFile.name}`;
            const blobUrl = jsModules.get(otherFile.name);
            processedContent = processedContent.replace(
              new RegExp(`from ['"]${importPath}['"]`, 'g'),
              `from '${blobUrl}'`
            );
          }
        });
        return {
          name: file.name,
          url: URL.createObjectURL(new Blob([processedContent], { type: 'application/javascript' }))
        };
      });

      // Get HTML and CSS files
      const htmlFile = files.find(f => f.type === 'html');
      const cssFiles = files.filter(f => f.type === 'css');

      // Build HTML content
      let html = htmlFile?.content || '<div id="app"></div>';
      
      // Inject CSS
      const allCss = cssFiles.map(f => f.content).join('\n');
      if (allCss) {
        const styleTag = `<style>${allCss}</style>`;
        if (html.includes('</head>')) {
          html = html.replace('</head>', `${styleTag}</head>`);
        } else {
          html = `<head>${styleTag}</head>${html}`;
        }
      }

      // Inject JS modules
      const scriptTags = processedJs.map(({ name, url }) => 
        `<script type="module" src="${url}"></script>`
      ).join('\n');

      if (scriptTags) {
        if (html.includes('</body>')) {
          html = html.replace('</body>', `${scriptTags}</body>`);
        } else {
          html += scriptTags;
        }
      }

      // Write to iframe
      doc.open();
      doc.write(html);
      doc.close();

      // Cleanup blob URLs after a delay
      setTimeout(() => {
        jsModules.forEach(url => URL.revokeObjectURL(url));
        processedJs.forEach(({ url }) => URL.revokeObjectURL(url));
      }, 1000);
    };
  };

  // Python code runner
  const runPythonCode = async () => {
    if (!pyodide) {
      setOutput('Python environment is still loading...\n');
      return;
    }
    
    setOutput('');
    setActiveView('python');
    
    try {
      // Write all Python files to virtual filesystem
      const pythonFiles = files.filter(f => f.type === 'py');
      for (const file of pythonFiles) {
        pyodide.FS.writeFile(file.name, file.content);
      }
      
      // Run the active Python file
      const activeFileData = getFile(activeFile);
      if (activeFileData && activeFileData.type === 'py') {
        const result = await pyodide.runPythonAsync(`
import sys
from io import StringIO

old_stdout = sys.stdout
sys.stdout = StringIO()

try:
    exec(open('${activeFile}').read())
    output = sys.stdout.getvalue()
except Exception as e:
    output = str(e)
finally:
    sys.stdout = old_stdout

output
        `);
        setOutput(result || 'Code executed successfully (no output)');
      }
    } catch (error) {
      setOutput(`Error: ${error}`);
    }
  };

  // Export project as ZIP
  const exportProject = async () => {
    try {
      const zip = new JSZip();
      
      files.forEach(file => {
        zip.file(file.name, file.content || '');
      });
      
      // Add README
      const readmeContent = `# Unified Web & Python Project

This project was exported from YZ Unified Code Editor.

## Files:
${files.map(f => `- ${f.name} (${f.type.toUpperCase()})`).join('\n')}

## Web Files (HTML/CSS/JS):
- Open index.html in a browser to see the web preview
- Or use a local server for better module support

## Python Files:
- Run Python files with: python filename.py
- Make sure Python 3.x is installed

Happy coding! 🚀
`;
      
      zip.file('README.md', readmeContent);
      
      const content = await zip.generateAsync({ type: 'blob' });
      const fileName = `unified-project-${new Date().toISOString().slice(0, 10)}.zip`;
      
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setOutput(`✅ Project exported as: ${fileName}\n`);
    } catch (error) {
      setOutput(`❌ Export failed: ${error}\n`);
    }
  };

  const closeTab = (tabName: string) => {
    const newTabs = openTabs.filter(tab => tab !== tabName);
    setOpenTabs(newTabs);
    
    if (activeFile === tabName) {
      if (newTabs.length > 0) {
        const lastTab = newTabs[newTabs.length - 1];
        setActiveFile(lastTab);
      } else {
        setActiveFile(files[0]?.name || 'index.html');
        setOpenTabs([files[0]?.name || 'index.html']);
      }
    }
  };

  const forceDownloadZip = async () => {
    try {
      const zip = new JSZip();
      
      files.forEach(file => {
        zip.file(file.name, file.content || '');
      });
      
      const content = await zip.generateAsync({ type: 'base64' });
      
      // Create a data URL
      const dataUrl = `data:application/zip;base64,${content}`;
      
      // Open in new window as fallback
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Download ZIP</title></head>
            <body>
              <h2>Your ZIP file is ready!</h2>
              <p>Right-click the link below and select "Save link as..." to download:</p>
              <a href="${dataUrl}" download="web-project.zip">Download web-project.zip</a>
              <script>
                // Auto-download attempt
                const link = document.querySelector('a');
                link.click();
              </script>
            </body>
          </html>
        `);
      }
      
      setOutput('✅ Alternative download method used. Check the new window/tab.\n');
    } catch (error) {
      setOutput(`❌ Alternative download failed: ${error}\n`);
    }
  };

  const downloadIndividualFiles = () => {
    files.forEach((file, index) => {
      setTimeout(() => {
        const content = file.content || '';
        const blob = new Blob([content], { 
          type: 'text/plain;charset=utf-8' 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, index * 200);
    });
    
    // Also download a README file
    setTimeout(() => {
      const readmeContent = `# Web & Python Project Files

These files were exported from YZ Unified Code Editor.

## Setup Instructions:
1. Create a new folder for your project
2. Move all downloaded files into that folder
3. Open the folder in VS Code
4. Start coding!

Files included:
${files.map(f => `- ${f.name}`).join('\n')}
`;
      
      const blob = new Blob([readmeContent], { 
        type: 'text/plain;charset=utf-8' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'README.md';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, files.length * 200 + 100);
    
    setOutput('✅ All files downloaded individually! Create a folder, move them there, then open in VS Code.\n📄 README.md included with setup instructions.\n');
  };

  const importFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setOutput('🔄 Importing project...\n');

    try {
      // Check file type
      if (file.name.endsWith('.zip')) {
        // Handle ZIP file import
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        const importedFiles: FileData[] = [];

        // Extract all files from ZIP
        for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
          // Skip directories and README.md
          if (!zipEntry.dir && filename !== 'README.md') {
            const content = await zipEntry.async('string');
            const type = filename.split('.').pop() as FileType;
            importedFiles.push({
              name: filename,
              type,
              content: content
            });
          }
        }

        if (importedFiles.length === 0) {
          setOutput('❌ No valid files found in ZIP archive.\n');
          return;
        }

        // Set the imported files
        setFiles(importedFiles);
        
        // Set active file (prefer index.html, otherwise first file)
        const indexFile = importedFiles.find(f => f.name === 'index.html');
        const activeFileName = indexFile ? 'index.html' : importedFiles[0].name;
        
        setActiveFile(activeFileName);
        setOpenTabs([activeFileName]);

        setOutput(`✅ Successfully imported ${importedFiles.length} files from ZIP!\n📁 Files: ${importedFiles.map(f => f.name).join(', ')}\n`);

      } else {
        // Handle individual file import
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const type = file.name.split('.').pop() as FileType;
          const newFile: FileData = {
            name: file.name,
            type,
            content: content
          };

          // Add to existing files or replace if same name exists
          setFiles(prevFiles => {
            const existingIndex = prevFiles.findIndex(f => f.name === file.name);
            if (existingIndex >= 0) {
              // Replace existing file
              const updatedFiles = [...prevFiles];
              updatedFiles[existingIndex] = newFile;
              return updatedFiles;
            } else {
              // Add new file
              return [...prevFiles, newFile];
            }
          });

          setActiveFile(file.name);
          setOpenTabs(prev => prev.includes(file.name) ? prev : [...prev, file.name]);

          setOutput(`✅ Successfully imported file: ${file.name}\n`);
        };
        reader.readAsText(file);
      }

    } catch (error) {
      console.error('Import error:', error);
      setOutput(`❌ Error importing file: ${error}\n`);
    }

    // Clear the input so the same file can be imported again
    event.target.value = '';
  };

  // Settings Panel Component
  const SettingsPanel = () => {
    if (!showSettings) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`w-96 max-h-[80vh] overflow-y-auto rounded-lg shadow-xl ${
          isDarkMode ? 'bg-[#252526] text-white' : 'bg-white text-gray-900'
        }`}>
          <div className={`flex items-center justify-between p-4 border-b ${
            isDarkMode ? 'border-[#464647]' : 'border-gray-200'
          }`}>
            <h3 className="text-lg font-semibold">Settings</h3>
            <button onClick={() => setShowSettings(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Font Size</label>
              <input
                type="range"
                min="10"
                max="24"
                value={settings.fontSize}
                onChange={(e) => setSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{settings.fontSize}px</span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Editor Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as any }))}
                className={`w-full p-2 rounded border ${
                  isDarkMode 
                    ? 'bg-[#3c3c3c] border-[#464647] text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="dark">One Dark</option>
                <option value="light">GitHub Light</option>
                <option value="vscode">VS Code Dark</option>
                <option value="material">Material Dark</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span>Word Wrap</span>
                <input
                  type="checkbox"
                  checked={settings.wordWrap}
                  onChange={(e) => setSettings(prev => ({ ...prev, wordWrap: e.target.checked }))}
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <span>Line Numbers</span>
                <input
                  type="checkbox"
                  checked={settings.lineNumbers}
                  onChange={(e) => setSettings(prev => ({ ...prev, lineNumbers: e.target.checked }))}
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <span>Auto Complete</span>
                <input
                  type="checkbox"
                  checked={settings.autoComplete}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoComplete: e.target.checked }))}
                  className="rounded"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TemplatesPanel = () => {
    if (!showTemplates) return null;

    const activeFileType = active?.type;
    const availableTemplates = codeTemplates[activeFileType as keyof typeof codeTemplates] || {};

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`w-96 max-h-[80vh] overflow-y-auto rounded-lg shadow-xl ${
          isDarkMode ? 'bg-[#252526] text-white' : 'bg-white text-gray-900'
        }`}>
          <div className={`flex items-center justify-between p-4 border-b ${
            isDarkMode ? 'border-[#464647]' : 'border-gray-200'
          }`}>
            <h3 className="text-lg font-semibold">Code Templates</h3>
            <button onClick={() => setShowTemplates(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4">
            {Object.keys(availableTemplates).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(availableTemplates).map(([name, template]) => (
                  <button
                    key={name}
                    onClick={() => {
                      if (active) {
                        setFiles(files => files.map(f => 
                          f.name === active.name 
                            ? { ...f, content: f.content + (f.content ? '\n\n' : '') + template }
                            : f
                        ));
                      }
                      setShowTemplates(false);
                    }}
                    className={`w-full p-3 text-left rounded border transition-colors ${
                      isDarkMode 
                        ? 'bg-[#3c3c3c] border-[#464647] hover:bg-[#464647] text-white' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="font-medium">{name}</div>
                    <div className={`text-xs mt-1 font-mono ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {template.split('\n')[0]}...
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No templates available for {activeFileType} files
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const active = getFile(activeFile);

  const resetCode = () => {
    setFiles(defaultFiles);
    setActiveFile('index.html');
    setOpenTabs(['index.html']);
    setOutput('');
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className="relative">
      <div
        className={`flex flex-col h-screen transition-colors duration-200 ${
          isDarkMode ? "bg-[#1e1e1e] text-[#cccccc]" : "bg-white text-[#383838]"
        } ${isFullScreen ? "fixed inset-0 z-50" : "rounded-lg border overflow-hidden"} ${
          isDarkMode ? "border-[#464647]" : "border-gray-200"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-2 border-b ${
            isDarkMode ? "bg-[#2d2d30] border-[#464647]" : "bg-[#f8f8f8] border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">YZ</span>
            <span className="text-sm font-medium ml-4">Student Code Editor</span>
          </div>
          <div className="flex items-center space-x-2">
            {/* Code Templates */}
            <button
              onClick={() => setShowTemplates(true)}
              className={`p-1.5 rounded transition-colors ${
                isDarkMode ? "hover:bg-[#37373d] text-[#cccccc]" : "hover:bg-gray-200 text-gray-600"
              }`}
              title="Code Templates"
            >
              <Code2 className="h-4 w-4" />
            </button>

            {/* Copy Code */}
            <button
              onClick={() => {
                if (active) {
                  navigator.clipboard.writeText(active.content);
                  setOutput('Code copied to clipboard!\n');
                }
              }}
              className={`p-1.5 rounded transition-colors ${
                isDarkMode ? "hover:bg-[#37373d] text-[#cccccc]" : "hover:bg-gray-200 text-gray-600"
              }`}
              title="Copy Code"
            >
              <Copy className="h-4 w-4" />
            </button>

            {/* Export Dropdown */}
            <div className="relative group">
              <button
                onClick={exportProject}
                className={`p-1.5 rounded transition-colors ${
                  isDarkMode ? "hover:bg-[#37373d] text-[#cccccc]" : "hover:bg-gray-200 text-gray-600"
                }`}
                title="Export Project"
              >
                <Download className="h-4 w-4" />
              </button>
              
              <div className={`absolute top-full right-0 mt-1 py-1 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-48 ${
                isDarkMode ? 'bg-[#252526] border border-[#464647]' : 'bg-white border border-gray-200'
              }`}>
                <button
                  onClick={exportProject}
                  className={`w-full px-4 py-1.5 text-left text-sm whitespace-nowrap ${
                    isDarkMode ? 'hover:bg-[#37373d] text-[#cccccc]' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  📦 Export as ZIP
                </button>
                <button
                  onClick={forceDownloadZip}
                  className={`w-full px-4 py-1.5 text-left text-sm whitespace-nowrap ${
                    isDarkMode ? 'hover:bg-[#37373d] text-[#cccccc]' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  🔧 Force Download (if blocked)
                </button>
                <button
                  onClick={downloadIndividualFiles}
                  className={`w-full px-4 py-1.5 text-left text-sm whitespace-nowrap ${
                    isDarkMode ? 'hover:bg-[#37373d] text-[#cccccc]' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  📄 Download Individual Files
                </button>
                <div className={`px-4 py-1.5 text-xs border-t mt-1 ${
                  isDarkMode ? 'border-[#464647] text-[#969696]' : 'border-gray-200 text-gray-500'
                }`}>
                  💡 Check Downloads folder or browser's download bar
                </div>
              </div>
            </div>

            {/* Import Files */}
            <label
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                isDarkMode ? "hover:bg-[#37373d] text-[#cccccc]" : "hover:bg-gray-200 text-gray-600"
              }`}
              title="Import Project (ZIP, JSON, or individual files)"
            >
              <Upload className="h-4 w-4" />
              <input
                type="file"
                accept=".zip,.json,.py,.js,.html,.css,.txt"
                onChange={importFiles}
                className="hidden"
              />
            </label>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(true)}
              className={`p-1.5 rounded transition-colors ${
                isDarkMode ? "hover:bg-[#37373d] text-[#cccccc]" : "hover:bg-gray-200 text-gray-600"
              }`}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-1.5 rounded transition-colors ${
                isDarkMode ? "hover:bg-[#37373d] text-[#cccccc]" : "hover:bg-gray-200 text-gray-600"
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Reset Code */}
            <button
              onClick={resetCode}
              className={`p-1.5 rounded transition-colors ${
                isDarkMode ? "hover:bg-[#37373d] text-[#cccccc]" : "hover:bg-gray-200 text-gray-600"
              }`}
              title="Reset Code"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullScreen}
              className={`p-1.5 rounded transition-colors ${
                isDarkMode ? "hover:bg-[#37373d] text-[#cccccc]" : "hover:bg-gray-200 text-gray-600"
              }`}
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - File Explorer */}
          <div
            className={`border-r transition-colors ${
              isDarkMode ? "bg-[#252526] border-[#464647]" : "bg-[#f8f8f8] border-gray-200"
            }`}
            style={{ width: `${leftWidth}%` }}
          >
            <div
              className={`flex items-center justify-between px-3 py-2 border-b text-xs font-semibold uppercase tracking-wide ${
                isDarkMode ? "border-[#464647] text-[#cccccc]" : "border-gray-200 text-gray-600"
              }`}
            >
              <span>Explorer</span>
              <button
                onClick={addFile}
                className={`p-1 rounded transition-colors ${isDarkMode ? "hover:bg-[#37373d]" : "hover:bg-gray-200"}`}
                title="New File"
              >
                <FilePlus2 className="w-4 h-4" />
              </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={files.map(f => f.name)} strategy={verticalListSortingStrategy}>
                <div className="overflow-y-auto">
                  {files.map(f => (
                    <SortableFile
                      key={f.name}
                      file={f}
                      activeFile={activeFile}
                      isDarkMode={isDarkMode}
                      onClick={(name) => {
                        setActiveFile(name);
                        setOpenTabs(tabs => {
                          if (!tabs.includes(name)) {
                            return [...tabs, name];
                          }
                          return tabs;
                        });
                      }}
                      onDelete={deleteFile}
                      onRename={renameFile}
                      renamingFile={renamingFile}
                      setRenamingFile={setRenamingFile}
                      renameValue={renameValue}
                      setRenameValue={setRenameValue}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Resize Handle */}
          <div
            className={`w-1 cursor-col-resize transition-colors ${
              isDragging ? "bg-blue-500" : isDarkMode ? "bg-[#464647] hover:bg-blue-500" : "bg-gray-200 hover:bg-blue-500"
            }`}
            onMouseDown={handleMouseDown}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden" ref={containerRef}>
            {/* Tabs */}
            <div
              className={`flex items-center border-b overflow-x-auto ${
                isDarkMode ? "bg-[#2d2d30] border-[#464647]" : "bg-[#f8f8f8] border-gray-200"
              }`}
            >
              {openTabs.map(tab => (
                <div
                  key={tab}
                  className={`flex items-center px-3 py-2 border-r cursor-pointer group min-w-0 ${
                    activeFile === tab
                      ? isDarkMode
                        ? "bg-[#1e1e1e] text-white border-r-[#464647]"
                        : "bg-white text-gray-900 border-r-gray-200"
                      : isDarkMode
                        ? "bg-[#2d2d30] text-[#969696] hover:text-[#cccccc] border-r-[#464647]"
                        : "bg-[#f8f8f8] text-gray-600 hover:text-gray-900 border-r-gray-200"
                  }`}
                  onClick={() => setActiveFile(tab)}
                >
                  {getFileIcon(tab)}
                  <span className="text-sm font-mono truncate ml-2">{tab}</span>
                  <button
                    className={`ml-2 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                      isDarkMode ? "hover:bg-[#464647]" : "hover:bg-gray-300"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Editor and Preview/Output */}
            <div className="flex flex-1 overflow-hidden">
              {/* Code Editor */}
              <div className="flex-1 overflow-hidden">
                {active && (
                  <CodeMirror
                    value={active.content}
                    height="100%"
                    theme={getTheme(settings.theme, isDarkMode)}
                    extensions={[
                      ...getLanguageExtension(active.type),
                      indentUnit.of(' '.repeat(settings.tabSize)),
                      settings.wordWrap ? EditorView.lineWrapping : [],
                    ]}
                    onChange={(v) =>
                      setFiles(files => files.map(f => f.name === active.name ? { ...f, content: v } : f))
                    }
                    className="h-full"
                    style={{ fontSize: settings.fontSize }}
                    basicSetup={{
                      lineNumbers: settings.lineNumbers,
                      foldGutter: true,
                      dropCursor: true,
                      allowMultipleSelections: true,
                      indentOnInput: true,
                      bracketMatching: true,
                      closeBrackets: true,
                      autocompletion: settings.autoComplete,
                      highlightSelectionMatches: true,
                      searchKeymap: true,
                    }}
                  />
                )}
              </div>

              {/* Preview/Output Panel */}
              <div
                className={`w-80 border-l flex flex-col ${
                  isDarkMode ? "bg-[#1e1e1e] border-[#464647]" : "bg-white border-gray-200"
                }`}
              >
                {/* View Toggle */}
                <div className={`flex border-b ${isDarkMode ? 'border-[#464647]' : 'border-gray-200'}`}>
                  <button
                    onClick={() => setActiveView('web')}
                    className={`flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                      activeView === 'web'
                        ? isDarkMode ? 'bg-[#37373d] text-white' : 'bg-gray-100 text-gray-900'
                        : isDarkMode ? 'text-[#cccccc] hover:bg-[#2a2d2e]' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🌐 Web Preview
                  </button>
                  <button
                    onClick={() => setActiveView('python')}
                    className={`flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                      activeView === 'python'
                        ? isDarkMode ? 'bg-[#37373d] text-white' : 'bg-gray-100 text-gray-900'
                        : isDarkMode ? 'text-[#cccccc] hover:bg-[#2a2d2e]' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🐍 Python Output
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                  {activeView === 'web' ? (
                    <iframe
                      ref={iframeRef}
                      title="Web Preview"
                      className="w-full h-full border-0"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  ) : (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 overflow-y-auto p-3">
                        {output ? (
                          <pre
                            className={`text-sm font-mono whitespace-pre-wrap ${
                              isDarkMode ? "text-[#cccccc]" : "text-gray-900"
                            }`}
                            style={{ fontSize: settings.fontSize - 2 }}
                          >
                            {output}
                          </pre>
                        ) : (
                          <div className={`text-sm ${isDarkMode ? "text-[#969696]" : "text-gray-500"}`}>
                            Run Python code to see output here...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className={`flex items-center justify-between px-3 py-1 border-t text-xs ${
                isDarkMode ? "bg-[#007acc] border-[#464647] text-white" : "bg-blue-600 border-gray-200 text-white"
              }`}
            >
              <div className="flex items-center space-x-4">
                <span>
                  {
                    active?.type === 'py' ? 'Python' : 
                    active?.type === 'js' ? 'JavaScript' : 
                    active?.type === 'html' ? 'HTML' : 
                    active?.type === 'css' ? 'CSS' : 'Text'
                  }
                </span>
                <span>{active?.content.split("\n").length || 0} lines</span>
                <span>{activeFile}</span>
                {isPyodideLoading && <span>🔄 Loading Python...</span>}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={renderWebPreview}
                  className="px-3 py-1 rounded text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white"
                >
                  🌐 Preview Web
                </button>
                {/* <button
                  onClick={runPythonCode}
                  disabled={isPyodideLoading || !files.some(f => f.type === 'py')}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    isPyodideLoading || !files.some(f => f.type === 'py')
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white`}
                >
                  {isPyodideLoading ? 'Loading...' : ' Run Python'}
                </button> */}
                <button
               onClick={runPythonCode}
               disabled={isPyodideLoading || !activeFile.endsWith('.py')}
               className={`
                 flex items-center px-3 py-1 rounded text-xs font-medium
                 transition-all duration-200
                 ${isPyodideLoading || !activeFile.endsWith('.py') 
                   ? "bg-gray-500 cursor-not-allowed" 
                   : "bg-green-600 hover:bg-green-700 active:bg-green-800"}
                 text-white
               `}
             >
               {isPyodideLoading ? (
                 <>
                   <div className="animate-spin w-3 h-3 mr-2 border border-white border-t-transparent rounded-full"></div>
                   Loading...
                 </>
               ) : (
                 <>
                   <Play className="w-3 h-3 mr-2" />
                   {activeFile.endsWith('.py') ? 'Run Python' : 'Select Python file'}
                 </>
               )}
             </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SettingsPanel />
      <TemplatesPanel />
    </div>
  );
};

export default UnifiedEditor;