// ============================================================
// VoteNow - Server Voting/Polling Real-Time
// UAS Client Server Programming - Pilihan 7
// Nama : Labib Althaf
// NIM  : 23343042
// Prodi: Informatika - Universitas Negeri Padang
// Stack: Node.js + Express + Socket.IO (in-memory storage)
// ============================================================

const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const MAX_OPTIONS = 10; // batas maksimal pilihan polling

// Serve file statis dari folder public/
app.use(express.static(path.join(__dirname, 'public')));

// ------------------------------------------------------------
// STATE POLLING (in-memory, tidak pakai database)
// ------------------------------------------------------------
// poll = {
//   question: string,
//   options: string[],            // daftar opsi
//   results: { [option]: number } // tally suara per opsi
// }
let poll = null;          // null = belum ada polling dibuat
let isClosed = false;      // true = polling sudah ditutup admin
const voters = new Set();  // kumpulan socket.id yang sudah memilih

// Bentuk objek "state" yang dikirim ke client baru saat connect
function buildState() {
  return {
    poll,                 // null jika belum ada polling
    isClosed,             // status tutup
    totalVotes: voters.size,
  };
}

// Helper: reset hasil tally menjadi 0 untuk semua opsi
function emptyResults(options) {
  const r = {};
  options.forEach((opt) => { r[opt] = 0; });
  return r;
}

// ------------------------------------------------------------
// SOCKET.IO HANDLERS
// ------------------------------------------------------------
io.on('connection', (socket) => {
  console.log(`[connect]    ${socket.id} (total client: ${io.engine.clientsCount})`);

  // Saat client baru connect, langsung kirim state polling aktif (jika ada)
  socket.emit('current_state', buildState());

  // --- ADMIN: membuat polling baru ---------------------------
  socket.on('create_poll', (data = {}) => {
    const question = (data.question || '').toString().trim();
    // Bersihkan opsi: buang yang kosong, trim spasi
    const options = Array.isArray(data.options)
      ? data.options.map((o) => (o || '').toString().trim()).filter((o) => o.length > 0)
      : [];

    // Validasi: butuh pertanyaan + minimal 2 opsi
    if (!question || options.length < 2) {
      socket.emit('error_msg', {
        message: 'Pertanyaan dan minimal 2 opsi wajib diisi.',
      });
      return;
    }

    // Validasi: maksimal MAX_OPTIONS opsi
    if (options.length > MAX_OPTIONS) {
      socket.emit('error_msg', {
        message: `Maksimal ${MAX_OPTIONS} opsi.`,
      });
      return;
    }

    // Hilangkan opsi duplikat (mis. dua opsi bernama sama)
    const unique = [...new Set(options)];
    if (unique.length < 2) {
      socket.emit('error_msg', {
        message: 'Opsi tidak boleh sama, minimal 2 opsi berbeda.',
      });
      return;
    }
    options.length = 0;
    options.push(...unique);

    // Buat polling baru, reset semua state voting
    poll = { question, options, results: emptyResults(options) };
    isClosed = false;
    voters.clear();

    console.log(`[create_poll] "${question}" | opsi: ${options.join(', ')}`);

    // Broadcast polling baru ke SEMUA client (voter & admin)
    io.emit('poll_created', { question, options });
    // Sekaligus kirim hasil awal (semua 0) supaya bar langsung tampil
    io.emit('update_results', { results: poll.results, totalVotes: 0 });
  });

  // --- VOTER: mengirim pilihan ------------------------------
  socket.on('vote', (data = {}) => {
    const option = (data.option || '').toString();

    // 1. Tidak ada polling aktif
    if (!poll) {
      socket.emit('error_msg', { message: 'Belum ada polling yang aktif.' });
      return;
    }

    // 2. Polling sudah ditutup
    if (isClosed) {
      socket.emit('poll_closed');
      return;
    }

    // 3. Opsi tidak valid
    if (!Object.prototype.hasOwnProperty.call(poll.results, option)) {
      socket.emit('error_msg', { message: 'Opsi tidak valid.' });
      return;
    }

    // 4. Cegah double vote berdasarkan socket.id
    if (voters.has(socket.id)) {
      socket.emit('already_voted', { message: 'Anda sudah memilih.' });
      return;
    }

    // Catat suara
    voters.add(socket.id);
    poll.results[option] += 1;

    console.log(`[vote]        ${socket.id} -> "${option}" | total suara: ${voters.size}`);

    // Konfirmasi ke voter ybs bahwa vote diterima
    socket.emit('vote_accepted', { option });

    // Broadcast hasil terbaru ke SEMUA client
    io.emit('update_results', {
      results: poll.results,
      totalVotes: voters.size,
    });
  });

  // --- ADMIN: menutup polling -------------------------------
  socket.on('close_poll', () => {
    if (!poll) {
      socket.emit('error_msg', { message: 'Belum ada polling untuk ditutup.' });
      return;
    }
    isClosed = true;
    console.log(`[close_poll]  "${poll.question}" ditutup | total suara: ${voters.size}`);

    // Broadcast bahwa polling ditutup ke SEMUA client
    io.emit('poll_closed');
  });

  // --- ADMIN: mereset / buat polling baru (opsional, bantu testing) ---
  socket.on('reset_poll', () => {
    poll = null;
    isClosed = false;
    voters.clear();
    console.log('[reset_poll]  state polling direset');
    io.emit('poll_reset');
    io.emit('current_state', buildState());
  });

  // --- Disconnect -------------------------------------------
  socket.on('disconnect', () => {
    console.log(`[disconnect] ${socket.id}`);
    // Catatan: socket.id voter sengaja TIDAK dihapus dari `voters`,
    // supaya reconnect dengan id baru tetap dihitung sebagai voter baru
    // dan id lama tidak bisa "dipakai ulang" untuk double vote.
  });
});

// ------------------------------------------------------------
server.listen(PORT, () => {
  console.log('============================================');
  console.log(`  VoteNow berjalan di http://localhost:${PORT}`);
  console.log(`  Voter : http://localhost:${PORT}/`);
  console.log(`  Admin : http://localhost:${PORT}/admin.html`);
  console.log('============================================');
});
