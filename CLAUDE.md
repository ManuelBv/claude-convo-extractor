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

## Session Archival Protocol

### User Command
When the user requests to "store this session" or "save this conversation", follow this protocol to create a comprehensive session archive file.

### Archive File Naming
Format: `[YYYY-MM-DD]-CLAUDE-[subject].md`

Example: `2026-02-01-CLAUDE-claude-convo-extractor-github-setup.md`

### Required Content Structure

Generate a complete session archive file with the following sections:

#### 1. Header Metadata
- Date (YYYY-MM-DD)
- Session Subject (descriptive title)
- Duration estimate
- Status (Completed/In Progress)
- Completeness indicator (100% - All conversation + technical details)

#### 2. Conversation Flow Section
For each user message, include:
- **User Request**: Exact user message text in blockquote format
- **Claude Response**: Summary of what Claude responded
- **Actions Taken**: Bullet list of what was executed
- **Sample Results**: Key outputs or file changes

#### 3. Technical Execution Details Section
For each major action/file modification, include:
- **File Path**: Absolute path to the file
- **File Details**: Total lines, language, type
- **Original Content**: Code/text before changes (in code blocks)
- **New Content**: Code/text after changes (in code blocks)
- **Changes Made**: Bullet list of modifications
- **Status**: ✅/❌ indicator

#### 4. Tool Calls & Outputs Section
For each bash/tool command executed:
- **Command**: Exact command with proper formatting
- **Output**: Complete command output
- **Exit Code**: Success/failure indicator
- **Impact**: What changed as a result

#### 5. Git History Section (if applicable)
- Commit hashes
- Commit messages
- Files changed
- Insertions/deletions
- Push status and results

#### 6. Summary & Metrics Section
Include:
- Table of all actions performed with status
- File statistics (paths, lines, actions)
- Total counts (files modified, created, renamed)
- Timeline breakdown by phase
- Key achievements checklist

#### 7. Code Review Notes (if applicable)
- Security considerations
- Performance impacts
- Testing coverage
- Breaking changes

#### 8. Complete File Listing (if applicable)
For bulk operations (file renames, creations):
- Complete numbered list of all files
- Before/after names for renames
- Status for each file

#### 9. Timeline Section
Table with columns:
- Step/Phase
- Action description
- Duration
- Status

### Quality Standards

**Completeness**: ✅ Must include ALL conversation details and technical execution
- No summarization that omits details
- Full code diffs for every edit
- Complete command outputs
- All user questions and Claude responses

**Accuracy**: ✅ All information must be factual
- Exact file paths (not approximations)
- Actual code snippets (not paraphrased)
- Real command outputs (not examples)
- Correct timestamps and dates
- Actual line numbers and file lengths

**Organization**: ✅ Logical, easy-to-navigate structure
- Clear section headings
- Numbered or bulleted lists
- Code blocks with syntax highlighting
- Tables for metrics and comparisons
- Proper markdown formatting

**Comprehensiveness**: ✅ Nothing important is left out
- Every file edited is documented
- Every command executed is shown
- Every user interaction is captured
- Full before/after for all changes
- All git operations logged

### Minimum Sections Required
1. ✅ Conversation flow with all user messages
2. ✅ Detailed technical execution for each major action
3. ✅ Complete code/content changes with diffs
4. ✅ All command outputs and results
5. ✅ Git history (if applicable)
6. ✅ Summary metrics and timeline
7. ✅ Complete status indicators

### Trigger Phrases
Create session archive when user says:
- "save this conversation"
- "store this session"
- "archive this conversation"
- "save this to conversations"
- "create a session file"
- "store this in [folder]"

### Special Instructions
- **Timestamps**: Include session date (today's date in YYYY-MM-DD format)
- **Tool Calls**: Show every bash command, read operation, edit operation
- **Outputs**: Capture actual tool outputs, not summaries
- **Code Context**: Show surrounding code and file context when possible
- **Security**: Highlight any security considerations or patterns
- **Completeness Check**: Verify every action in conversation is documented

## Claude Usage
Check compute allowance: https://claude.ai/settings/usage
