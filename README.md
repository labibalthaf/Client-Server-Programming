# 🗳️ VoteNow — Aplikasi Voting/Polling Real-Time

Aplikasi voting/polling **real-time** berbasis WebSocket. Admin membuat polling,
voter memilih, dan **hasil suara langsung diperbarui di semua layar** tanpa reload —
menggunakan Socket.IO.

> **UAS Client Server Programming — Pilihan 7 (Voting/Polling Real-Time)**
> Nama&nbsp;&nbsp;: **Labib Althaf**
> NIM&nbsp;&nbsp;&nbsp;&nbsp;: **23343042**
> Prodi&nbsp;: **Informatika — Universitas Negeri Padang (UNP)**

---

## ✨ Fitur

- **Real-time** — hasil voting diperbarui live ke semua client via WebSocket (Socket.IO).
- **Halaman Admin** — membuat polling, menambah opsi secara dinamis, menutup polling,
  dan melihat hasil live.
- **Halaman Voter** — memilih opsi, melihat bar hasil dengan persentase, dan status polling.
- **Opsi fleksibel** — minimal **2**, maksimal **10** pilihan. Default tampil 4 input,
  bisa ditambah/dikurangi sesuai kebutuhan.
- **Anti double-vote** — satu koneksi hanya bisa memilih satu kali (berbasis `socket.id`).
- **Validasi server** — menolak vote saat belum ada polling, polling sudah ditutup,
  opsi tidak valid, opsi duplikat, atau jumlah opsi melebihi batas.
- **Sinkronisasi otomatis** — client yang baru terhubung langsung mendapat state polling
  yang sedang berjalan (pertanyaan, hasil, status buka/tutup).
- **Status koneksi** — indikator titik hijau (terhubung) / merah (terputus).
- **UI dark mode** responsif & mobile-friendly dengan Tailwind CSS.

---

## 🧰 Teknologi

| Komponen      | Teknologi                          |
|---------------|------------------------------------|
| Runtime       | Node.js (v20 LTS+)                 |
| Web server    | Express ^4.18                      |
| Real-time     | Socket.IO ^4.7                     |
| Frontend      | HTML + Vanilla JS + Tailwind (CDN) |
| Penyimpanan   | In-memory (objek JavaScript)       |

> Tidak memerlukan database. Semua state polling disimpan di memori server,
> sehingga akan tereset bila server dimatikan.

---

## 📂 Struktur Proyek

```
votenow/
├── server.js          # Server Express + Socket.IO (semua event handler)
├── package.json
├── README.md
├── HASIL_PENGUJIAN.md # Dokumentasi hasil uji
└── public/
    ├── index.html     # Halaman voter
    ├── admin.html     # Halaman admin
    └── style.css      # CSS tambahan (scrollbar, animasi)
```

---

## 🚀 Cara Instalasi & Menjalankan

### Prasyarat
- **Node.js v20 LTS atau lebih baru** ([unduh di sini](https://nodejs.org/))
- npm (terpasang otomatis bersama Node.js)

Cek versi:
```bash
node --version
npm --version
```

### 1. Clone repository (branch UAS)
```bash
git clone -b UAS https://github.com/<username>/client-server-programming.git
cd client-server-programming
```

### 2. Install dependency
```bash
npm install
```
Perintah ini memasang `express` dan `socket.io` sesuai `package.json`.

### 3. Jalankan server
```bash
npm start
```
atau
```bash
node server.js
```

Mode pengembangan (auto-restart saat file berubah, Node 18+):
```bash
npm run dev
```

### 4. Buka di browser
| Halaman | URL                                   |
|---------|---------------------------------------|
| Voter   | http://localhost:3000/                |
| Admin   | http://localhost:3000/admin.html      |

> Mengganti port: `PORT=4000 npm start` (Linux/macOS) atau
> `set PORT=4000 && npm start` (Windows CMD).

---

## 🕹️ Cara Pakai

1. Buka **halaman Admin**, isi pertanyaan dan opsi (default 4 input).
   Klik **"+ Tambah Opsi"** untuk menambah pilihan (maks. 10) atau **✕** untuk menghapus.
2. Klik **"Buat Polling"** — semua halaman voter langsung menampilkan polling.
3. Di **halaman Voter**, pilih salah satu opsi. Setelah memilih, tombol terkunci dan
   bar hasil muncul serta diperbarui real-time.
4. Klik **"Tutup Polling"** di Admin untuk menghentikan voting.
   Semua voter tidak bisa memilih lagi dan melihat status *"Polling telah ditutup"*.

> Untuk menguji multi-client: buka beberapa tab/jendela browser ke halaman voter,
> lalu memilih dari masing-masing tab — semua hasil ter-update bersamaan.

---

## 🔌 Event Socket.IO

| Event            | Arah          | Payload                       | Keterangan                                  |
|------------------|---------------|-------------------------------|---------------------------------------------|
| `create_poll`    | Client→Server | `{question, options[]}`       | Admin membuat polling                       |
| `poll_created`   | Server→All    | `{question, options[]}`       | Broadcast polling baru                      |
| `vote`           | Client→Server | `{option}`                    | Voter mengirim pilihan                      |
| `vote_accepted`  | Server→Client | `{option}`                    | Konfirmasi vote diterima                    |
| `already_voted`  | Server→Client | `{message}`                   | Ditolak karena sudah memilih                |
| `update_results` | Server→All    | `{results:{opsi:jumlah}, totalVotes}` | Broadcast hasil terbaru             |
| `close_poll`     | Client→Server | —                             | Admin menutup polling                       |
| `poll_closed`    | Server→All    | —                             | Polling ditutup, voter tak bisa memilih     |
| `current_state`  | Server→Client | `{poll, isClosed, totalVotes}`| State polling untuk client yang baru connect|
| `error_msg`      | Server→Client | `{message}`                   | Pesan error (poll belum ada, opsi invalid…) |
| `reset_poll`     | Client→Server | —                             | Admin mereset polling (opsional)            |
| `poll_reset`     | Server→All    | —                             | Broadcast polling direset                   |

---

## 🧪 Hasil Pengujian

Seluruh skenario lulus (**15/15** uji fungsi inti + **7/7** uji multi-opsi & validasi).
Rincian lengkap ada di **[HASIL_PENGUJIAN.md](HASIL_PENGUJIAN.md)**.

---

## 📝 Lisensi

MIT — bebas digunakan untuk keperluan pembelajaran.
