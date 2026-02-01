# Conversation Extractor Tool

## Purpose
Extract and archive conversations from Claude Code sessions periodically, then distribute to appropriate project folders.

## Workflow

### 1. Extract New Conversations
```bash
# List available Claude Code sessions
node import-claude-code.js

# Import all new sessions
node import-claude-code.js --all

# Import from specific project
node import-claude-code.js --project "project-name"
```

### 2. Review Extracted Conversations
New conversations land in `./archived/` subfolders:
- `archived/ai-general/` - AI/ML research, general coding
- `archived/coding/` - Software development sessions
- `archived/investing/` - Investment research sessions

### 3. Move to Destination Folders
After extraction, move conversations to their respective project folders:

```bash
# AI/general conversations
mv archived/ai-general/* ../ai-general/conversations/

# Coding conversations
mv archived/coding/* ../coding/conversations/

# Investing conversations
mv archived/investing/* ../investing/conversations/
```

### 4. Clean Up
Empty archived subfolders remain for next extraction batch.

## Destination Folders
| Source | Destination |
|--------|-------------|
| `archived/ai-general/` | `../ai-general/conversations/` |
| `archived/coding/` | `../coding/conversations/` |
| `archived/investing/` | `../investing/conversations/` |

## File Naming Convention
All extracted conversations follow the standard format: **`[YYYY-MM-DD]-CLAUDE-[subject].md`**

Examples:
- `2026-01-25-CLAUDE-llm-landscape-analysis.md`
- `2026-01-24-CLAUDE-investment-portfolio-review.md`
- `2026-01-23-CLAUDE-react-component-optimization.md`

## Notes
- Run extraction periodically to capture new sessions
- Review conversations before moving to ensure correct categorization
- The extractor tools remain here; only conversations get distributed
- The `console-extractor.js` automatically formats filenames with the date-CLAUDE-subject pattern

## Claude Usage
Check compute allowance: https://claude.ai/settings/usage
