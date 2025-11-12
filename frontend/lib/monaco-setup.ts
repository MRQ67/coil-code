/**
 * Monaco Editor Worker Configuration
 * This file configures Monaco Editor to load workers correctly in Next.js
 * 
 * When using monaco-editor-webpack-plugin, workers are generated with specific names.
 * This configuration tells Monaco where to find them.
 */

if (typeof window !== 'undefined') {
  // Configure Monaco Editor workers
  // The webpack plugin generates workers with these names
  (window as any).MonacoEnvironment = {
    getWorkerUrl: function (moduleId: string, label: string) {
      // Based on the error, workers are being requested at /_next/css.worker.js
      // The webpack plugin outputs workers, but we need to match the expected path
      let workerName = '';
      if (label === 'json') {
        workerName = 'json.worker.js';
      } else if (label === 'css' || label === 'scss' || label === 'less') {
        workerName = 'css.worker.js';
      } else if (label === 'html' || label === 'handlebars' || label === 'razor') {
        workerName = 'html.worker.js';
      } else if (label === 'typescript' || label === 'javascript') {
        workerName = 'ts.worker.js';
      } else {
        workerName = 'editor.worker.js';
      }
      
      // The error shows workers are requested at /_next/css.worker.js
      // Try the path that matches the error first
      return `/_next/${workerName}`;
    },
  };
}

