#!/usr/bin/env node

/**
 * Convert JSON export from console-extractor to organized markdown files
 *
 * Usage:
 *   node convert-json-export.js <json-file>
 *   node convert-json-export.js <json-file> --auto-categorize
 *   node convert-json-export.js <json-file> --default coding
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  console.log(`
Convert JSON export to organized markdown files

Usage:
  node convert-json-export.js <json-file>              Interactive mode (ask for each)
  node convert-json-export.js <json-file> --auto       Auto-categorize by keywords
  node convert-json-export.js <json-file> --default    Put all in default category

Options:
  --auto                Auto-categorize using keywords
  --default <category>  Put all in category (ai-general, coding, investing)
  --help               Show this help message

Example:
  node convert-json-export.js ./archived/claude-conversations-export-2026-01-25.json --auto
`);
  process.exit(0);
}

const jsonFile = args[0];
const useAutoMode = args.includes('--auto');
const defaultIndex = args.indexOf('--default');
const defaultCategory = defaultIndex !== -1 ? args[defaultIndex + 1] : null;

if (!fs.existsSync(jsonFile)) {
  console.error(`❌ File not found: ${jsonFile}`);
  process.exit(1);
}

// Read and parse JSON
console.log(`📖 Reading JSON file...`);
let conversations = [];
try {
  const content = fs.readFileSync(jsonFile, 'utf-8');
  conversations = JSON.parse(content);
  console.log(`✅ Loaded ${conversations.length} conversations\n`);
} catch (e) {
  console.error(`❌ Error parsing JSON:`, e.message);
  process.exit(1);
}

// Create output directories
const categories = ['ai-general', 'coding', 'investing'];
const baseDir = path.dirname(jsonFile);

for (const cat of categories) {
  const dir = path.join(baseDir, cat);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
}
console.log('');

// Categorization keywords
const keywords = {
  'coding': ['code', 'function', 'bug', 'fix', 'react', 'javascript', 'typescript', 'python', 'api', 'database', 'git', 'development', 'feature', 'refactor', 'test', 'component', 'framework', 'library', 'node', 'express', 'sql', 'query', 'deploy', 'docker', 'ci/cd'],
  'ai-general': ['ai', 'llm', 'model', 'neural', 'transformer', 'gpt', 'claude', 'machine learning', 'ml', 'nlp', 'research', 'paper', 'architecture', 'training', 'language', 'embedding', 'vector', 'prompt', 'generation'],
  'investing': ['invest', 'portfolio', 'stock', 'crypto', 'fund', 'market', 'financial', 'trading', 'price', 'earnings', 'dividend', 'bond', 'etf', 'bitcoin', 'ethereum', 'analysis', 'return', 'yield', 'strategy']
};

/**
 * Auto-categorize based on keywords in title and content
 */
function categorizeByKeywords(conversation) {
  const text = `${conversation.name} ${extractTextContent(conversation)}`.toLowerCase();

  const scores = {
    'ai-general': 0,
    'coding': 0,
    'investing': 0
  };

  for (const [category, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (text.includes(word)) {
        scores[category]++;
      }
    }
  }

  // Return category with highest score, default to 'coding'
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] > 0 ? sorted[0][0] : 'coding';
}

/**
 * Extract all text content from conversation
 */
function extractTextContent(conversation) {
  let text = '';
  for (const msg of conversation.messages || []) {
    if (msg.text) {
      text += msg.text + ' ';
    } else if (msg.content) {
      for (const block of msg.content) {
        if (block.type === 'text' && block.text) {
          text += block.text + ' ';
        }
      }
    }
  }
  return text.substring(0, 500); // Limit to first 500 chars for speed
}

/**
 * Convert conversation to markdown
 */
function toMarkdown(conversation) {
  let md = `# ${conversation.name}\n\n`;
  md += `**ID**: ${conversation.id}\n`;
  md += `**Created**: ${conversation.created_at}\n`;
  md += `**Updated**: ${conversation.updated_at}\n`;
  if (conversation.model) md += `**Model**: ${conversation.model}\n`;
  md += `\n---\n\n`;

  for (const msg of conversation.messages || []) {
    const role = msg.sender === 'human' ? 'User' : 'Assistant';
    const time = msg.created_at ? new Date(msg.created_at).toLocaleString() : '';

    md += `## ${role}`;
    if (time) md += ` _${time}_`;
    md += `\n\n`;

    if (msg.text && typeof msg.text === 'string') {
      md += msg.text + '\n\n';
    } else if (msg.content) {
      for (const block of msg.content) {
        if (block.type === 'text' && block.text) {
          md += block.text + '\n\n';
        }
      }
    }
  }

  return md;
}

/**
 * Generate filename
 */
function generateFilename(conversation) {
  const date = conversation.created_at?.split('T')[0] || 'unknown';
  const name = conversation.name
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .substring(0, 50)
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${date}-CLAUDE-${name}.md`;
}

/**
 * Interactive mode - ask user for each conversation
 */
async function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (q) => new Promise(resolve => rl.question(q, resolve));

  console.log('📝 Interactive Mode - Categorize Each Conversation\n');

  let saved = 0;

  for (let i = 0; i < conversations.length; i++) {
    const conv = conversations[i];
    console.log(`\n[${i + 1}/${conversations.length}] ${conv.name}`);
    console.log(`   Created: ${conv.created_at?.split('T')[0] || 'unknown'}`);

    const preview = extractTextContent(conv).substring(0, 100) + '...';
    console.log(`   Preview: ${preview}\n`);

    let category = null;
    while (!category) {
      const ans = await question('Category? (1=coding, 2=ai-general, 3=investing, s=skip): ');
      if (ans === '1') category = 'coding';
      else if (ans === '2') category = 'ai-general';
      else if (ans === '3') category = 'investing';
      else if (ans === 's') break;
    }

    if (!category) continue;

    const markdown = toMarkdown(conv);
    const filename = generateFilename(conv);
    const outputPath = path.join(baseDir, category, filename);

    fs.writeFileSync(outputPath, markdown);
    console.log(`   ✅ Saved to ${category}/${filename}`);
    saved++;
  }

  rl.close();
  console.log(`\n✅ Done! Saved ${saved} conversations`);
}

/**
 * Auto-categorize mode
 */
function autoMode() {
  console.log('🤖 Auto-Categorizing Conversations...\n');

  const categorized = {
    'ai-general': [],
    'coding': [],
    'investing': []
  };

  for (let i = 0; i < conversations.length; i++) {
    const conv = conversations[i];
    const category = categorizeByKeywords(conv);
    categorized[category].push(conv);

    const markdown = toMarkdown(conv);
    const filename = generateFilename(conv);
    const outputPath = path.join(baseDir, category, filename);

    fs.writeFileSync(outputPath, markdown);

    console.log(`[${i + 1}/${conversations.length}] ${category.padEnd(12)} | ${conv.name}`);
  }

  console.log(`\n✅ Distribution:`);
  for (const [cat, convs] of Object.entries(categorized)) {
    console.log(`   ${cat.padEnd(12)}: ${convs.length} conversations`);
  }
}

/**
 * Default category mode
 */
function defaultMode(category) {
  if (!categories.includes(category)) {
    console.error(`❌ Invalid category: ${category}`);
    console.error(`   Valid options: ${categories.join(', ')}`);
    process.exit(1);
  }

  console.log(`📦 Saving all conversations to: ${category}\n`);

  for (let i = 0; i < conversations.length; i++) {
    const conv = conversations[i];
    const markdown = toMarkdown(conv);
    const filename = generateFilename(conv);
    const outputPath = path.join(baseDir, category, filename);

    fs.writeFileSync(outputPath, markdown);
    console.log(`[${i + 1}/${conversations.length}] ${filename}`);
  }

  console.log(`\n✅ Saved ${conversations.length} conversations to ${category}/`);
}

// Run
if (defaultCategory) {
  defaultMode(defaultCategory);
} else if (useAutoMode) {
  autoMode();
} else {
  interactiveMode();
}
