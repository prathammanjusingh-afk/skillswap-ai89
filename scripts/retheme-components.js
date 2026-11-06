const fs = require('fs');
const path = require('path');

const replacements = [
  // Backgrounds
  { from: /bg-navy-950/g, to: 'bg-gray-950' },
  { from: /bg-navy-900/g, to: 'bg-gray-900' },
  { from: /bg-navy-850/g, to: 'bg-gray-850' },
  { from: /bg-navy-800/g, to: 'bg-gray-800' },
  { from: /bg-navy-750/g, to: 'bg-gray-750' },
  { from: /hover:bg-navy-900/g, to: 'hover:bg-gray-800' },
  { from: /hover:bg-navy-850/g, to: 'hover:bg-gray-800' },
  { from: /hover:bg-navy-800/g, to: 'hover:bg-gray-750' },

  // Borders
  { from: /border-slate-800\/80/g, to: 'border-gray-800' },
  { from: /border-slate-800/g, to: 'border-gray-800' },
  { from: /border-slate-700\/60/g, to: 'border-gray-700/60' },
  { from: /border-slate-700/g, to: 'border-gray-700' },
  { from: /hover:border-slate-700/g, to: 'hover:border-gray-700' },

  // Text
  { from: /text-slate-400/g, to: 'text-gray-400' },
  { from: /text-slate-300/g, to: 'text-gray-300' },
  { from: /text-slate-200/g, to: 'text-gray-200' },
  { from: /text-slate-500/g, to: 'text-gray-500' },

  // Cyan to Purple Accents
  { from: /text-cyan-400/g, to: 'text-purple-400' },
  { from: /text-cyan-300/g, to: 'text-purple-300' },
  { from: /text-cyan-200/g, to: 'text-purple-200' },
  { from: /hover:text-cyan-300/g, to: 'hover:text-purple-300' },
  { from: /hover:text-cyan-400/g, to: 'hover:text-purple-400' },
  { from: /bg-cyan-500\/10/g, to: 'bg-purple-600/10' },
  { from: /bg-cyan-500\/15/g, to: 'bg-purple-600/15' },
  { from: /bg-cyan-500\/20/g, to: 'bg-purple-600/20' },
  { from: /bg-cyan-500\/25/g, to: 'bg-purple-600/25' },
  { from: /border-cyan-500\/30/g, to: 'border-purple-500/30' },
  { from: /border-cyan-500\/40/g, to: 'border-purple-500/40' },
  { from: /border-cyan-500\/50/g, to: 'border-purple-500/50' },
  { from: /hover:border-cyan-500\/40/g, to: 'hover:border-purple-500/40' },
  { from: /hover:border-cyan-400/g, to: 'hover:border-purple-400' },
  { from: /accent-cyan-400/g, to: 'accent-purple-500' },
  { from: /focus:border-cyan-500/g, to: 'focus:border-purple-500' },
  { from: /focus:border-cyan-400/g, to: 'focus:border-purple-500' },
  { from: /focus-visible:ring-cyan-500/g, to: 'focus-visible:ring-purple-500' },

  // Button variants
  { from: /variant="glow"/g, to: 'variant="purple"' },
];

const targetFiles = [
  'src/components/projects/ProjectDetailModal.tsx',
  'src/components/workspace/CollabHub.tsx',
  'src/components/sessions/SessionsManager.tsx',
  'src/components/sessions/SessionSchedulerModal.tsx',
  'src/components/messaging/DirectMessagingHub.tsx',
  'src/components/profile/SkillProfileEditor.tsx',
  'src/components/profile/ProfilePrivacyToggle.tsx',
  'src/components/admin/AdminDashboard.tsx',
  'src/components/reviews/ReviewModal.tsx',
  'src/components/notifications/NotificationDropdown.tsx',
];

targetFiles.forEach((relPath) => {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) {
    console.log('Skipping missing:', relPath);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  replacements.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Rethemed:', relPath);
});
