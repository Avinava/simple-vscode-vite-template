import * as vscode from 'vscode';
import { ExamplePanel } from './panels/ExamplePanel';

/**
 * Extension activation function
 * Called when the extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "simple-vscode-vite-template" is now active!');

  // Register the command to open the example panel
  const openPanelCommand = vscode.commands.registerCommand(
    'vscode-template.openPanel',
    () => {
      ExamplePanel.createOrShow(context.extensionUri);
    }
  );

  context.subscriptions.push(openPanelCommand);
}

/**
 * Extension deactivation function
 * Called when the extension is deactivated
 */
export function deactivate() {
  console.log('Extension "simple-vscode-vite-template" is now deactivated');
}
