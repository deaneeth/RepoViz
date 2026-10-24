# RepoViz

An interactive GitHub repository visualizer. Paste a public repo URL and RepoViz turns it into a node-based graph of the project's file structure, dependencies, and tech stack.

![RepoViz preview](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## Features

- Generates a graph from a public GitHub repository URL
- Shows folders, files, languages, and dependencies as connected nodes
- Toggle individual files, folders, and dependencies on or off from the sidebar
- Customize the graph layout and appearance
- Export diagrams for documentation or team sharing

## Tech stack

React 19 · TypeScript · Vite · D3 · Google Gemini (`@google/genai`)

## Run locally

**Prerequisites:** Node.js 18+ and a [Gemini API key](https://aistudio.google.com/apikey)

```bash
git clone https://github.com/deaneeth/RepoViz.git
cd RepoViz
npm install
echo "GEMINI_API_KEY=your-key" > .env.local
npm run dev
```

Other scripts: `npm run build` for a production build, `npm run preview` to serve it locally.

## Notes

The Gemini key is injected at build time by Vite, so don't deploy a build that contains a key you want to keep private.
