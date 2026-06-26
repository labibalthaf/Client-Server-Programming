# Hasil Pengujian — VoteNow

**Aplikasi** : VoteNow (Voting/Polling Real-Time)
**Mata Kuliah** : Client Server Programming — UAS Pilihan 7
**Nama** : Labib Althaf
**NIM** : 23343042
**Prodi** : Informatika — Universitas Negeri Padang (UNP)

---

## Lingkungan Pengujian

| Item             | Keterangan                                  |
|------------------|---------------------------------------------|
| Sistem Operasi   | Windows 11                                  |
| Runtime          | Node.js                                     |
| Web server       | Express ^4.18                               |
| Real-time engine | Socket.IO ^4.7                              |
| Penyimpanan      | In-memory (objek JavaScript)                |
| Metode uji       | Headless multi-client (socket.io-client)    |
| URL Voter        | http://localhost:3000/                      |
| URL Admin        | http://localhost:3000/admin.html            |

---

## A. Pengujian Skenario Inti (Sesuai Spesifikasi)

Pengujian dilakukan dengan beberapa client (admin + voter) yang terhubung
bersamaan, lalu memverifikasi payload event Socket.IO yang diterima tiap client.

| No | Skenario Pengujian | Langkah | Hasil yang Diharapkan | Status |
|----|--------------------|---------|-----------------------|:------:|
| 1 | Admin membuat polling baru | Admin emit `create_poll` dengan 1 pertanyaan + 4 opsi | Semua client (voter & admin) menerima `poll_created` berisi pertanyaan & daftar opsi | ✅ Lulus |
| 2 | Voter memilih opsi valid | Voter emit `vote {option:"JS"}` | Tally opsi bertambah (JS=1, totalVotes=1) dan semua client menerima `update_results` | ✅ Lulus |
| 3 | Voter mencoba vote 2× | Voter yang sama emit `vote` kedua kali | Server mengirim `already_voted`; tally tidak bertambah | ✅ Lulus |
| 4 | 3 client vote bersamaan | 3 voter emit `vote` hampir bersamaan | Semua suara terhitung akurat (JS=1, Python=2, Go=1, total=4) | ✅ Lulus |
| 5 | Admin menutup polling | Admin emit `close_poll`, lalu voter mencoba vote | Semua client menerima `poll_closed`; vote baru ditolak, totalVotes tetap | ✅ Lulus |
| 6 | Client baru saat polling aktif | Client baru connect setelah polling berjalan | Langsung menerima `current_state` berisi pertanyaan, hasil, & status polling | ✅ Lulus |

### Rincian Verifikasi (15 pemeriksaan)

```
[Skenario 1] Admin buat polling, broadcast ke semua client
  PASS ✓ voter1 menerima poll_created
  PASS ✓ voter2 menerima 4 opsi
  PASS ✓ admin menerima poll_created

[Skenario 2] Voter memilih opsi valid -> tally naik & broadcast
  PASS ✓ admin melihat JS = 1
  PASS ✓ totalVotes = 1
  PASS ✓ voter2/voter1 menerima update_results

[Skenario 3] Double vote -> server kirim already_voted
  PASS ✓ voter1 menerima already_voted
  PASS ✓ suara Python tetap 0 (vote ke-2 ditolak)

[Skenario 4] 3 voter vote bersamaan -> tally akurat
  PASS ✓ totalVotes = 4 (1 + 3 bersamaan)
  PASS ✓ tally akurat: JS=1, Python=2, Go=1

[Skenario 5] Admin tutup polling -> vote baru ditolak
  PASS ✓ voter2 menerima poll_closed
  PASS ✓ totalVotes tidak berubah setelah ditutup

[Skenario 6] Client baru connect -> langsung dapat state polling
  PASS ✓ client baru langsung dapat pertanyaan polling
  PASS ✓ client baru tahu polling sudah ditutup
  PASS ✓ client baru dapat totalVotes terkini

========================================
  HASIL: 15 PASS, 0 FAIL
========================================
```

**Kesimpulan Bagian A:** 15 dari 15 pemeriksaan **LULUS**.

---

## B. Pengujian Opsi Dinamis & Validasi (Maks. 10 Opsi)

Pengujian fitur jumlah pilihan yang dapat ditambah (lebih dari 4, hingga 10)
serta validasi batas dan duplikat.

| No | Skenario Pengujian | Langkah | Hasil yang Diharapkan | Status |
|----|--------------------|---------|-----------------------|:------:|
| 1 | Polling dengan 7 opsi (>4) | Admin emit `create_poll` dengan 7 opsi | Polling dibuat & broadcast; `results` berisi 7 key | ✅ Lulus |
| 2 | Memilih opsi ke-6 | Voter emit `vote` ke opsi keenam | Suara opsi tersebut tercatat (F=1) | ✅ Lulus |
| 3 | Polling dengan 11 opsi (>10) | Admin emit `create_poll` dengan 11 opsi | Ditolak `error_msg` "Maksimal 10 opsi."; tidak ada `poll_created` | ✅ Lulus |
| 4 | Opsi duplikat | Admin emit `create_poll` dengan 2 opsi bernama sama | Ditolak `error_msg`; tidak ada `poll_created` | ✅ Lulus |

### Rincian Verifikasi (7 pemeriksaan)

```
[A] Poll dengan 7 opsi (>4) diterima & broadcast
  PASS ✓ 7 opsi diterima (lebih dari 4)
  PASS ✓ results punya 7 key

[B] Voter bisa pilih opsi ke-6
  PASS ✓ opsi ke-6 (F) tercatat 1

[C] Poll dengan 11 opsi (>10) ditolak
  PASS ✓ server tolak >10 opsi: "Maksimal 10 opsi."
  PASS ✓ tidak ada poll_created untuk 11 opsi

[D] Opsi duplikat ditolak
  PASS ✓ server tolak opsi duplikat: "Opsi tidak boleh sama, minimal 2 opsi berbeda."
  PASS ✓ tidak ada poll_created untuk opsi duplikat

========================================
  HASIL: 7 PASS, 0 FAIL
========================================
```

**Kesimpulan Bagian B:** 7 dari 7 pemeriksaan **LULUS**.

---

## Ringkasan Akhir

| Bagian Pengujian                         | Jumlah Uji | Lulus | Gagal |
|------------------------------------------|:----------:|:-----:|:-----:|
| A. Skenario inti (sesuai spesifikasi)    | 15         | 15    | 0     |
| B. Opsi dinamis & validasi (maks. 10)    | 7          | 7     | 0     |
| **Total**                                | **22**     | **22**| **0** |

Seluruh fungsi aplikasi VoteNow berjalan sesuai spesifikasi: pembuatan polling,
voting real-time, pencegahan double-vote, penutupan polling, sinkronisasi client
baru, serta penambahan opsi dinamis hingga 10 pilihan dengan validasi yang sesuai.
