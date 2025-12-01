import { useEffect, useRef } from 'react';

/**
 * VS Code WebView API type
 */
interface VSCodeApi {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
}

declare global {
  interface Window {
    acquireVsCodeApi(): VSCodeApi;
  }
}

/**
 * Custom hook to access VS Code API
 * Ensures the API is only acquired once
 */
export function useVSCodeApi(): VSCodeApi {
  const apiRef = useRef<VSCodeApi | null>(null);

  if (apiRef.current === null) {
    apiRef.current = window.acquireVsCodeApi();

    // Set up message listener
    window.addEventListener('message', event => {
      const message = event.data;
      console.log('Received message from extension:', message);
      
      // Handle messages from extension
      switch (message.command) {
        case 'dataResponse':
          console.log('Data from extension:', message.data);
          break;
      }
    });
  }

  return apiRef.current;
}
