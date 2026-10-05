/**
 * Generates the responsive single-page HTML Web Dashboard served to PC browsers over Wi-Fi.
 * Includes "Download All Files" (Direct & ZIP Archive) capabilities.
 */
export function getWebDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AirDropX — PC Web Transfer</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <style>
    body { background-color: #090d10; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .glass-card { background: rgba(20, 30, 36, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(31, 45, 54, 0.9); }
    .glass-nav { background: rgba(12, 19, 24, 0.95); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(31, 45, 54, 0.9); }
    .teal-glow { box-shadow: 0 0 25px rgba(13, 130, 116, 0.2); }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0c1318; }
    ::-webkit-scrollbar-thumb { background: #1f2d36; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #0d8274; }
  </style>
</head>
<body class="min-h-screen flex flex-col">
  <!-- Top Navigation Header -->
  <header class="sticky top-0 z-50 glass-nav px-6 py-4 flex items-center justify-between shadow-xl">
    <div class="flex items-center space-x-3.5">
      <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0d8274] to-[#10b981] flex items-center justify-center text-white font-black text-xl shadow-lg">
        <i class="fa-solid fa-wifi"></i>
      </div>
      <div>
        <h1 class="text-lg font-extrabold text-white tracking-wide">AirDropX Web Transfer</h1>
        <p class="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Connected via Local Wi-Fi (No Internet Required)
        </p>
      </div>
    </div>
    <div class="flex items-center gap-2.5">
      <button onclick="loadFiles()" class="px-3.5 py-2 rounded-xl bg-[#141e24] hover:bg-[#1f2d36] border border-[#1f2d36] text-xs font-semibold text-slate-200 transition flex items-center gap-2">
        <i class="fa-solid fa-rotate-right"></i> Refresh
      </button>
      <button onclick="downloadAllDirect()" class="px-3.5 py-2 rounded-xl bg-[#141e24] hover:bg-[#1f2d36] border border-[#0d8274]/40 text-xs font-semibold text-emerald-400 transition flex items-center gap-2">
        <i class="fa-solid fa-file-arrow-down"></i> Download All (Individual)
      </button>
      <button id="downloadZipBtn" onclick="downloadAllZip()" class="px-4 py-2 rounded-xl bg-[#0d8274] hover:bg-[#10b981] text-xs font-bold text-white shadow-lg transition flex items-center gap-2">
        <i class="fa-solid fa-file-zipper"></i> Download All as ZIP
      </button>
    </div>
  </header>

  <!-- Main Web Content -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
    <!-- Device Summary Banner -->
    <div class="glass-card rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 teal-glow">
      <div class="flex items-center space-x-4">
        <div class="w-14 h-14 rounded-2xl bg-[#0d8274]/20 border border-[#0d8274]/40 flex items-center justify-center text-[#10b981] text-2xl">
          <i class="fa-solid fa-mobile-screen-button"></i>
        </div>
        <div>
          <h2 class="text-xl font-bold text-white">Android Device Storage</h2>
          <p class="text-xs text-slate-400 mt-1">Browse, preview, and download files directly from your phone</p>
        </div>
      </div>
      <div class="flex items-center gap-8">
        <div class="text-center">
          <span id="totalFilesCount" class="text-2xl font-black text-emerald-400">0</span>
          <p class="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Shared Files</p>
        </div>
        <div class="w-px h-10 bg-[#1f2d36]"></div>
        <div class="text-center">
          <span id="totalSizeText" class="text-2xl font-black text-white">0 MB</span>
          <p class="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Total Size</p>
        </div>
      </div>
    </div>

    <!-- Search & Category Filters -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="relative w-full md:w-96">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-slate-400 text-sm"></i>
        <input id="searchInput" oninput="renderFiles()" type="text" placeholder="Search shared files..." class="w-full bg-[#141e24] border border-[#1f2d36] rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0d8274]">
      </div>

      <div class="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
        <button onclick="setCategory('all', event)" class="cat-pill active px-4 py-2 rounded-xl text-xs font-bold bg-[#0d8274] text-white transition">All Files</button>
        <button onclick="setCategory('images', event)" class="cat-pill px-4 py-2 rounded-xl text-xs font-bold bg-[#141e24] border border-[#1f2d36] text-slate-300 hover:border-[#0d8274] transition">Images</button>
        <button onclick="setCategory('videos', event)" class="cat-pill px-4 py-2 rounded-xl text-xs font-bold bg-[#141e24] border border-[#1f2d36] text-slate-300 hover:border-[#0d8274] transition">Videos</button>
        <button onclick="setCategory('audio', event)" class="cat-pill px-4 py-2 rounded-xl text-xs font-bold bg-[#141e24] border border-[#1f2d36] text-slate-300 hover:border-[#0d8274] transition">Audio</button>
        <button onclick="setCategory('docs', event)" class="cat-pill px-4 py-2 rounded-xl text-xs font-bold bg-[#141e24] border border-[#1f2d36] text-slate-300 hover:border-[#0d8274] transition">Documents</button>
      </div>
    </div>

    <!-- File Grid -->
    <div id="fileGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"></div>

    <!-- Empty State -->
    <div id="emptyState" class="hidden glass-card rounded-3xl p-12 text-center">
      <div class="w-16 h-16 rounded-full bg-[#141e24] border border-[#1f2d36] flex items-center justify-center mx-auto text-slate-500 text-2xl mb-4">
        <i class="fa-regular fa-folder-open"></i>
      </div>
      <h3 class="text-lg font-bold text-white">No Shared Files Found</h3>
      <p class="text-xs text-slate-400 mt-1">Select files in your Android phone to share them with your PC browser.</p>
    </div>
  </main>

  <footer class="border-t border-[#1f2d36] py-6 text-center text-xs text-slate-500">
    AirDropX Local Wi-Fi Web Transfer &bull; Powered by React Native Static Server & Expo Network
  </footer>

  <script>
    let allFiles = [];
    let currentCategory = 'all';

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
        const res = await fetch('/api/files');
        const data = await res.json();
        if (data.success && Array.isArray(data.files)) {
          allFiles = data.files.filter(f => f.name !== 'index.html' && f.name !== 'sample-file.txt');
          updateStats();
          renderFiles();
        }
      } catch (err) {
        console.error('Failed to load files:', err);
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
        const downloadUrl = file.url || \`/download/\${encodeURIComponent(file.path)}\`;
        const ext = (file.ext || '').toLowerCase();
        const mime = (file.mime || '').toLowerCase();
        const isImage = mime.startsWith('image/') || ['jpg', 'png', 'jpeg', 'gif', 'webp'].includes(ext);

        const card = document.createElement('div');
        card.className = 'glass-card rounded-2xl p-4 flex flex-col justify-between hover:border-[#0d8274]/60 transition duration-200 group';

        card.innerHTML = \`
          <div>
            \${isImage ? \`
              <div class="w-full h-36 rounded-xl overflow-hidden mb-3 bg-[#0c1318] border border-[#1f2d36] flex items-center justify-center">
                <img src="/\${encodeURIComponent(file.path)}" alt="\${file.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <div class="hidden w-full h-full flex items-center justify-center \${iconInfo.bg} \${iconInfo.color}">
                  <i class="fa-solid \${iconInfo.icon} text-3xl"></i>
                </div>
              </div>
            \` : \`
              <div class="w-full h-28 rounded-xl \${iconInfo.bg} border border-[#1f2d36] flex items-center justify-center mb-3">
                <i class="fa-solid \${iconInfo.icon} \${iconInfo.color} text-4xl"></i>
              </div>
            \`}
            <h3 class="font-bold text-xs text-slate-100 truncate" title="\${file.name}">\${file.name}</h3>
            <p class="text-[11px] text-slate-400 mt-1 font-medium">\${formatBytes(file.size)}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-[#1f2d36]/60 flex items-center justify-between">
            <a href="\${downloadUrl}" download="\${file.name}" class="w-full py-2.5 rounded-xl bg-[#0d8274] hover:bg-[#10b981] text-xs text-white font-bold text-center transition flex items-center justify-center gap-2">
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
          const fileUrl = file.url || \`/\${encodeURIComponent(file.path)}\`;
          const response = await fetch(fileUrl);
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
          a.href = file.url || \`/download/\${encodeURIComponent(file.path)}\`;
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
