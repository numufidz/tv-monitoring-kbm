# E-Jadwal TV - Monitoring Jadwal Pelajaran Digital

**Sistem monitoring jadwal pelajaran real-time untuk MTs. An-Nur Bululawang**

---

> ✅ **MIGRATION v2.0 COMPLETE:** Struktur data telah dimigrasi ke DB_ASC (WIDE) + DB_GURU_MAPEL (master) + KELAS_SHIFT (mapping). Script.js otomatis transform WIDE → LONG on-the-fly dengan dynamic shift mapping. Lihat [MIGRATION.md](MIGRATION.md) untuk detail teknis.

---

## 📋 Daftar Isi

1. [Gambaran Umum](#gambaran-umum)
2. [Fitur Utama](#fitur-utama)
3. [Teknologi](#teknologi)
4. [Struktur Proyek](#struktur-proyek)
5. [Data Source (Google Sheets)](#data-source-google-sheets)
6. [Setup & Instalasi](#setup--instalasi)
7. [Penggunaan](#penggunaan)
8. [Struktur API](#struktur-api)
9. [Troubleshooting](#troubleshooting)
10. [Dokumentasi](#dokumentasi)

---

## 🎯 Gambaran Umum

**E-Jadwal TV** adalah aplikasi web yang menampilkan jadwal pelajaran sekolah secara real-time di layar TV atau komputer. Aplikasi ini mengambil data langsung dari Google Sheets, sehingga memudahkan pembaruan jadwal tanpa perlu deploy ulang.

**Target User:**
- Guru pembawa acara
- Siswa dan orang tua
- Staf administrasi sekolah

**Lokasi Server:** https://tv-monitoring-kbm.netlify.app/

---

## ✨ Fitur Utama

### 1. **Tampilan Jadwal Real-Time**
- Menampilkan kelas yang sedang belajar sesuai waktu saat ini
- Update otomatis setiap 15 detik
- Menampilkan nama mata pelajaran dan guru pengajar

### 2. **Shift Pagi & Siang**
- **KBM PAGI (Shift Putra):** Jam 06:30 - 12:00
  - Kelas: 7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B, 9C
- **KBM SIANG (Shift Putri):** Jam 12:30 - 17:00
  - Kelas: 7D, 7E, 7F, 7G, 8D, 8E, 8F, 8G, 8H, 9D, 9E, 9F, 9G, 9H

### 3. **Fitur Pengumuman Suara**
- Pengumuman otomatis saat pergantian jam pelajaran
- Daftar guru pengajar diumumkan dengan TTS (Text-to-Speech)
- Dukungan berbagai suara (pria/wanita/lainnya)
- Audio intro MP3 custom

### 4. **Jadwal Khusus Hari Kamis**
- Penggunaan `BEL KHUSUS` sheet untuk jadwal yang berbeda
- Indikator otomatis di tampilan

### 5. **Guru Piket**
- Menampilkan nama guru piket untuk shift saat ini
- Update otomatis berdasarkan data PIKET sheet

### 6. **Mode Tampilan Tema**
- 9 pilihan tema/layout yang berbeda:
  - Klasik (default)
  - Modern
  - Sunset
  - Vibrant
  - Neon Glow
  - Retro Wave
  - Nature
  - Matrix
  - Glassmorphism
- Penggantian tema otomatis saat loading

### 7. **Kontrol & Pengaturan**
- Pengaturan ukuran font
- Pengaturan font keluarga
- Pengaturan waktu manual (jam, menit, hari)
- Modal jadwal lengkap harian
- View jadwal per shift atau lengkap

---

## 🛠 Teknologi

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Data Source:** Google Sheets API (via opensheet.elk.sh)
- **Hosting:** Netlify (Static Site)
- **Browser API:**
  - Web Speech API (untuk TTS pengumuman)
  - Local Storage (untuk menyimpan preferensi)
  - Geolocation API (opsional)

---

## 📁 Struktur Proyek

```
tv-monitoring-kbm/
├── index.html              # File HTML utama
├── script.js               # Logika aplikasi (823 baris)
├── manifest.json           # Web App Manifest
├── README.md              # Dokumentasi ini
├── AGENT.md               # Panduan untuk AI Agent
├── MIGRATION.md           # ✨ Panduan migrasi struktur data
├── TECHNICAL.md           # Spesifikasi teknis
├── API.md                 # Referensi API
├── TROUBLESHOOTING.md     # Panduan troubleshooting
├── DEVELOPMENT.md         # Panduan development
├── DOCUMENTATION_INDEX.md # Navigasi dokumentasi
└── audio/
    ├── intro.mp3a
    ├── intro.mp3b
    └── intro.mp3c
```

### File Utama

#### `index.html`
- Struktur DOM aplikasi
- Grid untuk menampilkan kartu kelas
- Modal untuk menampilkan jadwal lengkap
- Control panel di sidebar kanan
- Elemen audio untuk intro pengumuman

#### `script.js` (823 baris)
- Konstanta API & endpoint
- Variabel state global
- Fungsi update clock & calendar
- Fungsi fetch data dari Google Sheets
- Fungsi konversi data ke format jadwal
- Fungsi text-to-speech pengumuman
- Fungsi kontrol UI (tema, font, waktu)
- Event listeners & interval loops

#### `manifest.json`
- Konfigurasi Web App (PWA)
- Icon aplikasi
- Theme color

---

## 📊 Data Source (Google Sheets)

**Spreadsheet ID:** `1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I`

> ⚠️ **NOTE:** Struktur data sedang dalam proses migrasi. Lihat [MIGRATION.md](MIGRATION.md) untuk detail lengkap.

### Current Structure (v1.0 - Deprecated)

#### Sheet 1: DATABASE (Legacy)
Struktur jadwal pelajaran dengan kolom:
- **Hari:** Nama hari (SABTU, AHAD, SENIN, dst)
- **Jam Ke-:** Nomor jam pelajaran (1-7)
- **Kelas 7A-9C:** Kode mapel untuk shift pagi
- **Kelas 7D-9H:** Kode mapel untuk shift siang

**Format Kode Mapel:** `[KODE].[NOMOR]` (misal: ASW.37, ING.02)

> ⚠️ Sheet ini akan deprecated. Gunakan DB_ASC + DB_GURU_MAPEL untuk struktur baru.

### New Structure (v2.0 - Recommended) ✨

#### Sheet 1: DB_ASC
Jadwal pelajaran (hanya kode mapel):
- **HARI:** Nama hari (SABTU - KAMIS, 6 hari)
- **Jam-Ke:** Nomor jam pelajaran (1-7)
- **7A-9C:** Kode untuk shift pagi
- **7D-9H:** Kode untuk shift siang

#### Sheet 2: DB_GURU_MAPEL
Master data guru dan mata pelajaran:
- **KODE_GURU:** ID guru
- **NAMA GURU:** Nama lengkap guru
- **KODE_DB_ASC:** Kode yang digunakan di DB_ASC (foreign key)
- **MAPEL_LONG:** Nama lengkap mata pelajaran
- **MAPEL_SHORT:** Nama singkat mata pelajaran
- **NO. WA:** Nomor WhatsApp guru

**Keuntungan struktur baru:**
- ✅ Data guru tersentralisasi (update sekali, apply ke semua)
- ✅ Konsistensi data terjaga
- ✅ Lookup performance lebih baik (O(1) vs O(n))
- ✅ Mudah maintenance

### Unchanged Sheets

#### Sheet 3: PERIODE BEL
Jadwal waktu bel reguler dengan kolom:
- **Shift:** PUTRA atau PUTRI
- **Jam Ke-:** 1-7 atau IST (istirahat)
- **Jam Mulai:** Waktu mulai (HH:MM)
- **Jam Selesai:** Waktu selesai (HH:MM)

#### Sheet 4: BEL KHUSUS
Jadwal khusus hari Kamis (struktur sama dengan PERIODE BEL)

#### Sheet 5: PIKET
Data guru piket dengan kolom:
- **HARI:** Nama hari
- **PIKET SHIFT PAGI:** Nama guru piket shift pagi
- **PIKET SHIFT SIANG:** Nama guru piket shift siang

---

## 🚀 Setup & Instalasi

### Prasyarat
- Browser modern (Chrome, Firefox, Safari, Edge)
- Koneksi internet
- Google Sheets terpublikasi (Share > Anyone with the link > Viewer)

### Instalasi Lokal

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd tv-monitoring-kbm
   ```

2. **Buka di browser**
   ```bash
   # Gunakan Live Server (VS Code extension) atau
   python -m http.server 8000
   # Buka: http://localhost:8000
   ```

3. **Atau langsung akses online**
   - https://tv-monitoring-kbm.netlify.app/

### Konfigurasi Google Sheets

1. Buka Google Sheets dengan ID di atas
2. Pastikan sheet publik (Share > Viewer link)
3. Update `spreadsheetID` di script.js jika menggunakan sheet berbeda

> ⚠️ **Untuk Developer:** Jika Anda akan menggunakan struktur data baru (v2.0), ikuti panduan di [MIGRATION.md](MIGRATION.md) untuk setup yang benar.

---

## 📱 Penggunaan

### Mode Normal (Tampilan TV)
1. Buka aplikasi di browser
2. Aplikasi otomatis menampilkan jadwal sesuai waktu saat ini
3. Data refresh setiap 15 detik
4. Pengumuman suara otomatis saat berganti jam

### Control Panel (Klik icon gear di kanan atas)

**Waktu & Hari:**
- `+H` / `-H`: Adjust jam (offset waktu)
- `+M` / `-M`: Adjust menit
- `+D` / `-D`: Adjust hari

**Tampilan:**
- `Font` button: Ganti font keluarga
- `+` / `-` button: Ukuran font
- `Theme` button: Ganti tema tampilan

**Audio:**
- Dropdown voice: Pilih suara pengumuman
- `Announce` button: Umumkan jadwal sekarang
- `Stop` button: Hentikan pengumuman

**Jadwal:**
- `Schedule` button: Lihat jadwal lengkap hari ini
- `Full Schedule` button: Modal jadwal detail

---

## 🔌 Struktur API

### Endpoint Data (v1.0 - Legacy)

```javascript
// DATABASE (Deprecated)
https://opensheet.elk.sh/[SPREADSHEET_ID]/DATABASE
```

### Endpoint Data (v2.0 - New) ✨

```javascript
// DB_ASC (Jadwal)
https://opensheet.elk.sh/[SPREADSHEET_ID]/DB_ASC

// DB_GURU_MAPEL (Master Guru)
https://opensheet.elk.sh/[SPREADSHEET_ID]/DB_GURU_MAPEL

// PERIODE BEL (Unchanged)
https://opensheet.elk.sh/[SPREADSHEET_ID]/PERIODE%20BEL

// BEL KHUSUS (Unchanged)
https://opensheet.elk.sh/[SPREADSHEET_ID]/BEL%20KHUSUS

// PIKET (Unchanged)
https://opensheet.elk.sh/[SPREADSHEET_ID]/PIKET
```

### Response Format

#### DB_ASC Response (New):
```json
[
  {
    "HARI": "SABTU",
    "Jam-Ke": "1",
    "7A": "BAR.23",
    "7B": "ASW.37",
    "7C": "ING.35",
    ...
  }
]
```

#### DB_GURU_MAPEL Response (New):
```json
[
  {
    "KODE_GURU": "02",
    "NAMA GURU": "Heru Yulianto M.Pd",
    "KODE_DB_ASC": "ING.02",
    "MAPEL_LONG": "B. INGGRIS",
    "MAPEL_SHORT": "B.INGG",
    "NO. WA": "6285335842568"
  }
]
```

### Fetch Logic (New Structure)

```javascript
// Fetch semua sheet secara parallel
const [dbAscData, dbGuruData, belData, belKhususData, piketData] = await Promise.all([
  fetch(endpointDbAsc).then(r => r.json()),
  fetch(endpointDbGuru).then(r => r.json()),
  fetch(endpointBel).then(r => r.json()),
  fetch(endpointBelKhusus).then(r => r.json()),
  fetch(endpointPiket).then(r => r.json())
]);

// Lookup guru info
const guruInfo = lookupGuruInfo(kodeDbAsc, dbGuruData);
```

> 📘 **Detail lengkap:** Lihat [API.md](API.md) untuk referensi lengkap dan [MIGRATION.md](MIGRATION.md) untuk implementasi lookup pattern.

---

## 🐛 Troubleshooting

### Tidak ada jadwal yang tampil
**Penyebab:**
1. Google Sheets belum di-share (public link)
2. Nama sheet tidak sesuai di script.js
3. Format data berbeda dari yang diharapkan
4. API endpoint down

**Solusi:**
1. Pastikan Google Sheets publik
2. Buka F12 > Console, lihat error message
3. Check struktur data di Google Sheets
4. Coba refresh atau tunggu beberapa saat

> 📘 **Troubleshooting lengkap:** Lihat [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Pengumuman suara tidak jalan
**Penyebab:**
1. Browser mute atau volume 0
2. Browser belum mengizinkan Web Speech API
3. Koneksi internet lambat

**Solusi:**
1. Unmute browser, cek volume sistem
2. Izinkan akses microphone di browser settings
3. Cek koneksi internet

### Tema tidak berubah
**Penyebab:**
1. CSS tidak ter-load
2. Class CSS conflict

**Solusi:**
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache

### Waktu tidak akurat
**Penyebab:**
1. Jam sistem komputer tidak akurat
2. Timezone browser berbeda

**Solusi:**
1. Set jam sistem dengan benar
2. Manual adjust waktu via control panel

### Error setelah migrasi struktur data ✨
**Penyebab:**
1. Kode belum diupdate untuk struktur baru
2. Lookup function tidak ter-implement
3. Field name mismatch

**Solusi:**
1. Baca [MIGRATION.md](MIGRATION.md) untuk panduan lengkap
2. Implement lookup pattern yang dijelaskan
3. Validasi data dengan `validateDataIntegrity()`

---

## 📚 Dokumentasi

Proyek ini memiliki dokumentasi lengkap untuk berbagai kebutuhan:

### Untuk Users
- **README.md** (file ini) - Overview & penggunaan
- **TROUBLESHOOTING.md** - Panduan troubleshooting

### Untuk Developers
- **DEVELOPMENT.md** - Panduan development & contributing
- **TECHNICAL.md** - Spesifikasi teknis mendalam
- **API.md** - Referensi API lengkap
- **MIGRATION.md** ✨ - Panduan migrasi struktur data (v1.0 → v2.0)

### Untuk AI Agents
- **AGENT.md** - Konteks lengkap untuk AI development agent
- **MIGRATION.md** ✨ - Quick context & complete migration guide

### Navigation
- **DOCUMENTATION_INDEX.md** - Panduan navigasi semua dokumentasi

> 📘 **Mulai dari mana?** Lihat [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) untuk panduan navigasi berdasarkan role Anda.

---

## 🔄 Version History & Migration

### v1.0.0 (Current - Legacy)
- Initial release
- Features: Jadwal, TTS, Themes, Piket
- Data Structure: DATABASE sheet (mixed data)
- API: OpenSheet (4 endpoints)

### v2.0.0 (In Progress - Migration) ✨
- **BREAKING CHANGE:** Data structure migration
- New Structure: DB_ASC + DB_GURU_MAPEL (normalized)
- Performance: Improved with Map-based lookup
- Maintenance: Easier guru data updates
- **Migration Guide:** [MIGRATION.md](MIGRATION.md)

> ⚠️ **Important for Developers:** Jika Anda akan bekerja dengan code ini, pastikan baca [MIGRATION.md](MIGRATION.md) untuk memahami perubahan struktur data yang sedang berlangsung.

---

## 🤝 Contributing

Contributions are welcome! Untuk berkontribusi:

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

**Sebelum contribute:**
- Baca [DEVELOPMENT.md](DEVELOPMENT.md) untuk panduan development
- Baca [MIGRATION.md](MIGRATION.md) jika bekerja dengan data structure
- Follow code style guidelines
- Test thoroughly sebelum submit PR

---

## 📝 Catatan Pengembang

### Global Variables
```javascript
let globalBelData;        // Data jadwal waktu
let globalBelKhususData;  // Data jadwal khusus Kamis
let globalJadwalData;     // Data jadwal pelajaran lengkap (v1.0)
// v2.0 New:
let globalDbAscData;      // Data jadwal (kode only)
let globalDbGuruData;     // Data guru master
let globalGuruLookupMap;  // Performance cache for lookup
let globalJadwalProcessed;// Joined data (ready to render)
```

### Key Functions

| Function | Purpose | Version |
|----------|---------|---------|
| `fetchData()` | Main orchestration - fetch all data & render | v1.0 |
| `updateClock()` | Update tampilan jam & tanggal | v1.0 |
| `announceSchedule()` | Text-to-speech pengumuman jadwal | v1.0 |
| `showSchedule()` | Modal jadwal bel harian | v1.0 |
| `showFullSchedule()` | Modal jadwal pelajaran lengkap | v1.0 |
| `adjustTime()` | Manual adjust waktu | v1.0 |
| `loadVoices()` | Load suara TTS dari browser | v1.0 |
| `createGuruLookupMap()` | Build O(1) lookup cache | v2.0 ✨ |
| `lookupGuruInfo()` | Get guru info from kode | v2.0 ✨ |
| `processJadwalWithLookup()` | Join jadwal + guru data | v2.0 ✨ |
| `validateDataIntegrity()` | Test data consistency | v2.0 ✨ |

### Update Interval
- Clock: 1 detik (setInterval 1000ms)
- Jadwal: 15 detik (setInterval 15000ms)
- Interaksi user tracking: 30 detik (untuk auto-refresh)

---

## 🔐 Privacy & Security

- Tidak ada data pribadi yang disimpan
- Semua data dari Google Sheets (public)
- Tidak ada backend server
- Local storage hanya untuk preferensi user

---

## 📄 Lisensi

Copyright © 2024 MTs. An-Nur Bululawang. All rights reserved.

---

## 📧 Support

Untuk pertanyaan atau laporan bug, hubungi tim IT sekolah.

---

**Last Updated:** Desember 2024  
**Version:** 2.0.0 (Migration in progress)  
**Documentation:** Complete (8 files)

