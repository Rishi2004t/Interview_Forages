# InterviewForge

> **Turn Your Code Into Interview Readiness.**  
> AI-powered interview assistance, right inside VS Code.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **AI Code Analysis** | Deep analysis of your current file using Groq AI |
| ⏱ **Time Complexity Analysis** | Automatic Big-O time & space complexity detection |
| 🔄 **Alternative Approaches** | AI suggests better or different solutions |
| 💬 **Interview Questions** | 5 targeted questions generated from your code |
| 🎤 **Mock Interviews** | Answer questions, get scored, receive feedback |
| 📊 **Interview History** | Track your past sessions and progress |

---

## ⚙️ Requirements

- [VS Code](https://code.visualstudio.com/) ≥ 1.85
- **Groq API Key** — free at [console.groq.com/keys](https://console.groq.com/keys)

---

## 🚀 How to Use

### 1. Install InterviewForge
Install the extension from the VS Code Marketplace or load it via F5 in development.

### 2. Configure Groq API Key
Open VS Code Settings (`Ctrl+,`) and search for **InterviewForge**.  
Paste your key in **`interviewforge.groqApiKey`**.

```json
// settings.json
{
  "interviewforge.groqApiKey": "gsk_your_key_here",
  "interviewforge.groqModel": "llama-3.3-70b-versatile"
}
```

### 3. Load Current Code
- Click the **InterviewForge** icon in the Activity Bar.
- Open any code file in the editor.
- Click **⬇ Load Current Code** in the sidebar.

### 4. Click Explain Code
Click **🧠 Explain Code** to get an AI-powered analysis:
- Summary
- Time & Space Complexity
- Alternative Approaches
- Interview Questions

### 5. Start Mock Interview *(optional)*
Click **🚀 Start Mock Interview** to:
1. Receive 5 AI-generated questions based on your code.
2. Answer each question in the text box.
3. Get a **score (0–10)**, **feedback**, and a **follow-up question** after each answer.
4. Review your session in **📊 Interview History**.

---

## 🗂️ Project Structure

```
src/
├── extension.ts                      # Extension entry point
├── commands/
│   └── openPanel.ts                  # interviewforge.openPanel command
├── panels/
│   ├── InterviewPanel.ts             # Main editor WebviewPanel (singleton)
│   └── InterviewSidebarProvider.ts  # Activity Bar sidebar provider
├── services/
│   ├── codeReader.ts                 # VS Code editor content reader
│   ├── groqService.ts                # Groq AI code analysis
│   ├── interviewService.ts           # Mock interview Q&A service
│   └── historyService.ts             # Session history (globalState)
└── utils/
    └── webviewContent.ts             # Shared HTML + CSP nonce generator
media/
├── icon.png                          # Extension marketplace icon
└── icon.svg                          # Activity Bar icon
```

---

## 🏗️ Architecture

- **`InterviewPanel`** is a singleton — `createOrShow()` reveals the existing panel instead of creating duplicates.
- **`webviewContent`** is the single source of truth for all webview HTML, shared between sidebar and main panel.
- All webview scripts run with **nonce-based Content Security Policy** (no inline scripts, no XSS).
- **`historyService`** uses VS Code `globalState` — history persists across restarts, never committed to git.
- AI services are **stateless** — session state lives only in the providers, making resets trivial.

---

## 📄 License

MIT
