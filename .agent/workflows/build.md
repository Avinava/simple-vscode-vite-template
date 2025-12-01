---
description: Install dependencies and build the extension
---

# Install and Build

This workflow installs all dependencies and builds both the extension and webview.

## Steps

// turbo-all

1. **Install root dependencies**
   ```bash
   npm install
   ```

2. **Install webview dependencies**
   ```bash
   cd webview-ui && npm install && cd ..
   ```

3. **Build extension**
   ```bash
   npm run build:extension
   ```

4. **Build webview**
   ```bash
   npm run build:webview
   ```

5. **Verify build output**
   ```bash
   ls -la out/extension out/webview
   ```

All steps can be auto-run by AI assistants (marked with `// turbo-all`).
