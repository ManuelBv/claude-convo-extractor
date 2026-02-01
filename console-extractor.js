// ============================================
// Claude.ai Conversation Extractor
// Paste this ENTIRE script into Chrome DevTools Console (F12 > Console)
// while on claude.ai
// ============================================

(async function extractConversations() {
  console.log('🚀 Claude Conversation Extractor Started');

  // Get organization ID from the page
  const orgMatch = window.location.pathname.match(/\/organization\/([^\/]+)/) ||
                   document.cookie.match(/lastActiveOrg=([^;]+)/);

  let orgId = null;

  // Try to find org ID from API calls or page state
  try {
    const meResponse = await fetch('https://claude.ai/api/auth/session');
    const meData = await meResponse.json();
    orgId = meData?.account?.memberships?.[0]?.organization?.uuid;
  } catch (e) {
    console.log('Could not get org from session, trying alternative...');
  }

  if (!orgId) {
    // Try to extract from page
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const match = script.textContent?.match(/"organization_uuid":"([^"]+)"/);
      if (match) {
        orgId = match[1];
        break;
      }
    }
  }

  if (!orgId) {
    // Last resort - prompt user
    orgId = prompt('Could not detect organization ID. Please enter it (check Network tab for /api/organizations/[ID]/):');
  }

  if (!orgId) {
    console.error('❌ No organization ID found. Aborting.');
    return;
  }

  console.log(`📁 Organization ID: ${orgId}`);

  // Fetch all conversations
  console.log('📋 Fetching conversation list...');

  let allConversations = [];
  const seenUuids = new Set();
  let cursor = null;
  let pageCount = 0;
  const MAX_PAGES = 100; // Safety limit: 100 pages * 50 = 5000 max conversations

  do {
    const url = cursor
      ? `https://claude.ai/api/organizations/${orgId}/chat_conversations?limit=50&after_uuid=${cursor}`
      : `https://claude.ai/api/organizations/${orgId}/chat_conversations?limit=50`;

    const response = await fetch(url);
    const data = await response.json();
    pageCount++;

    if (Array.isArray(data) && data.length > 0) {
      // Filter out duplicates
      let newCount = 0;
      for (const conv of data) {
        if (!seenUuids.has(conv.uuid)) {
          seenUuids.add(conv.uuid);
          allConversations.push(conv);
          newCount++;
        }
      }

      // If we got no new conversations, we've hit a loop
      if (newCount === 0) {
        console.log('  ⚠️ Detected duplicate page, stopping pagination.');
        break;
      }

      cursor = data[data.length - 1]?.uuid;
      console.log(`  Page ${pageCount}: +${newCount} new (${allConversations.length} total)`);

      // Safety check
      if (pageCount >= MAX_PAGES) {
        console.log(`  ⚠️ Hit max page limit (${MAX_PAGES}), stopping.`);
        break;
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
    } else {
      cursor = null;
    }
  } while (cursor);

  console.log(`✅ Found ${allConversations.length} total conversations`);

  // Show conversation list for selection
  console.log('\n📝 Conversations:');
  allConversations.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name} (${c.created_at?.split('T')[0] || 'unknown date'})`);
  });

  // Ask which to export
  const selection = prompt(
    `Enter conversation numbers to export (e.g., "1,2,5" or "all" or "1-10"):\n\n` +
    `Total: ${allConversations.length} conversations`
  );

  if (!selection) {
    console.log('❌ No selection made. Aborting.');
    return;
  }

  let selectedIndices = [];
  if (selection.toLowerCase() === 'all') {
    selectedIndices = allConversations.map((_, i) => i);
  } else if (selection.includes('-')) {
    const [start, end] = selection.split('-').map(n => parseInt(n.trim()) - 1);
    for (let i = start; i <= end && i < allConversations.length; i++) {
      selectedIndices.push(i);
    }
  } else {
    selectedIndices = selection.split(',').map(n => parseInt(n.trim()) - 1);
  }

  console.log(`\n📥 Exporting ${selectedIndices.length} conversations...`);

  // Fetch full content for selected conversations
  const exportData = [];

  for (const idx of selectedIndices) {
    const conv = allConversations[idx];
    if (!conv) continue;

    console.log(`  Fetching: ${conv.name}...`);

    try {
      const url = `https://claude.ai/api/organizations/${orgId}/chat_conversations/${conv.uuid}?tree=True&rendering_mode=messages`;
      const response = await fetch(url);
      const fullConv = await response.json();

      exportData.push({
        id: conv.uuid,
        name: conv.name,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        model: fullConv.model,
        messages: fullConv.chat_messages || []
      });

      // Rate limiting
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.error(`  ❌ Error fetching ${conv.name}:`, e.message);
    }
  }

  console.log(`\n✅ Fetched ${exportData.length} conversations`);

  // Convert to markdown
  const markdownFiles = exportData.map(conv => {
    let md = `# ${conv.name}\n\n`;
    md += `**ID**: ${conv.id}\n`;
    md += `**Created**: ${conv.created_at}\n`;
    md += `**Updated**: ${conv.updated_at}\n`;
    if (conv.model) md += `**Model**: ${conv.model}\n`;
    md += `\n---\n\n`;

    for (const msg of conv.messages || []) {
      const role = msg.sender === 'human' ? 'User' : 'Assistant';
      const time = msg.created_at ? new Date(msg.created_at).toLocaleString() : '';

      md += `## ${role}`;
      if (time) md += ` _${time}_`;
      md += `\n\n`;

      if (typeof msg.text === 'string') {
        md += msg.text + '\n\n';
      } else if (msg.content) {
        for (const block of msg.content) {
          if (block.type === 'text') {
            md += block.text + '\n\n';
          }
        }
      }
    }

    return {
      filename: `${conv.created_at?.split('T')[0] || 'unknown'}-CLAUDE-${conv.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 50)}.md`,
      content: md
    };
  });

  // Download as files
  console.log('\n📦 Downloading files...');

  for (const file of markdownFiles) {
    const blob = new Blob([file.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    a.click();
    URL.revokeObjectURL(url);
    await new Promise(r => setTimeout(r, 100));
  }

  // Also download as single JSON for backup
  const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const jsonUrl = URL.createObjectURL(jsonBlob);
  const jsonLink = document.createElement('a');
  jsonLink.href = jsonUrl;
  jsonLink.download = `claude-conversations-export-${new Date().toISOString().split('T')[0]}.json`;
  jsonLink.click();
  URL.revokeObjectURL(jsonUrl);

  console.log('\n✅ Done! Check your Downloads folder.');
  console.log(`   Exported ${markdownFiles.length} markdown files + 1 JSON backup`);

})();
