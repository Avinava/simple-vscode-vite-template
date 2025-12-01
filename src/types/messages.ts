/**
 * Message types sent from the webview to the extension
 */
export interface MessageFromWebview {
  command: 'alert' | 'getData';
  text?: string;
}

/**
 * Message types sent from the extension to the webview
 */
export interface MessageToWebview {
  command: 'dataResponse';
  data?: any;
}
