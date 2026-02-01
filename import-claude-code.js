#!/usr/bin/env node

/**
 * Import Claude Code sessions from .jsonl files to readable markdown
 *
 * Usage:
 *   node import-claude-code.js                    # List available sessions
 *   node import-claude-code.js <session-id>       # Import specific session
 *   node import-claude-code.js --all              # Import all sessions
 *   node import-claude-code.js --project <path>   # Import from specific project
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const CLAUDE_PROJECTS_DIR = path.join(os.homedir(), '.claude', 'projects');
const OUTPUT_DIR = path.join(__dirname, 'archived');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * List all available projects and sessions
 */
function listSessions() {
  if (!fs.existsSync(CLAUDE_PROJECTS_DIR)) {
    console.error('Claude projects directory not found:', CLAUDE_PROJECTS_DIR);
    process.exit(1);
  }

  const projects = fs.readdirSync(CLAUDE_PROJECTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  console.log('\n=== Available Claude Code Sessions ===\n');

  for (const project of projects) {
    const projectPath = path.join(CLAUDE_PROJECTS_DIR, project);
    const sessions = fs.readdirSync(projectPath)
      .filter(f => f.endsWith('.jsonl'));

    if (sessions.length > 0) {
      // Decode project path
      const decodedPath = project.replace(/--/g, '/').replace(/-/g, '\\');
      console.log(`Project: ${decodedPath}`);

      for (const session of sessions) {
        const sessionId = session.replace('.jsonl', '');
        const stats = fs.statSync(path.join(projectPath, session));
        const modified = stats.mtime.toISOString().split('T')[0];
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`  - ${sessionId} (${modified}, ${sizeKB}KB)`);
      }
      console.log('');
    }
  }

  console.log('Usage:');
  console.log('  node import-claude-code.js <session-id>');
  console.log('  node import-claude-code.js --all');
  console.log('  node import-claude-code.js --project "C--Users-manue-Desktop-code-neo"');
}

/**
 * Parse a .jsonl file and extract conversation
 */
function parseSession(jsonlPath) {
  const content = fs.readFileSync(jsonlPath, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);

  const messages = [];
  let sessionInfo = null;

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);

      // Extract session info from first user message
      if (!sessionInfo && entry.type === 'user' && entry.sessionId) {
        sessionInfo = {
          sessionId: entry.sessionId,
          cwd: entry.cwd,
          version: entry.version,
          timestamp: entry.timestamp
        };
      }

      // User messages
      if (entry.type === 'user' && entry.message?.content) {
        const content = typeof entry.message.content === 'string'
          ? entry.message.content
          : extractToolResult(entry.message.content);

        if (content && !content.startsWith('[Tool result')) {
          messages.push({
            role: 'user',
            content: content,
            timestamp: entry.timestamp
          });
        }
      }

      // Assistant messages (text only, skip tool calls)
      if (entry.type === 'assistant' && entry.message?.content) {
        for (const block of entry.message.content) {
          if (block.type === 'text' && block.text) {
            messages.push({
              role: 'assistant',
              content: block.text,
              timestamp: entry.timestamp,
              model: entry.message.model
            });
          }
          // Optionally include thinking blocks
          if (block.type === 'thinking' && block.thinking) {
            messages.push({
              role: 'thinking',
              content: block.thinking,
              timestamp: entry.timestamp
            });
          }
        }
      }
    } catch (e) {
      // Skip malformed lines
    }
  }

  return { sessionInfo, messages };
}

/**
 * Extract text from tool result content
 */
function extractToolResult(content) {
  if (Array.isArray(content)) {
    for (const item of content) {
      if (item.type === 'tool_result') {
        return `[Tool result: ${item.content?.substring(0, 100) || 'empty'}...]`;
      }
    }
  }
  return null;
}

/**
 * Convert parsed session to markdown
 */
function toMarkdown(sessionInfo, messages, options = {}) {
  const { includeThinking = false, includeTimestamps = true } = options;

  let md = `# Claude Code Session\n\n`;

  if (sessionInfo) {
    md += `**Session ID**: ${sessionInfo.sessionId}\n`;
    md += `**Project**: ${sessionInfo.cwd}\n`;
    md += `**Date**: ${sessionInfo.timestamp?.split('T')[0] || 'Unknown'}\n`;
    md += `**Claude Code Version**: ${sessionInfo.version || 'Unknown'}\n`;
    md += `\n---\n\n`;
  }

  for (const msg of messages) {
    if (msg.role === 'thinking' && !includeThinking) {
      continue;
    }

    const timestamp = includeTimestamps && msg.timestamp
      ? ` _${new Date(msg.timestamp).toLocaleTimeString()}_`
      : '';

    if (msg.role === 'user') {
      md += `## User${timestamp}\n\n${msg.content}\n\n`;
    } else if (msg.role === 'assistant') {
      const model = msg.model ? ` (${msg.model})` : '';
      md += `## Assistant${model}${timestamp}\n\n${msg.content}\n\n`;
    } else if (msg.role === 'thinking') {
      md += `<details>\n<summary>Thinking${timestamp}</summary>\n\n${msg.content}\n\n</details>\n\n`;
    }
  }

  return md;
}

/**
 * Find session file by ID (searches all projects)
 */
function findSession(sessionId) {
  const projects = fs.readdirSync(CLAUDE_PROJECTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const project of projects) {
    const sessionPath = path.join(CLAUDE_PROJECTS_DIR, project, `${sessionId}.jsonl`);
    if (fs.existsSync(sessionPath)) {
      return { project, sessionPath };
    }
  }
  return null;
}

/**
 * Import a single session
 */
function importSession(sessionId, options = {}) {
  const found = findSession(sessionId);
  if (!found) {
    console.error(`Session not found: ${sessionId}`);
    return null;
  }

  const { project, sessionPath } = found;
  const { sessionInfo, messages } = parseSession(sessionPath);

  if (messages.length === 0) {
    console.log(`Skipping empty session: ${sessionId}`);
    return null;
  }

  const markdown = toMarkdown(sessionInfo, messages, options);

  // Generate output filename with date-CLAUDE-subject format
  const date = sessionInfo?.timestamp?.split('T')[0] || 'unknown-date';
  const projectSlug = project.split('--').pop().toLowerCase().replace(/[^a-z0-9]/g, '-');
  const subject = `${projectSlug}-${sessionId.substring(0, 8)}`;
  const outputFile = `${date}-CLAUDE-${subject}.md`;
  const outputPath = path.join(OUTPUT_DIR, outputFile);

  fs.writeFileSync(outputPath, markdown);
  console.log(`Imported: ${outputFile} (${messages.length} messages)`);

  return outputPath;
}

/**
 * Import all sessions from a project
 */
function importProject(projectName) {
  const projectPath = path.join(CLAUDE_PROJECTS_DIR, projectName);
  if (!fs.existsSync(projectPath)) {
    console.error(`Project not found: ${projectName}`);
    return;
  }

  const sessions = fs.readdirSync(projectPath)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => f.replace('.jsonl', ''));

  console.log(`Importing ${sessions.length} sessions from ${projectName}...\n`);

  for (const sessionId of sessions) {
    importSession(sessionId);
  }
}

/**
 * Import all sessions
 */
function importAll() {
  const projects = fs.readdirSync(CLAUDE_PROJECTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const project of projects) {
    importProject(project);
  }
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0) {
  listSessions();
} else if (args[0] === '--all') {
  importAll();
} else if (args[0] === '--project' && args[1]) {
  importProject(args[1]);
} else if (args[0] === '--help') {
  console.log(`
Claude Code Session Importer

Usage:
  node import-claude-code.js                    List available sessions
  node import-claude-code.js <session-id>       Import specific session
  node import-claude-code.js --all              Import all sessions
  node import-claude-code.js --project <name>   Import all sessions from project

Options:
  --help    Show this help message

Output:
  Markdown files are saved to ./archived/
  Format: YYYY-MM-DD-CLAUDE-project-name-sessionid.md

Example:
  2026-01-25-CLAUDE-neo-purrfect-blocks-a1b2c3d4.md
`);
} else {
  // Assume it's a session ID
  importSession(args[0]);
}
