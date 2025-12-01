# Development Guide

## Setup

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Start development mode:
   ```bash
   npm run watch
   ```

3. Press `F5` to launch Extension Development Host

## Project Structure

- **src/** - Extension backend (TypeScript, Node.js environment)
- **webview-ui/** - Frontend UI (Vite + React)
- **.vscode/** - VS Code workspace configuration
- **test/** - Extension tests

## Development Workflow

### Extension Development

1. Make changes to files in `src/`
2. TypeScript will auto-compile via watch mode
3. Reload the Extension Development Host window (`Cmd+R` / `Ctrl+R`)

### Webview Development

1. Make changes to files in `webview-ui/src/`
2. Vite HMR will automatically update the webview
3. No reload needed!

### Debugging

**Extension:**
- Set breakpoints in `src/` files
- Press `F5` to start debugging
- Extension code runs in Extension Development Host

**Webview:**
1. Open Extension Development Host
2. Open your webview panel
3. Run command: **Developer: Open Webview Developer Tools**
4. Use browser devtools to debug React code

## Architecture

### Extension Backend (`src/`)

- **extension.ts** - Main entry point, handles activation
- **panels/** - Webview panel classes
- **commands/** - Command implementations
- **utils/** - Helper functions
- **types/** - TypeScript type definitions

### Webview Frontend (`webview-ui/`)

- **src/App.tsx** - Main React component
- **src/hooks/** - Custom React hooks (including `useVSCodeApi`)
- **src/styles/** - CSS files with VS Code theme variables

## Communication

### Webview → Extension

```typescript
const vscode = useVSCodeApi();
vscode.postMessage({ command: 'save', data: {...} });
```

### Extension → Webview

```typescript
panel.webview.postMessage({ command: 'update', data: {...} });
```

## Adding Features

### 1. Add a Command

**package.json:**
```json
"contributes": {
  "commands": [
    {
      "command": "your-ext.newCommand",
      "title": "New Command"
    }
  ]
}
```

**src/extension.ts:**
```typescript
const cmd = vscode.commands.registerCommand('your-ext.newCommand', () => {
  vscode.window.showInformationMessage('Command executed!');
});
context.subscriptions.push(cmd);
```

### 2. Add a New Panel

1. Create `src/panels/NewPanel.ts` (copy from `ExamplePanel.ts`)
2. Update the panel class name and view type
3. Register command in `extension.ts`
4. Create corresponding React component in `webview-ui/src/`

### 3. Add Webview Components

1. Create component in `webview-ui/src/components/`
2. Import and use in `App.tsx`
3. Use VS Code CSS variables for theming

## Best Practices

1. **Always dispose resources** - Use `context.subscriptions.push()`
2. **Type your messages** - Define interfaces in `src/types/messages.ts`
3. **Use VS Code theme variables** - Never hardcode colors
4. **Follow naming conventions** - See `agents.md`
5. **Keep panels singleton** - Only one instance per panel type

## Troubleshooting

### Extension not activating
- Check `activationEvents` in `package.json`
- Verify command IDs match
- Check Output > Extension Host logs

### Webview not loading
- Ensure `npm run watch:webview` is running
- Check webview DevTools console for errors
- Verify webviewUri paths in `ExamplePanel.ts`

### Build errors
- Run `npm run clean` to remove old build artifacts
- Re-install dependencies: `npm run install:all`
- Check TypeScript errors: `npm run build`

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [VS Code Webview Guide](https://code.visualstudio.com/api/extension-guides/webview)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
