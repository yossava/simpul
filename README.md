# simpul

A multi-panel productivity app built with Next.js, Tailwind CSS, and TypeScript.

**Live demo:** [https://simpul-nu.vercel.app/](https://simpul-nu.vercel.app/)

## Features

### Inbox (Chat)
- View a list of chat conversations with unread indicators
- Open individual chats with full message history
- Send new messages with real-time optimistic updates
- Reply to a specific message (quoted reply bubble)
- Edit and delete sent messages
- Messages persist across sessions via JSONBin

### Task Management
- View all tasks with due dates, descriptions, and labels
- Create new tasks with a title, due date, description, and labels
- Toggle task completion (checkbox)
- Edit due date inline via a date picker
- Edit task description inline
- Delete tasks
- Label tagging: choose from 8 color-coded labels per task
- Dynamic "Days Left" countdown; shows "Overdue" for past-due tasks
- Tasks persist across sessions via JSONBin

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Storage**: JSONBin.io (REST-based JSON storage)

## Environment Variables

Create a `.env.local` file with the following:

```
JSONBIN_API_KEY=your_api_key
JSONBIN_TASKS_BIN=your_tasks_bin_id
JSONBIN_CHATS_BIN=your_chats_bin_id
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
