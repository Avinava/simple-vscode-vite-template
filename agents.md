# AI Coding Assistant Rules & Concepts

> **Purpose**: This document provides guidelines, rules, and architectural concepts to help AI coding assistants effectively understand, navigate, and contribute to this VS Code extension template.

---

## Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [Core Principles](#core-principles)
3. [Development Rules](#development-rules)
4. [Code Organization Patterns](#code-organization-patterns)
5. [Communication Patterns](#communication-patterns)
6. [Testing Guidelines](#testing-guidelines)
7. [Performance & Optimization](#performance--optimization)
8. [Security Considerations](#security-considerations)
9. [Debugging Strategies](#debugging-strategies)
10. [Scalability Concepts](#scalability-concepts)

---

## Architectural Overview

### System Layers

```
┌─────────────────────────────────────────────────┐
│           VS Code Extension Host                │
│  (Node.js environment, full VS Code API)        │
│                                                 │
│  Components:                                    │
│  • Commands (src/commands/)                     │
│  • Providers (src/providers/)                   │
│  • Services (src/services/)                     │
│  • Panels (src/panels/)                         │
└────────────────┬────────────────────────────────┘
                 │
                 │ Message Passing (postMessage)
                 │
┌────────────────▼────────────────────────────────┐
│           Webview Context                       │
│  (Browser-like environment, limited API)        │
│                                                 │
│  Components:                                    │
│  • React/Vue Components (webview-ui/src/)       │
│  • Frontend Services (webview-ui/src/services/) │
│  • UI State Management                          │
└─────────────────────────────────────────────────┘
```

### Key Separation Principles

1. **Extension Backend (`src/`)**: 
   - Runs in Node.js environment
   - Has full access to VS Code API
   - Manages file system operations
   - Handles workspace interactions

2. **Webview Frontend (`webview-ui/`)**: 
   - Runs in isolated webview context (similar to browser)
   - Limited to `acquireVsCodeApi()` for communication
   - Handles UI rendering and user interactions
   - Cannot directly access file system or VS Code APIs

---

## Core Principles

### 1. Single Responsibility
Each file/class should have one clear purpose:
- ✅ **Good**: `dataService.ts` handles all data operations
- ❌ **Bad**: `utils.ts` contains data operations, UI helpers, and validation

### 2. Explicit Over Implicit
Always be explicit about types, dependencies, and behavior:
```typescript
// ✅ Good
export function getUserData(userId: string): Promise<UserData> {
  return apiClient.get<UserData>(`/users/${userId}`);
}

// ❌ Bad
export function getData(id) {
  return apiClient.get(`/users/${id}`);
}
```

### 3. Fail Fast & Safe
Validate early and provide meaningful errors:
```typescript
// ✅ Good
export function processFile(uri: vscode.Uri): void {
  if (!uri) {
    throw new Error('File URI is required');
  }
  if (!fs.existsSync(uri.fsPath)) {
    vscode.window.showErrorMessage(`File not found: ${uri.fsPath}`);
    return;
  }
  // Process file
}
```

### 4. VS Code UX Compliance
Always respect VS Code's UX guidelines:
- Use theme colors (CSS variables)
- Follow icon and naming conventions
- Provide keyboard shortcuts
- Support accessibility

---

## Development Rules

### Rule 1: Never Directly Manipulate the DOM in Extension Code

**WHY**: Extension backend has no access to DOM; only webviews have DOM.

```typescript
// ❌ WRONG (in extension code)
document.getElementById('panel').innerHTML = data;

// ✅ CORRECT (send message to webview)
panel.webview.postMessage({ command: 'updateData', data });
```

### Rule 2: Always Type Message Contracts

**WHY**: Prevents runtime errors from mismatched messages between extension and webview.

```typescript
// src/types/messages.ts
export interface MessageFromWebview {
  command: 'save' | 'load' | 'delete';
  payload?: {
    id: string;
    data: any;
  };
}

export interface MessageToWebview {
  command: 'dataLoaded' | 'error';
  payload?: any;
}

// Usage in extension
panel.webview.onDidReceiveMessage((message: MessageFromWebview) => {
  switch (message.command) {
    case 'save':
      // Handle save
      break;
  }
});
```

### Rule 3: Dispose Resources Properly

**WHY**: Prevents memory leaks in long-running VS Code sessions.

```typescript
// ✅ Good
export class MyProvider implements vscode.Disposable {
  private disposables: vscode.Disposable[] = [];
  
  constructor() {
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(this.onConfigChange)
    );
  }
  
  dispose() {
    this.disposables.forEach(d => d.dispose());
  }
}
```

### Rule 4: Use VS Code's Built-in APIs Over External Libraries

**WHY**: Reduces bundle size and ensures compatibility.

```typescript
// ✅ Prefer VS Code URI
const uri = vscode.Uri.file('/path/to/file');

// ❌ Avoid adding path manipulation libraries
// import path from 'path'; // Only if absolutely necessary
```

### Rule 5: Lazy Load Heavy Dependencies

**WHY**: Faster extension activation.

```typescript
// ✅ Good
export async function processData() {
  const { heavyLibrary } = await import('./heavyLibrary');
  return heavyLibrary.process();
}

// ❌ Bad (imports at top level)
import { heavyLibrary } from './heavyLibrary';
```

### Rule 6: Respect Workspace Trust

**WHY**: Security requirement for executing code in untrusted workspaces.

```typescript
import * as vscode from 'vscode';

export function executeDangerousOperation() {
  if (!vscode.workspace.isTrusted) {
    vscode.window.showWarningMessage('This operation requires workspace trust');
    return;
  }
  // Proceed with operation
}
```

### Rule 7: Use Activation Events Sparingly

**WHY**: Extensions should activate only when needed.

```json
// ✅ Good - specific activation
{
  "activationEvents": [
    "onCommand:myext.specificCommand",
    "onView:myext.view"
  ]
}

// ❌ Bad - activates too early
{
  "activationEvents": ["*"]
}
```

---

## Code Organization Patterns

### Pattern 1: Command Registration

Centralize command registration in `src/commands/index.ts`:

```typescript
// src/commands/index.ts
import * as vscode from 'vscode';
import { openPanelCommand } from './openPanelCommand';
import { saveDataCommand } from './saveDataCommand';

export function registerCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('myext.openPanel', openPanelCommand),
    vscode.commands.registerCommand('myext.saveData', saveDataCommand)
  );
}

// src/extension.ts
import { registerCommands } from './commands';

export function activate(context: vscode.ExtensionContext) {
  registerCommands(context);
}
```

### Pattern 2: Singleton Panel Management

Ensure only one instance of a panel exists:

```typescript
// src/panels/ExamplePanel.ts
export class ExamplePanel {
  private static currentPanel: ExamplePanel | undefined;
  private panel: vscode.WebviewPanel;
  
  public static createOrShow(extensionUri: vscode.Uri) {
    if (ExamplePanel.currentPanel) {
      ExamplePanel.currentPanel.panel.reveal();
      return;
    }
    
    ExamplePanel.currentPanel = new ExamplePanel(extensionUri);
  }
  
  private constructor(extensionUri: vscode.Uri) {
    this.panel = vscode.window.createWebviewPanel(
      'examplePanel',
      'Example Panel',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );
    
    this.panel.onDidDispose(() => {
      ExamplePanel.currentPanel = undefined;
    });
  }
}
```

### Pattern 3: Service Layer

Encapsulate business logic in services:

```typescript
// src/services/dataService.ts
import * as vscode from 'vscode';

export class DataService {
  constructor(private context: vscode.ExtensionContext) {}
  
  async getData(key: string): Promise<any> {
    return this.context.globalState.get(key);
  }
  
  async saveData(key: string, value: any): Promise<void> {
    await this.context.globalState.update(key, value);
  }
}

// Usage
const dataService = new DataService(context);
await dataService.saveData('myKey', { foo: 'bar' });
```

### Pattern 4: Webview HTML Generation

Use a dedicated method to generate HTML with proper CSP:

```typescript
private getHtmlForWebview(webview: vscode.Webview): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(this.extensionUri, 'out', 'webview', 'main.js')
  );
  
  const nonce = getNonce();
  
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" 
          content="default-src 'none'; 
                   script-src 'nonce-${nonce}'; 
                   style-src ${webview.cspSource} 'unsafe-inline';">
    <title>My Extension</title>
  </head>
  <body>
    <div id="root"></div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
  </body>
  </html>`;
}

function getNonce(): string {
  return Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}
```

---

## Communication Patterns

### Extension → Webview

```typescript
// Extension side
panel.webview.postMessage({ 
  command: 'updateData', 
  data: { id: 1, name: 'Example' } 
});

// Webview side
window.addEventListener('message', event => {
  const message = event.data;
  switch (message.command) {
    case 'updateData':
      setData(message.data);
      break;
  }
});
```

### Webview → Extension

```typescript
// Webview side
const vscode = acquireVsCodeApi();
vscode.postMessage({ 
  command: 'save', 
  payload: { id: 1, name: 'Updated' } 
});

// Extension side
panel.webview.onDidReceiveMessage(message => {
  switch (message.command) {
    case 'save':
      saveData(message.payload);
      break;
  }
});
```

### Request-Response Pattern

For async operations requiring responses:

```typescript
// Webview side
let messageId = 0;
const pendingRequests = new Map();

function sendRequest(command: string, payload?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = messageId++;
    pendingRequests.set(id, { resolve, reject });
    vscode.postMessage({ id, command, payload });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error('Request timeout'));
      }
    }, 5000);
  });
}

window.addEventListener('message', event => {
  const { id, result, error } = event.data;
  const pending = pendingRequests.get(id);
  if (pending) {
    pendingRequests.delete(id);
    error ? pending.reject(error) : pending.resolve(result);
  }
});

// Usage
const data = await sendRequest('getData', { userId: 123 });
```

---

## Testing Guidelines

### Extension Tests

```typescript
// test/suite/extension.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  test('Extension activates', async () => {
    const ext = vscode.extensions.getExtension('publisher.extension-name');
    assert.ok(ext);
    await ext.activate();
    assert.strictEqual(ext.isActive, true);
  });
  
  test('Command exists', async () => {
    const commands = await vscode.commands.getCommands();
    assert.ok(commands.includes('myext.openPanel'));
  });
});
```

### Webview Component Tests

```typescript
// webview-ui/src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick handler', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

### Mock VS Code API

```typescript
// test/mocks/vscode.ts
export const window = {
  showInformationMessage: vi.fn(),
  showErrorMessage: vi.fn(),
  createWebviewPanel: vi.fn(),
};

export const commands = {
  registerCommand: vi.fn(),
  executeCommand: vi.fn(),
};

export const Uri = {
  file: (path: string) => ({ fsPath: path, scheme: 'file' }),
  joinPath: vi.fn(),
};
```

---

## Performance & Optimization

### 1. Debounce Frequent Operations

```typescript
import * as vscode from 'vscode';

function debounce<T extends (...args: any[]) => any>(
  fn: T, 
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Usage
const debouncedUpdate = debounce((text: string) => {
  panel.webview.postMessage({ command: 'update', text });
}, 300);

vscode.workspace.onDidChangeTextDocument(e => {
  debouncedUpdate(e.document.getText());
});
```

### 2. Minimize Message Size

```typescript
// ❌ Bad - sending entire document
panel.webview.postMessage({ 
  command: 'update', 
  document: entireDocument 
});

// ✅ Good - sending only changes
panel.webview.postMessage({ 
  command: 'update', 
  changes: changedLines 
});
```

### 3. Use Virtual Lists for Large Data

For webview rendering large datasets:

```typescript
// Use react-window or similar
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={35}
>
  {({ index, style }) => <div style={style}>{items[index]}</div>}
</FixedSizeList>
```

---

## Security Considerations

### 1. Content Security Policy (CSP)

Always define strict CSP for webviews:
- `default-src 'none'`: Deny all by default
- `script-src 'nonce-...'`: Only scripts with correct nonce
- `style-src ${webview.cspSource}`: Only bundled styles
- `img-src ${webview.cspSource} https:`: Images from bundle or HTTPS

### 2. Input Sanitization

Never trust user input or webview messages:

```typescript
import * as vscode from 'vscode';

panel.webview.onDidReceiveMessage(message => {
  // ✅ Validate command
  const allowedCommands = ['save', 'load', 'delete'];
  if (!allowedCommands.includes(message.command)) {
    console.error('Invalid command:', message.command);
    return;
  }
  
  // ✅ Validate payload structure
  if (message.command === 'save' && typeof message.payload?.id !== 'string') {
    vscode.window.showErrorMessage('Invalid save payload');
    return;
  }
  
  // Process message
});
```

### 3. Use SecretStorage for Sensitive Data

```typescript
export async function storeApiKey(
  context: vscode.ExtensionContext, 
  apiKey: string
): Promise<void> {
  await context.secrets.store('myext.apiKey', apiKey);
}

export async function getApiKey(
  context: vscode.ExtensionContext
): Promise<string | undefined> {
  return context.secrets.get('myext.apiKey');
}
```

---

## Debugging Strategies

### 1. Extension Debugging

Launch configuration (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "runtimeExecutable": "${execPath}",
      "args": ["--extensionDevelopmentPath=${workspaceFolder}"],
      "outFiles": ["${workspaceFolder}/out/**/*.js"],
      "preLaunchTask": "npm: watch"
    }
  ]
}
```

Set breakpoints in extension code, press F5, and debug in Extension Development Host.

### 2. Webview Debugging

1. Open Extension Development Host
2. Open webview panel
3. Run command: **Developer: Open Webview Developer Tools**
4. Use browser DevTools to debug frontend code

### 3. Logging Best Practices

```typescript
// src/utils/logger.ts
import * as vscode from 'vscode';

class Logger {
  private outputChannel: vscode.OutputChannel;
  
  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('My Extension');
  }
  
  info(message: string) {
    this.outputChannel.appendLine(`[INFO] ${new Date().toISOString()} - ${message}`);
  }
  
  error(message: string, error?: Error) {
    this.outputChannel.appendLine(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      this.outputChannel.appendLine(error.stack || error.message);
    }
  }
  
  show() {
    this.outputChannel.show();
  }
}

export const logger = new Logger();
```

---

## Scalability Concepts

### 1. Multi-Extension Architecture (Monorepo)

For large projects, consider monorepo with multiple extensions:

```
workspace/
├── packages/
│   ├── extension-core/
│   ├── extension-web/
│   └── shared-ui/
├── package.json (workspace root)
└── pnpm-workspace.yaml
```

### 2. Feature Flags

Implement feature flags for gradual rollout:

```typescript
// src/utils/featureFlags.ts
export const featureFlags = {
  newPanel: vscode.workspace.getConfiguration('myext').get('enableNewPanel', false),
  experimentalApi: process.env.NODE_ENV === 'development',
};

// Usage
if (featureFlags.newPanel) {
  registerNewPanel(context);
}
```

### 3. Extension API for Other Extensions

Expose an API for other extensions to consume:

```typescript
// src/api.ts
export interface MyExtensionApi {
  getData(): Promise<any>;
  saveData(data: any): Promise<void>;
}

// src/extension.ts
export function activate(context: vscode.ExtensionContext): MyExtensionApi {
  return {
    async getData() { /* implementation */ },
    async saveData(data) { /* implementation */ },
  };
}

// Other extensions can use:
const myExt = vscode.extensions.getExtension<MyExtensionApi>('publisher.my-extension');
await myExt?.exports.getData();
```

### 4. Internationalization (i18n)

Prepare for localization:

```typescript
// src/locales/en.json
{
  "extension.name": "My Extension",
  "commands.openPanel": "Open Panel"
}

// src/utils/i18n.ts
import enLocale from '../locales/en.json';

export function t(key: string): string {
  return enLocale[key] || key;
}

// Usage
vscode.window.showInformationMessage(t('commands.openPanel'));
```

---

## AI Agent Workflow Recommendations

### When Adding a New Feature

1. **Understand the request** - Ask clarifying questions if needed
2. **Check existing structure** - Review similar features
3. **Plan the changes** - Identify affected files (extension + webview)
4. **Implement incrementally**:
   - Backend logic in `src/`
   - Message types in `src/types/`
   - Frontend UI in `webview-ui/`
   - Tests in `test/`
5. **Verify**:
   - Build with `npm run build`
   - Run tests with `npm test`
   - Manual test in Extension Development Host
6. **Document** - Update README or docs if public-facing

### When Debugging Issues

1. **Check Output Channel** - Review extension logs
2. **Check Webview DevTools** - Inspect console errors
3. **Verify Message Contracts** - Ensure types match
4. **Check Activation** - Ensure extension activated correctly
5. **Review Disposables** - Check for resource leaks

### When Refactoring

1. **Write tests first** - Ensure behavior is captured
2. **Refactor incrementally** - Small, reviewable changes
3. **Run tests frequently** - Catch regressions early
4. **Update documentation** - Keep docs in sync

---

## Quick Reference

### Common VS Code APIs

| Task | API |
|------|-----|
| Show message | `vscode.window.showInformationMessage()` |
| Show error | `vscode.window.showErrorMessage()` |
| Get active editor | `vscode.window.activeTextEditor` |
| Read file | `vscode.workspace.fs.readFile()` |
| Write file | `vscode.workspace.fs.writeFile()` |
| Get config | `vscode.workspace.getConfiguration()` |
| Register command | `vscode.commands.registerCommand()` |
| Create webview | `vscode.window.createWebviewPanel()` |

### Common Webview APIs

| Task | API |
|------|-----|
| Get VS Code API | `acquireVsCodeApi()` |
| Send message | `vscode.postMessage({ ... })` |
| Get/set state | `vscode.getState()` / `vscode.setState()` |
| Listen for messages | `window.addEventListener('message', handler)` |

---

## Conclusion

This document serves as a living guide for AI coding assistants working with this VS Code extension template. Always prioritize:

1. **Code clarity** over cleverness
2. **Type safety** over shortcuts
3. **User experience** over features
4. **Security** over convenience
5. **Performance** as a feature, not an afterthought

When in doubt, consult the official VS Code Extension API documentation and follow the patterns established in this template.
