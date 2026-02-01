# Claude Conversation Extractor

A toolkit for extracting and archiving Claude AI conversations from multiple sources, with automatic file organization and standardized naming conventions.

## Features

- **Browser Extraction** (`console-extractor.js`) - Extract conversations directly from claude.ai using DevTools Console
- **CLI Session Import** (`import-claude-code.js`) - Import Claude Code CLI sessions from local storage
- **Automatic Organization** - Extracted conversations are categorized by project type
- **Standard Naming** - All files follow the convention: `[YYYY-MM-DD]-CLAUDE-[subject].md`
- **Markdown Output** - Clean, readable markdown format with metadata and timestamps

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/ManuelBv/claude-convo-extractor.git
cd claude-convo-extractor

# Install dependencies
npm install
```

## Usage

### 1. Extract Conversations from claude.ai

Use `console-extractor.js` to download conversations directly from your claude.ai account.

**Steps:**

1. Go to https://claude.ai
2. Open DevTools (F12 or right-click → Inspect)
3. Go to the **Console** tab
4. Paste the entire contents of `console-extractor.js`
5. Press Enter to run
6. Select conversations to export when prompted
7. Files will be downloaded to your Downloads folder

**What it does:**
- Fetches all conversations from your Claude.ai account
- Extracts full conversation history with timestamps
- Exports as markdown files + JSON backup
- File format: `[YYYY-MM-DD]-CLAUDE-[conversation-subject].md`

### 2. Import Claude Code CLI Sessions

Use `import-claude-code.js` to convert Claude Code CLI session logs to markdown.

**Commands:**

```bash
# List all available Claude Code sessions
node import-claude-code.js

# Import a specific session by ID
node import-claude-code.js <session-id>

# Import all sessions from all projects
node import-claude-code.js --all

# Import all sessions from a specific project
node import-claude-code.js --project "C--Users-manue-Desktop-code-neo"

# Show help
node import-claude-code.js --help
```

**What it does:**
- Scans `~/.claude/projects/` for Claude Code session files
- Parses `.jsonl` (JSON Lines) format session logs
- Converts to readable markdown with:
  - Session metadata (ID, project path, date, model)
  - User and Assistant messages with timestamps
  - Optional thinking blocks (collapsible)
- File format: `[YYYY-MM-DD]-CLAUDE-[project-name-sessionid].md`

## File Naming Convention

All extracted conversations follow this standard format:

```
[YYYY-MM-DD]-CLAUDE-[subject].md
```

**Examples:**
- `2026-01-25-CLAUDE-diffusion-model-architecture.md`
- `2026-01-24-CLAUDE-investment-portfolio-review.md`
- `2026-01-23-CLAUDE-react-component-optimization.md`
- `2026-01-22-CLAUDE-neo-purrfect-blocks-a1b2c3d4.md`

## Directory Structure

```
claude-convo-extractor/
├── README.md (this file)
├── CLAUDE.md (tool documentation & configuration)
├── console-extractor.js (DevTools Console script for claude.ai)
├── import-claude-code.js (CLI session importer)
├── package.json (Node.js dependencies)
├── .gitignore (Git configuration)
└── archived/ (extracted conversations organized by type)
    ├── ai-general/
    ├── coding/
    └── investing/
```

## Workflow

### Browser Conversations to Archive

1. Run `console-extractor.js` in DevTools Console on claude.ai
2. Select conversations to export
3. Files download to Downloads folder
4. Move downloaded files to appropriate `archived/` subdirectories:
   - AI/ML research → `archived/ai-general/`
   - Software development → `archived/coding/`
   - Investment research → `archived/investing/`

### Claude Code CLI Sessions to Archive

1. Run `node import-claude-code.js --all` to import all sessions
2. Converted markdown files appear in `archived/` subdirectories
3. Review and organize by category as needed

## Markdown Output Format

### Console-Extractor Output

```markdown
# [Conversation Title]

**ID**: [conversation-uuid]
**Created**: [ISO timestamp]
**Updated**: [ISO timestamp]
**Model**: [claude model]

---

## User _[timestamp]_

[user message content]

## Assistant (claude-3-5-sonnet) _[timestamp]_

[assistant response]
```

### Import-Claude-Code Output

```markdown
# Claude Code Session

**Session ID**: [session-id]
**Project**: [project path]
**Date**: [YYYY-MM-DD]
**Claude Code Version**: [version]

---

## User _[timestamp]_

[user input]

## Assistant (claude-haiku-4-5) _[timestamp]_

[assistant response]

<details>
<summary>Thinking _[timestamp]_</summary>

[extended thinking output]

</details>
```

## Configuration

### CLAUDE.md

See `CLAUDE.md` for:
- Detailed tool documentation
- Setup instructions
- File naming conventions
- Workflow guidelines

## Troubleshooting

### Console-Extractor Issues

**"Organization ID not found"**
- Check the Network tab in DevTools for `/api/organizations/` calls
- Look for the `uuid` parameter and paste it when prompted

**"No conversations found"**
- Ensure you're logged into claude.ai
- Verify your account has active conversations

### Import-Claude-Code Issues

**"Claude projects directory not found"**
- Ensure Claude Code CLI is installed
- Claude Code stores sessions in `~/.claude/projects/`

**"Session not found"**
- Verify the session ID exists by running without arguments to list sessions
- Check the project path encoding (slashes become `--`, backslashes become `-`)

## Notes

- All extracted conversations are stored in markdown format for easy version control and searching
- The `archived/` directory contains extracted files; organize them into appropriate project folders as needed
- Both extractors automatically generate files with the standard naming convention
- Thinking blocks from extended thinking mode are captured and can be toggled with `<details>` tags

## License

MIT

## Author

ManuelBv - https://github.com/ManuelBv
