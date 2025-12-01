# Simple VS Code Vite Template

A modern, scalable starter template for building VS Code extensions with **Vite**, **React**, and **TypeScript**.

## ✨ Features

- 🚀 **Vite** for blazing-fast HMR (Hot Module Replacement) in webviews
- ⚛️ **React** + **TypeScript** for type-safe UI development
- 🎨 **VS Code Theme Integration** - Automatically adapts to user's theme
- 📦 **Feature-based folder structure** for scalability
- 🔧 **Pre-configured** ESLint, Prettier, and TypeScript
- 📚 **AI-friendly** with comprehensive `agents.md` documentation

## 📁 Project Structure

```
├── src/                    # Extension backend (Node.js)
│   ├── extension.ts        # Entry point
│   ├── panels/             # Webview panel managers
│   ├── commands/           # Command handlers
│   ├── utils/              # Shared utilities
│   └── types/              # TypeScript definitions
│
├── webview-ui/             # Frontend (Vite + React)
│   ├── src/
│   │   ├── App.tsx         # Main React component
│   │   ├── hooks/          # Custom React hooks
│   │   └── styles/         # Global styles
│   └── vite.config.ts      # Vite configuration
│
├── .vscode/                # VS Code workspace settings
├── docs/                   # Documentation
└── agents.md               # AI coding assistant rules
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- VS Code 1.85+

### Installation

1. **Clone or use this template**
   ```bash
   git clone https://github.com/your-username/simple-vscode-vite-template.git
   cd simple-vscode-vite-template
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```
   This installs dependencies for both the extension and webview.

3. **Start development**
   ```bash
   npm run watch
   ```
   This starts TypeScript watch for the extension and Vite dev server for the webview.

4. **Launch the extension**
   - Press `F5` in VS Code
   - This opens the Extension Development Host
   - Run command: **Template: Open Example Panel**

## 📝 Development Scripts

| Script | Description |
|--------|-------------|
| `npm run watch` | Watch both extension and webview |
| `npm run build` | Build both extension and webview |
| `npm run watch:extension` | Watch extension TypeScript only |
| `npm run watch:webview` | Watch webview with Vite HMR |
| `npm run lint` | Lint TypeScript files |
| `npm run format` | Format code with Prettier |
| `npm run package` | Package extension as VSIX |

## 🛠️ Customization

### Update Extension Metadata

Edit `package.json`:
```json
{
  "name": "your-extension-name",
  "displayName": "Your Extension Display Name",
  "description": "Your extension description",
  "publisher": "your-publisher-name"
}
```

### Add Commands

1. **Register in `package.json`**:
   ```json
   "contributes": {
     "commands": [
       {
         "command": "your-ext.commandId",
         "title": "Command Title"
       }
     ]
   }
   ```

2. **Implement in `src/extension.ts`**:
   ```typescript
   const cmd = vscode.commands.registerCommand('your-ext.commandId', () => {
     // Your logic here
   });
   context.subscriptions.push(cmd);
   ```

### Modify Webview UI

- **Components**: Edit `webview-ui/src/App.tsx`
- **Styles**: Edit `webview-ui/src/styles/index.css`
- **VS Code API**: Use `hooks/useVSCodeApi.ts`

## 🔄 Extension ↔ Webview Communication

### Send from Webview to Extension

```typescript
// In React component
const vscode = useVSCodeApi();
vscode.postMessage({ command: 'myCommand', data: {...} });
```

### Handle in Extension

```typescript
// In ExamplePanel.ts
panel.webview.onDidReceiveMessage(message => {
  switch (message.command) {
    case 'myCommand':
      // Handle message
      break;
  }
});
```

### Send from Extension to Webview

```typescript
// In ExamplePanel.ts
panel.webview.postMessage({ command: 'update', data: {...} });
```

### Handle in Webview

```typescript
// In useVSCodeApi.ts
window.addEventListener('message', event => {
  const message = event.data;
  if (message.command === 'update') {
    // Handle update
  }
});
```

## 📚 Documentation

- **[agents.md](./agents.md)** - Comprehensive guide for AI coding assistants
- **Extension API**: [VS Code Extension API](https://code.visualstudio.com/api)
- **Vite**: [Vite Documentation](https://vitejs.dev/)
- **React**: [React Documentation](https://react.dev/)

## 📦 Publishing

1. **Install vsce**:
   ```bash
   npm install -g @vscode/vsce
   ```

2. **Package**:
   ```bash
   npm run package
   ```

3. **Publish**:
   ```bash
   npm run deploy
   ```

   Or manually:
   ```bash
   vsce publish
   ```

## 🤝 AI Assistant Friendly

This template includes `agents.md` with comprehensive guidelines for AI coding assistants, covering:
- Architectural patterns
- Development rules
- Communication patterns
- Testing strategies
- Security considerations
- Debugging tips

## 🎯 Features Showcase

This template demonstrates:
- ✅ Singleton webview panel pattern
- ✅ Type-safe message contracts
- ✅ VS Code theme integration
- ✅ Hot module replacement (HMR)
- ✅ Proper resource disposal
- ✅ Content Security Policy (CSP)

## 📄 License

MIT

## 🙏 Credits

Built with best practices from:
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)

---

**Happy coding! 🚀**

For questions or issues, please open an issue on GitHub.
