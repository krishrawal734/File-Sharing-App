export function getWebDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="referrer" content="no-referrer">
  <title>AirDropX — PC Web Transfer</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <style>
    body { background-color: #090d10; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .glass-card { background: rgba(20, 30, 36, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(31, 45, 54, 0.9); }
    .glass-nav { background: rgba(12, 19, 24, 0.95); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(31, 45, 54, 0.9); }
    .teal-glow { box-shadow: 0 0 25px rgba(13, 130, 116, 0.2); }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #0c1318; }
    ::-webkit-scrollbar-thumb { background: #1f2d36; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #0d8274; }
  </style>
</head>
<body class="min-h-screen flex flex-col antialiased selection:bg-[#0d8274] selection:text-white">
  <!-- Top Responsive Header Navigation -->
  <header class="sticky top-0 z-50 glass-nav px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl">
    <div class="flex items-center space-x-3">
      <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#0d8274] to-[#10b981] flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg shrink-0">
        <i class="fa-solid fa-wifi"></i>
      </div>
      <div class="min-w-0 flex-1">
        <h1 class="text-base sm:text-lg font-extrabold text-white tracking-wide truncate">AirDropX Web Transfer</h1>
        <p class="text-[11px] sm:text-xs text-emerald-400 flex items-center gap-1.5 font-medium truncate">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          Connected via Local Wi-Fi
        </p>
      </div>
    </div>

    <!-- Actions Header Buttons -->
    <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 sm:pt-0">
      <button id="refreshBtn" onclick="refreshAndClearFiles()" class="px-3.5 py-2 rounded-xl bg-[#141e24] hover:bg-[#1f2d36] border border-[#1f2d36] text-xs font-semibold text-slate-200 transition flex items-center gap-2 whitespace-nowrap shrink-0" title="Clear current shared files and refresh view">
        <i id="refreshIcon" class="fa-solid fa-rotate-right"></i>
        <span>Refresh & Clear</span>
      </button>
      <button onclick="downloadAllDirect()" class="px-3.5 py-2 rounded-xl bg-[#141e24] hover:bg-[#1f2d36] border border-[#0d8274]/40 text-xs font-semibold text-emerald-400 transition flex items-center gap-2 whitespace-nowrap shrink-0">
        <i class="fa-solid fa-file-arrow-down"></i>
        <span class="hidden md:inline">Download All</span> (Direct)
      </button>
      <button id="downloadZipBtn" onclick="downloadAllZip()" class="px-3.5 py-2 rounded-xl bg-[#0d8274] hover:bg-[#10b981] text-xs font-bold text-white shadow-lg transition flex items-center gap-2 whitespace-nowrap shrink-0">
        <i class="fa-solid fa-file-zipper"></i>
        <span>Download ZIP</span>
      </button>
    </div>
  </header>

  <!-- Main Web Content Wrapper -->
  <main class="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    <!-- Responsive Device Summary Banner -->
    <div class="glass-card rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 teal-glow">
      <div class="flex items-center space-x-3.5 sm:space-x-4">
        <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#0d8274]/20 border border-[#0d8274]/40 flex items-center justify-center text-[#10b981] text-xl sm:text-2xl shrink-0">
          <i class="fa-solid fa-mobile-screen-button"></i>
        </div>
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-white leading-tight">Device Shared Storage</h2>
          <p class="text-xs text-slate-400 mt-0.5">Browse, search, preview, and download shared files</p>
        </div>
      </div>

      <!-- Stats Counters -->
      <div class="grid grid-cols-2 sm:flex items-center gap-4 sm:gap-8 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#1f2d36]">
        <div class="text-center bg-[#0c1318]/50 sm:bg-transparent p-2.5 sm:p-0 rounded-2xl">
          <span id="totalFilesCount" class="text-xl sm:text-2xl font-black text-emerald-400">0</span>
          <p class="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 font-bold">Shared Files</p>
        </div>
        <div class="hidden sm:block w-px h-10 bg-[#1f2d36]"></div>
        <div class="text-center bg-[#0c1318]/50 sm:bg-transparent p-2.5 sm:p-0 rounded-2xl">
          <span id="totalSizeText" class="text-xl sm:text-2xl font-black text-white">0 MB</span>
          <p class="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 font-bold">Total Size</p>
        </div>
      </div>
    </div>

    <!-- Responsive Search Bar & Category Filters -->
    <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
      <!-- Search Input -->
      <div class="relative w-full lg:w-96">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-slate-400 text-sm"></i>
        <input id="searchInput" oninput="renderFiles()" type="text" placeholder="Search shared files..." class="w-full bg-[#141e24] border border-[#1f2d36] rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0d8274] transition">
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button onclick="setCategory('all', event)" class="cat-pill active px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0d8274] text-white transition whitespace-nowrap shrink-0">All Files</button>
        <button onclick="setCategory('images', event)" class="cat-pill px-3.5 py-2 rounded-xl text-xs font-bold bg-[#141e24] border border-[#1f2d36] text-slate-300 hover:border-[#0d8274] transition whitespace-nowrap shrink-0">Images</button>
        <button onclick="setCategory('videos', event)" class="cat-pill px-3.5 py-2 rounded-xl text-xs font-bold bg-[#141e24] border border-[#1f2d36] text-slate-300 hover:border-[#0d8274] transition whitespace-nowrap shrink-0">Videos</button>
        <button onclick="setCategory('audio', event)" class="cat-pill px-3.5 py-2 rounded-xl text-xs font-bold bg-[#141e24] border border-[#1f2d36] text-slate-300 hover:border-[#0d8274] transition whitespace-nowrap shrink-0">Audio</button>
        <button onclick="setCategory('docs', event)" class="cat-pill px-3.5 py-2 rounded-xl text-xs font-bold bg-[#141e24] border border-[#1f2d36] text-slate-300 hover:border-[#0d8274] transition whitespace-nowrap shrink-0">Documents</button>
      </div>
    </div>

    <!-- Responsive File Grid -->
    <div id="fileGrid" class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5"></div>

    <!-- Empty State Component -->
    <div id="emptyState" class="hidden glass-card rounded-3xl p-8 sm:p-12 text-center">
      <div class="w-16 h-16 rounded-full bg-[#141e24] border border-[#1f2d36] flex items-center justify-center mx-auto text-slate-500 text-2xl mb-4">
        <i class="fa-regular fa-folder-open"></i>
      </div>
      <h3 class="text-lg font-bold text-white">No Shared Files Found</h3>
      <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">Select files on your mobile app to make them visible and downloadable in this PC browser.</p>
    </div>
  </main>

  <!-- Footer -->
  <footer class="border-t border-[#1f2d36] py-5 text-center text-xs text-slate-500 px-4">
    AirDropX Local Wi-Fi Web Transfer &copy; 2026 — All Rights Reserved
  </footer>

  <script>
    let allFiles = [];
    let currentCategory = 'all';

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      })[char]);
    }

    function formatBytes(bytes) {
      if (!bytes || bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function getFileIcon(ext, mime) {
      ext = (ext || '').toLowerCase();
      mime = (mime || '').toLowerCase();

      if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
        return { icon: 'fa-image', color: 'text-amber-400', bg: 'bg-amber-400/10' };
      }
      if (mime.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
        return { icon: 'fa-film', color: 'text-purple-400', bg: 'bg-purple-400/10' };
      }
      if (mime.startsWith('audio/') || ['mp3', 'wav', 'aac', 'm4a', 'flac'].includes(ext)) {
        return { icon: 'fa-music', color: 'text-rose-400', bg: 'bg-rose-400/10' };
      }
      if (['pdf', 'doc', 'docx', 'txt', 'csv', 'json'].includes(ext)) {
        return { icon: 'fa-file-lines', color: 'text-blue-400', bg: 'bg-blue-400/10' };
      }
      return { icon: 'fa-file', color: 'text-teal-400', bg: 'bg-teal-400/10' };
    }

    async function loadFiles() {
      try {
        const res = await fetch('files.json?t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          const rawList = Array.isArray(data) ? data : (data && Array.isArray(data.files) ? data.files : []);
          const clearedAt = parseInt(localStorage.getItem('airdropx_cleared_at') || '0', 10);

          allFiles = rawList.filter(f => {
            if (f.name === 'index.html' || f.name === 'files.json' || f.name === 'sample-file.txt' || (f.path || '').startsWith('airdropx')) {
              return false;
            }
            if (clearedAt > 0 && f.addedAt && f.addedAt <= clearedAt) {
              return false;
            }
            return true;
          });
          updateStats();
          renderFiles();
        }
      } catch (err) {
        console.warn('Could not fetch files.json:', err);
      }
    }

    async function refreshAndClearFiles() {
      const refreshIcon = document.getElementById('refreshIcon');
      if (refreshIcon) refreshIcon.classList.add('fa-spin');

      // Record current clear timestamp
      localStorage.setItem('airdropx_cleared_at', Date.now().toString());

      // Instantly clear current file list
      allFiles = [];
      updateStats();
      renderFiles();

      // Check for any newly shared files
      await loadFiles();

      if (refreshIcon) {
        setTimeout(() => refreshIcon.classList.remove('fa-spin'), 600);
      }
    }

    function updateStats() {
      document.getElementById('totalFilesCount').innerText = allFiles.length;
      const totalBytes = allFiles.reduce((acc, f) => acc + (f.size || 0), 0);
      document.getElementById('totalSizeText').innerText = formatBytes(totalBytes);
    }

    function setCategory(cat, ev) {
      currentCategory = cat;
      document.querySelectorAll('.cat-pill').forEach(btn => {
        btn.classList.remove('bg-[#0d8274]', 'text-white');
        btn.classList.add('bg-[#141e24]', 'text-slate-300');
      });
      ev.target.classList.remove('bg-[#141e24]', 'text-slate-300');
      ev.target.classList.add('bg-[#0d8274]', 'text-white');
      renderFiles();
    }

    function renderFiles() {
      const search = document.getElementById('searchInput').value.toLowerCase();
      const grid = document.getElementById('fileGrid');
      const empty = document.getElementById('emptyState');
      grid.innerHTML = '';

      const filtered = allFiles.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(search);
        if (!matchesSearch) return false;

        const ext = (file.ext || '').toLowerCase();
        const mime = (file.mime || '').toLowerCase();

        if (currentCategory === 'images') return mime.startsWith('image/') || ['jpg','jpeg','png','gif','webp'].includes(ext);
        if (currentCategory === 'videos') return mime.startsWith('video/') || ['mp4','mov','avi','mkv'].includes(ext);
        if (currentCategory === 'audio') return mime.startsWith('audio/') || ['mp3','wav','m4a'].includes(ext);
        if (currentCategory === 'docs') return ['pdf','doc','docx','txt','json'].includes(ext);
        return true;
      });

      if (filtered.length === 0) {
        grid.classList.add('hidden');
        empty.classList.remove('hidden');
        return;
      }

      grid.classList.remove('hidden');
      empty.classList.add('hidden');

      filtered.forEach(file => {
        const iconInfo = getFileIcon(file.ext, file.mime);
        const downloadUrl = encodeURIComponent(file.name);
        const ext = (file.ext || '').toLowerCase();
        const mime = (file.mime || '').toLowerCase();
        const isImage = mime.startsWith('image/') || ['jpg', 'png', 'jpeg', 'gif', 'webp'].includes(ext);

        const card = document.createElement('div');
        card.className = 'glass-card rounded-2xl p-4 flex flex-col justify-between hover:border-[#0d8274]/60 transition duration-200 group';

        card.innerHTML = \`
          <div>
            \${isImage ? \`
              <div class="w-full h-36 rounded-xl overflow-hidden mb-3 bg-[#0c1318] border border-[#1f2d36] flex items-center justify-center">
                <img src="\${downloadUrl}" alt="\${escapeHtml(file.name)}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <div class="hidden w-full h-full flex items-center justify-center \${iconInfo.bg} \${iconInfo.color}">
                  <i class="fa-solid \${iconInfo.icon} text-3xl"></i>
                </div>
              </div>
            \` : \`
              <div class="w-full h-28 rounded-xl \${iconInfo.bg} border border-[#1f2d36] flex items-center justify-center mb-3">
                <i class="fa-solid \${iconInfo.icon} \${iconInfo.color} text-3xl sm:text-4xl"></i>
              </div>
            \`}
            <h3 class="font-bold text-xs text-slate-100 truncate" title="\${escapeHtml(file.name)}">\${escapeHtml(file.name)}</h3>
            <p class="text-[11px] text-slate-400 mt-1 font-medium">\${formatBytes(file.size)}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-[#1f2d36]/60 flex items-center justify-between">
            <a href="\${downloadUrl}" download="\${escapeHtml(file.name)}" class="w-full py-2.5 rounded-xl bg-[#0d8274] hover:bg-[#10b981] text-xs text-white font-bold text-center transition flex items-center justify-center gap-2">
              <i class="fa-solid fa-download"></i> Download File
            </a>
          </div>
        \`;
        grid.appendChild(card);
      });
    }

    async function downloadAllZip() {
      if (!allFiles || allFiles.length === 0) {
        alert("No files available to download.");
        return;
      }

      const btn = document.getElementById('downloadZipBtn');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.classList.add('opacity-70', 'cursor-not-allowed');

      try {
        const zip = new JSZip();
        let completed = 0;

        for (const file of allFiles) {
          btn.innerHTML = \`<i class="fa-solid fa-spinner fa-spin"></i> Zipping (\${completed + 1}/\${allFiles.length})...\`;
          const fileUrl = encodeURIComponent(file.name);
          const response = await fetch(fileUrl);
          if (!response.ok) throw new Error('Download failed: ' + response.status);
          const blob = await response.blob();
          zip.file(file.name, blob);
          completed++;
        }

        btn.innerHTML = \`<i class="fa-solid fa-spinner fa-spin"></i> Generating Archive...\`;
        const zipBlob = await zip.generateAsync({ type: "blob" });

        const a = document.createElement('a');
        a.href = URL.createObjectURL(zipBlob);
        a.download = \`AirDropX_Files_\${new Date().toISOString().slice(0, 10)}.zip\`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.error("ZIP creation failed:", err);
        alert("Failed to generate ZIP archive. Triggering individual file downloads instead.");
        downloadAllDirect();
      } finally {
        btn.disabled = false;
        btn.classList.remove('opacity-70', 'cursor-not-allowed');
        btn.innerHTML = originalText;
      }
    }

    function downloadAllDirect() {
      if (!allFiles || allFiles.length === 0) {
        alert("No files available to download.");
        return;
      }

      allFiles.forEach((file, index) => {
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = encodeURIComponent(file.name);
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, index * 350);
      });
    }

    document.addEventListener('DOMContentLoaded', loadFiles);
  </script>
</body>
</html>`;
}
