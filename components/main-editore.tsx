// components/main-editore.tsx
import React, { useState, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { githubLight } from '@uiw/codemirror-theme-github';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

type FileType = 'html' | 'css' | 'js';

interface FileData {
  name: string;
  type: FileType;
  content: string;
}

const defaultFiles: FileData[] = [
  { name: 'index.html', type: 'html', content: '<h1>Hello World!</h1>' },
  { name: 'style.css', type: 'css', content: 'body { background: #f0f0f0; }' },
  { name: 'main.js', type: 'js', content: 'console.log("Hello from JS!");' },
]; 

const getLanguageExtension = (type: FileType) => {
  switch (type) {
    case 'html': return [html()];
    case 'css': return [css()];
    case 'js': return [javascript()];
    default: return [];
  }
};

interface SortableTabProps {
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
  listeners: any;
}

function SortableTab({
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
  listeners,
}: SortableTabProps) {
  const { attributes, setNodeRef, transform, transition, isDragging } = useSortable({ id: file.name });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center">
      {renamingFile === file.name ? (
        <input
          value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onBlur={() => {
            if (renameValue && renameValue !== file.name) onRename(file.name, renameValue);
            setRenamingFile(null);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (renameValue && renameValue !== file.name) onRename(file.name, renameValue);
              setRenamingFile(null);
            }
          }}
          autoFocus
          className="px-2 py-1 text-xs font-mono"
        />
      ) : (
        <button
          className={`px-3 py-1.5 rounded-md text-sm font-medium font-mono ${activeFile === file.name
            ? isDarkMode ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-900'
            : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-slate-600/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          onClick={() => onClick(file.name)}
          onDoubleClick={() => {
            setRenamingFile(file.name);
            setRenameValue(file.name);
          }}
        >
          {file.name}
        </button>
      )}
      <button onClick={() => onDelete(file.name)} className="text-red-400 px-1" title="Delete file">×</button>
    </div>
  );
}

const MainEditore = () => {
  const [files, setFiles] = useState<FileData[]>(defaultFiles);
  const [activeFile, setActiveFile] = useState('index.html');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // DnD-kit setup
  const sensors = useSensors(useSensor(PointerSensor));

  // File helpers
  const getFile = (name: string) => files.find(f => f.name === name);
  const updateFile = (name: string, content: string) => {
    setFiles(files => files.map(f => f.name === name ? { ...f, content } : f));
  };
  const addFile = (type: FileType) => {
    let base = type === 'html' ? 'file.html' : type === 'css' ? 'style.css' : 'script.js';
    let idx = 1;
    let newName = base;
    while (files.some(f => f.name === newName)) {
      newName = base.replace('.', idx + '.');
      idx++;
    }
    setFiles([...files, { name: newName, type, content: '' }]);
    setActiveFile(newName);
  };
  const deleteFile = (name: string) => {
    if (files.length === 1) return;
    setFiles(files => files.filter(f => f.name !== name));
    if (activeFile === name) setActiveFile(files[0].name);
  };
  const renameFile = (oldName: string, newName: string) => {
    if (!newName || files.some(f => f.name === newName)) return;
    setFiles(files => files.map(f => f.name === oldName ? { ...f, name: newName } : f));
    if (activeFile === oldName) setActiveFile(newName);
  };

  // Drag-and-drop handler
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = files.findIndex(f => f.name === active.id);
      const newIndex = files.findIndex(f => f.name === over.id);
      setFiles(arrayMove(files, oldIndex, newIndex));
    }
  };

  // Fixed renderPreview function with proper import resolution
  const renderPreview = () => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;
    iframe.src = 'about:blank';
    
    iframe.onload = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      // Get all files by type
      const htmlFile = files.find(f => f.type === 'html');
      const cssFiles = files.filter(f => f.type === 'css');
      const jsFiles = files.filter(f => f.type === 'js');

      console.log('JS Files for preview:', jsFiles.map(f => ({ name: f.name, content: f.content.substring(0, 50) + '...' })));

      // Step 1: Create blob URLs for all original JS files
      const originalModuleUrls = new Map();
      jsFiles.forEach(file => {
        const blob = new Blob([file.content], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        originalModuleUrls.set(file.name, url);
        console.log(`Created blob URL for ${file.name}:`, url);
      });

      // Step 2: Transform imports in each JS file
      const transformedFiles = jsFiles.map(file => {
        let transformedCode = file.content;
        
        console.log(`\n=== Transforming ${file.name} ===`);
        console.log('Original content:', file.content);

        // Replace imports for all other JS files
        jsFiles.forEach(otherFile => {
          if (otherFile.name !== file.name) {
            const fileNameWithoutExt = otherFile.name.replace('.js', '');
            const fileNameWithExt = otherFile.name;
            const blobUrl = originalModuleUrls.get(otherFile.name);

            console.log(`Looking for imports of ${otherFile.name} in ${file.name}`);

            // Comprehensive import patterns
            const patterns = [
              // import ... from './filename'
              {
                regex: new RegExp(`import\\s+([^;]+?)\\s+from\\s+['"]\\.\/${fileNameWithoutExt}['"]`, 'g'),
                replacement: `import $1 from '${blobUrl}'`
              },
              // import ... from './filename.js'
              {
                regex: new RegExp(`import\\s+([^;]+?)\\s+from\\s+['"]\\.\/${fileNameWithExt}['"]`, 'g'),
                replacement: `import $1 from '${blobUrl}'`
              },
              // import ... from 'filename' (without ./)
              {
                regex: new RegExp(`import\\s+([^;]+?)\\s+from\\s+['"]${fileNameWithoutExt}['"]`, 'g'),
                replacement: `import $1 from '${blobUrl}'`
              },
              // import ... from 'filename.js' (without ./)
              {
                regex: new RegExp(`import\\s+([^;]+?)\\s+from\\s+['"]${fileNameWithExt}['"]`, 'g'),
                replacement: `import $1 from '${blobUrl}'`
              },
              // Dynamic imports
              {
                regex: new RegExp(`import\\s*\\(\\s*['"]\\.\/${fileNameWithoutExt}['"]\\s*\\)`, 'g'),
                replacement: `import('${blobUrl}')`
              },
              {
                regex: new RegExp(`import\\s*\\(\\s*['"]\\.\/${fileNameWithExt}['"]\\s*\\)`, 'g'),
                replacement: `import('${blobUrl}')`
              }
            ];

            patterns.forEach((pattern, index) => {
              const matches = transformedCode.match(pattern.regex);
              if (matches) {
                console.log(`Found matches for pattern ${index}:`, matches);
                console.log(`Replacing with: ${pattern.replacement}`);
              }
              transformedCode = transformedCode.replace(pattern.regex, pattern.replacement);
            });
          }
        });

        console.log('Transformed content:', transformedCode);
        console.log(`=== End ${file.name} ===\n`);

        // Create blob URL for transformed content
        const transformedBlob = new Blob([transformedCode], { 
          type: 'application/javascript' 
        });
        const transformedUrl = URL.createObjectURL(transformedBlob);

        return {
          name: file.name,
          originalContent: file.content,
          transformedContent: transformedCode,
          originalUrl: originalModuleUrls.get(file.name),
          transformedUrl: transformedUrl
        };
      });

      // Step 3: Build the final HTML
      let html = htmlFile?.content || '<h1>No index.html found</h1>';
      
      // Combine all CSS
      const allCss = cssFiles.map(f => f.content).join('\n');
      
      // Inject CSS into head
      if (allCss) {
        if (html.includes('</head>')) {
          html = html.replace('</head>', `<style>${allCss}</style></head>`);
        } else if (html.includes('<head>')) {
          html = html.replace('<head>', `<head><style>${allCss}</style>`);
        } else {
          html = `<head><style>${allCss}</style></head>${html}`;
        }
      }

      // Add all transformed JS files as modules
      const scripts = transformedFiles.map(file => 
        `<script type="module" src="${file.transformedUrl}" data-filename="${file.name}"></script>`
      ).join('\n');

      if (scripts) {
        if (html.includes('</body>')) {
          html = html.replace('</body>', `${scripts}</body>`);
        } else {
          html += scripts;
        }
      }

      // Add error handling and debugging
      const debugScript = `
        <script>
          window.addEventListener('error', function(e) {
            console.error('Script error:', e.error);
            console.error('Error details:', {
              message: e.message,
              filename: e.filename,
              lineno: e.lineno,
              colno: e.colno,
              stack: e.error?.stack
            });
          });
          
          window.addEventListener('unhandledrejection', function(e) {
            console.error('Unhandled promise rejection:', e.reason);
          });
          
          console.log('Loaded modules:', ${JSON.stringify(transformedFiles.map(f => f.name))});
        </script>
      `;

      html += debugScript;

      console.log('Final HTML:', html);

      doc.open();
      doc.write(html);
      doc.close();

      // Clean up blob URLs after delay
      setTimeout(() => {
        originalModuleUrls.forEach(url => URL.revokeObjectURL(url));
        transformedFiles.forEach(file => {
          URL.revokeObjectURL(file.transformedUrl);
        });
        console.log('Cleaned up blob URLs');
      }, 10000);
    };
  };

  // UI
  const active = getFile(activeFile);

  return (
    <div className={`rounded-lg overflow-hidden border transition-colors duration-300 ${isDarkMode ? 'border-gray-700 shadow-lg bg-slate-900' : 'border-gray-200 shadow-lg bg-white'}`}>
      {/* Tabs */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={files.map(f => f.name)} strategy={horizontalListSortingStrategy}>
          <div className={`border-b p-3 flex items-center justify-between transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center space-x-2">
              {files.map(f => (
                <SortableTab
                  key={f.name}
                  file={f}
                  activeFile={activeFile}
                  isDarkMode={isDarkMode}
                  onClick={setActiveFile}
                  onDelete={deleteFile}
                  onRename={renameFile}
                  renamingFile={renamingFile}
                  setRenamingFile={setRenamingFile}
                  renameValue={renameValue}
                  setRenameValue={setRenameValue}
                  listeners={undefined}
                />
              ))}
              <div className="ml-2 flex space-x-1">
                <button onClick={() => addFile('html')} className="text-xs px-2 py-1 bg-blue-100 rounded">+HTML</button>
                <button onClick={() => addFile('css')} className="text-xs px-2 py-1 bg-green-100 rounded">+CSS</button>
                <button onClick={() => addFile('js')} className="text-xs px-2 py-1 bg-yellow-100 rounded">+JS</button>
              </div>
            </div>
            <button
              onClick={() => setIsDarkMode(d => !d)}
              className="ml-auto px-2 py-1 text-xs"
            >{isDarkMode ? '🌙' : '☀️'}</button>
          </div>
        </SortableContext>
      </DndContext>
      {/* Main Editor + Preview Area */}
      <div className="flex flex-col md:flex-row h-[60vh]">
        <div className="flex-1 border-r border-gray-200">
          {active && (
            <CodeMirror
              value={active.content}
              height="100%"
              theme={isDarkMode ? dracula : githubLight}
              extensions={getLanguageExtension(active.type)}
              onChange={v => updateFile(active.name, v)}
              className="text-base"
            />
          )}
        </div>
        <div className="flex-1 flex flex-col">
          <iframe
            ref={iframeRef}
            title="preview"
            className="flex-grow w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
      {/* Footer */}
      <div className={`border-t p-2 flex justify-between items-center ${isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <span className="text-xs text-gray-500">{activeFile}</span>
        <button
          onClick={renderPreview}
          className="px-4 py-2 rounded font-medium text-xs bg-emerald-600 text-white"
        >
          Preview
        </button>
      </div>
    </div>
  );
};

export default MainEditore;