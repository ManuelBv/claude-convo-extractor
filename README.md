# Claude Conversation Extractor

A comprehensive toolkit for extracting and archiving Claude AI conversations from multiple sources, with automatic categorization and standardized naming conventions.

## Features

- **Browser Extraction** (`console-extractor.js`) - Export conversations from claude.ai using DevTools Console, generates JSON backup
- **JSON Conversion** (`convert-json-export.js`) - Convert JSON exports to categorized markdown with auto-categorization or manual sorting
- **CLI Session Import** (`import-claude-code.js`) - Import Claude Code CLI sessions from local storage with automatic categorization
- **Auto-Categorization** - Intelligent keyword-based sorting into ai-general, coding, and investing categories
- **Standard Naming** - All files follow the convention: `[YYYY-MM-DD]-CLAUDE-[subject].md`
- **Markdown Output** - Clean, readable format with full metadata, timestamps, and thinking blocks

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

There are two independent pipelines for extracting conversations:

### Pipeline 1: Browser Conversations (claude.ai)

#### Step 1: Extract from claude.ai

Use `console-extractor.js` to download conversations directly from your claude.ai account.

**Steps:**

1. Go to https://claude.ai
2. Open DevTools (F12 or right-click → Inspect)
3. Go to the **Console** tab
4. Paste the entire contents of `console-extractor.js`
5. Press Enter to run
6. Select conversations to export when prompted
7. Two files will be downloaded to your Downloads folder:
   - Individual markdown files (optional, for quick reference)
   - **`claude-conversations-export-YYYY-MM-DD.json`** (required for next step)

**What it does:**
- Fetches all conversations from your Claude.ai account
- Extracts full conversation history with timestamps
- Creates individual markdown files for preview
- Generates comprehensive JSON backup containing all conversation data

#### Step 2: Convert JSON to Categorized Markdown

Use `convert-json-export.js` to process the JSON backup and generate categorized, organized markdown files.

**Commands:**

```bash
# Interactive mode - asks you to categorize each conversation
node convert-json-export.js ./archived/claude-conversations-export-YYYY-MM-DD.json

# Auto-categorize using keyword matching (recommended)
node convert-json-export.js ./archived/claude-conversations-export-YYYY-MM-DD.json --auto

# Put all conversations in one category
node convert-json-export.js ./archived/claude-conversations-export-YYYY-MM-DD.json --default coding

# Show help
node convert-json-export.js --help
```

**Modes:**

- **Interactive** (default): Reviews each conversation with preview, you select category (1=coding, 2=ai-general, 3=investing)
- **--auto**: Keyword-based auto-categorization (fastest, usually accurate)
  - **ai-general**: Keywords like "ai", "llm", "model", "neural", "transformer", "training"
  - **coding**: Keywords like "code", "bug", "react", "javascript", "api", "database", "git"
  - **investing**: Keywords like "stock", "portfolio", "crypto", "market", "financial"
- **--default [category]**: Place all conversations in specified category for manual review later

**What it does:**
- Parses JSON backup file
- Extracts full conversation content
- Categorizes based on selected mode
- Generates markdown with standard naming: `[YYYY-MM-DD]-CLAUDE-[subject].md`
- Outputs to `archived/[category]/` subdirectories

### Pipeline 2: Claude Code CLI Sessions

Use `import-claude-code.js` to convert Claude Code CLI session logs to categorized markdown.

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
- Extracts and categorizes sessions
- Converts to readable markdown with:
  - Session metadata (ID, project path, date, model)
  - User and Assistant messages with timestamps
  - Extended thinking blocks (collapsible `<details>` tags)
- Outputs directly to `archived/[category]/` subdirectories
- File format: `[YYYY-MM-DD]-CLAUDE-[project-slug]-[sessionid].md`

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
convo-extractor/
├── README.md (this file)
├── CLAUDE.md (tool documentation & configuration)
├── console-extractor.js (DevTools Console script for claude.ai)
├── import-claude-code.js (CLI session importer)
├── convert-json-export.js (JSON to markdown converter with auto-categorization)
├── package.json (Node.js dependencies)
├── .gitignore (Git configuration)
├── .claude/ (Claude Code configuration)
└── archived/ (temporary workspace for extracted conversations)
    ├── claude-conversations-export-YYYY-MM-DD.json (JSON backup from console-extractor)
    ├── ai-general/ (auto-categorized conversations)
    │   └── [YYYY-MM-DD]-CLAUDE-*.md
    ├── coding/
    │   └── [YYYY-MM-DD]-CLAUDE-*.md
    └── investing/
        └── [YYYY-MM-DD]-CLAUDE-*.md
```

The `archived/` directory is a **temporary workspace**. After extraction, move files to your chosen destination folder structure. Example:

```
your-project/
├── conversations/
│   ├── ai-general/
│   ├── coding/
│   └── investing/
```

Or organize differently - the tool doesn't enforce a specific destination structure.

## Complete Workflow

### Browser Conversations (claude.ai)

1. **Export from claude.ai**
   ```bash
   # Run in DevTools Console on https://claude.ai
   # Paste and execute console-extractor.js
   # Select conversations to export
   # Download: markdown files + JSON backup (to Downloads/)
   ```

2. **Move JSON backup to project**
   ```bash
   # Copy claude-conversations-export-YYYY-MM-DD.json to convo-extractor/archived/
   ```

3. **Convert JSON to categorized markdown**
   ```bash
   # Auto-categorization (recommended)
   node convert-json-export.js ./archived/claude-conversations-export-YYYY-MM-DD.json --auto

   # Result: Categorized markdown files appear in:
   # archived/ai-general/
   # archived/coding/
   # archived/investing/
   ```

4. **Move to your destination**
   ```bash
   # Move files to wherever you want to store them
   # Example: your-project/conversations/
   mv ./archived/ai-general/* /path/to/your/conversations/ai-general/
   mv ./archived/coding/* /path/to/your/conversations/coding/
   mv ./archived/investing/* /path/to/your/conversations/investing/
   ```

### Claude Code CLI Sessions

1. **List available sessions**
   ```bash
   node import-claude-code.js
   # Shows all available Claude Code sessions with dates and sizes
   ```

2. **Import and categorize**
   ```bash
   # Import all sessions
   node import-claude-code.js --all

   # Result: Categorized markdown files in:
   # archived/ai-general/
   # archived/coding/
   # archived/investing/
   ```

3. **Move to your destination**
   ```bash
   # Same as browser workflow - move files to your chosen location
   mv ./archived/ai-general/* /path/to/your/conversations/ai-general/
   mv ./archived/coding/* /path/to/your/conversations/coding/
   mv ./archived/investing/* /path/to/your/conversations/investing/
   ```

## Key Concepts

### Categorization

Conversations are organized into three categories:

- **ai-general**: AI/ML research, LLMs, language models, neural networks, transformers
- **coding**: Software development, bug fixes, code reviews, APIs, databases, frameworks
- **investing**: Investment research, stock analysis, portfolio management, financial metrics

### Auto-Categorization Logic

The `--auto` mode uses keyword matching:
- Examines conversation titles and first 500 characters of content
- Counts keyword matches for each category
- Assigns to category with highest score
- Falls back to 'coding' if no matches found

### Naming Convention

All files follow: `[YYYY-MM-DD]-CLAUDE-[subject].md`

Examples:
- `2026-01-25-CLAUDE-diffusion-model-architecture.md`
- `2026-01-24-CLAUDE-investment-portfolio-review.md`
- `2026-01-23-CLAUDE-react-component-optimization.md`

## Markdown Output Format

All tools produce consistent markdown format:

```markdown
# [Conversation Title]

**ID**: [uuid]
**Created**: [ISO timestamp]
**Updated**: [ISO timestamp]
**Model**: [model name]

---

## User _[timestamp]_

[full message content including multi-line text]

## Assistant _[timestamp]_

[full response content]

<details>
<summary>Thinking _[timestamp]_</summary>

[extended thinking blocks, if present]

</details>

## User _[timestamp]_

[next message]
```

### Format Details

- **Metadata**: ID, creation date, update date, model used
- **Messages**: Separated by role (User/Assistant/Thinking)
- **Timestamps**: Full timestamp for each message
- **Thinking blocks**: Collapsible details tags for extended thinking output
- **Content**: Full, untruncated message content
- **File naming**: `[YYYY-MM-DD]-CLAUDE-[subject].md`

### Text Content Extraction

Messages are extracted from multiple possible locations in the source data:
- Direct `text` field (if non-empty)
- Content blocks array with type="text"
- Thinking blocks with type="thinking"
- Properly handles empty text fields by checking content array

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

**Files not downloading**
- Check browser download settings
- Ensure pop-ups and file downloads are enabled
- Check your Downloads folder for both markdown and JSON files

### Convert-JSON-Export Issues

**"File not found"**
- Verify the JSON file path is correct
- Ensure you saved the JSON backup from console-extractor
- Check that the file hasn't been moved or deleted

**Empty markdown files (no content)**
- This indicates a JSON structure issue
- Verify the JSON file contains full message content with "content" array
- Check that messages have proper structure with text blocks

**All conversations categorized incorrectly**
- Use interactive mode to manually review: `node convert-json-export.js <file>`
- Or adjust keyword list in convert-json-export.js for your specific needs
- Use `--default` mode to categorize manually later

### Import-Claude-Code Issues

**"Claude projects directory not found"**
- Ensure Claude Code CLI is installed
- Claude Code stores sessions in `~/.claude/projects/`

**"Session not found"**
- Verify the session ID exists by running without arguments to list sessions
- Check the project path encoding (slashes become `--`, backslashes become `-`)

## Important Notes

### Pipeline Independence
- **Browser Pipeline** (console-extractor → convert-json-export) and **CLI Pipeline** (import-claude-code) are completely independent
- You can use one, the other, or both
- They both output to the same `archived/` structure for easy consolidation

### JSON Backup is Key
- The JSON file from console-extractor.js is the primary artifact
- Individual markdown files are secondary (for quick preview only)
- Always use convert-json-export.js to process the JSON for better control and categorization

### Categorization is Flexible
- Auto-categorization uses keywords (see keyword lists in convert-json-export.js)
- You can customize keywords by editing the script
- Interactive mode lets you manually review each conversation
- `--default` mode lets you categorize everything as one category for later review

### File Organization
- `archived/` directory is a temporary workspace in the tool
- You choose where to move extracted conversations on your machine
- Organize by category (ai-general, coding, investing) or create your own structure
- The tool is destination-agnostic - use it however fits your workflow

### Content Extraction
- Full conversation history is extracted including all messages
- Extended thinking blocks are preserved and collapsible
- Citations and metadata are included when available
- All content is untruncated (unlike some UI views)

## License

MIT

## Author

ManuelBv - https://github.com/ManuelBv
