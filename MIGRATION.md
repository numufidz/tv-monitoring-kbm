# MIGRATION.md - Panduan Migrasi Struktur Data

**Dokumentasi migrasi dari struktur DATABASE lama ke sistem DB_ASC + DB_GURU_MAPEL**

---

## 📌 Quick Context for Agent

### **Current State (Before Migration):**
```
Project: E-Jadwal TV - Monitoring Jadwal Pelajaran Digital
Files: script.js (823 lines), index.html (1,141 lines)
Current Endpoints: 4 sheets
  ├─ DATABASE (jadwal + guru mixed)
  ├─ PERIODE BEL
  ├─ BEL KHUSUS
  └─ PIKET

Key Functions:
  ├─ fetchData() - lines 220+ (fetches 4 sheets in parallel)
  ├─ filterByHariAndJamKe() - data filtering
  └─ renderJadwal() - DOM rendering

Global Variables:
  ├─ globalJadwalData (mixed schedule data)
  ├─ globalBelData
  └─ globalBelKhususData
```

### **Target State (After Migration):**
```
New Endpoints: 5 sheets (2 new + 3 unchanged)
  ├─ DB_ASC (jadwal only) ✨ NEW
  ├─ DB_GURU_MAPEL (guru master) ✨ NEW
  ├─ PERIODE BEL (unchanged)
  ├─ BEL KHUSUS (unchanged)
  └─ PIKET (unchanged)

New Functions Required:
  ├─ createGuruLookupMap() - Build O(1) lookup
  ├─ lookupGuruInfo() - Get guru from kode
  ├─ processJadwalWithLookup() - Join data
  └─ validateDataIntegrity() - Test data consistency

New Global Variables:
  ├─ globalDbAscData (jadwal only)
  ├─ globalDbGuruData (guru master)
  ├─ globalGuruLookupMap (performance cache)
  └─ globalJadwalProcessed (joined result)
```

### **Migration Impact:**
- 🔴 **BREAKING CHANGE:** Core data processing must be rewritten
- ⏱️ **Estimated Time:** 4-6 hours for full implementation + testing
- 🧪 **Testing Required:** Full regression + data validation
- 📊 **Data Change:** 6 hari (JUMAT removed), Jam-Ke field name change
- 🚀 **Performance:** Improved (Map-based lookup O(1) vs array.find O(n))

### **Files to Modify:**
```
script.js:
  ├─ Lines 1-13: Add new endpoint constants
  ├─ Lines 23-33: Add new global variables
  ├─ Lines 132-200+: Rewrite data processing logic
  ├─ Add: 3 new functions (lookup, process, validate)
  └─ Update: fetchData(), renderJadwal(), filter functions

index.html: No changes required ✅
```

### **Quick Start for Agent:**
1. Read this MIGRATION.md completely (15-20 min)
2. Review "Complete Migration Example" section (line 400+)
3. Implement functions in order: createGuruLookupMap → lookupGuruInfo → processJadwalWithLookup
4. Update fetchData() to use new structure
5. Run validateDataIntegrity() to test
6. Deploy with monitoring

### **For Full Project Context:**
- See: **AGENT.md** (project overview, historical context)
- See: **API.md** (endpoint details, response formats)
- See: **TECHNICAL.md** (architecture, performance)
- See: **DEVELOPMENT.md** (code style, testing)

### **Emergency Rollback:**
```javascript
// If migration fails, revert to old endpoints:
const endpointDatabase = 'https://opensheet.elk.sh/.../DATABASE'
// Old structure still available for 1 month
```

---

## 📋 Overview Migrasi

### Ringkasan Perubahan
Proyek E-Jadwal TV melakukan restructuring data layer untuk meningkatkan:
- ✅ **Normalisasi data** - Pemisahan jadwal dan data guru
- ✅ **Fleksibilitas** - Update info guru tanpa mengubah jadwal
- ✅ **Konsistensi** - Kode mapel terstandarisasi
- ✅ **Maintainability** - Struktur lebih mudah dipahami dan dikelola

### Timeline Migrasi
```
Phase 1: Persiapan Data (SELESAI)
  ├─ Pembuatan sheet DB_ASC
  ├─ Pembuatan sheet DB_GURU_MAPEL
  └─ Validasi data consistency

Phase 2: Code Adaptation (CURRENT)
  ├─ Update API endpoints
  ├─ Refactor data processing functions
  ├─ Implement lookup mechanism
  └─ Testing & debugging

Phase 3: Deployment (PENDING)
  ├─ Backup database lama
  ├─ Deploy to production
  └─ Monitor & fix issues

Phase 4: Cleanup (FUTURE)
  └─ Remove old DATABASE sheet (after 1 month stability)
```

---

## 🔄 Struktur Data: Sebelum vs Sesudah

### ❌ Struktur Lama (DATABASE Sheet)

**Sheet: DATABASE**
```
┌─────────┬────────┬──────────┬──────────┬─────┬──────────┬──────────┐
│  HARI   │ Jam Ke │   7A     │   7B     │ ... │   9G     │   9H     │
├─────────┼────────┼──────────┼──────────┼─────┼──────────┼──────────┤
│ SABTU   │   1    │ ASW.37   │ ING.02   │ ... │ SKI.18   │ IND.03   │
│ SABTU   │   2    │ HQA.37   │ QUR.37   │ ... │ MTK.06   │ ING.02   │
│ SABTU   │   3    │ BAR.23   │ BKS.13   │ ... │ ING.02   │ IND.03   │
│   ...   │  ...   │   ...    │   ...    │ ... │   ...    │   ...    │
└─────────┴────────┴──────────┴──────────┴─────┴──────────┴──────────┘

Total: 23 kolom kelas (C-Y)
Hari: 7 hari (SABTU - JUMAT)
Data: Jadwal + Info Guru TERCAMPUR dalam 1 sheet
```

**Masalah:**
- ❌ Data guru redundant di setiap cell
- ❌ Sulit update info guru (harus update semua cell)
- ❌ Tidak ada validasi konsistensi kode
- ❌ Struktur sulit di-scale

---

### ✅ Struktur Baru (DB_ASC + DB_GURU_MAPEL)

**Sheet 1: DB_ASC** (Jadwal Pelajaran)
```
┌─────────┬────────┬──────────┬──────────┬─────┬──────────┬──────────┐
│  HARI   │ Jam-Ke │   7A     │   7B     │ ... │   9G     │   9H     │
├─────────┼────────┼──────────┼──────────┼─────┼──────────┼──────────┤
│ SABTU   │   1    │ BAR.23   │ ASW.37   │ ... │ [empty]  │ [empty]  │
│ SABTU   │   2    │ BAR.23   │ QUR.37   │ ... │ [empty]  │ [empty]  │
│ SABTU   │   3    │ HQA.37   │ BKS.13   │ ... │ ING.02   │ IND.03   │
│   ...   │  ...   │   ...    │   ...    │ ... │   ...    │   ...    │
└─────────┴────────┴──────────┴──────────┴─────┴──────────┴──────────┘

Header Row 1: SHIFT PAGI (9 kelas) | SHIFT SIANG (14 kelas)
Total: 23 kolom kelas (C-Y)
Hari: 6 hari (SABTU - KAMIS, TIDAK ADA JUMAT)
Jam: 7 jam (1-7)
Total Rows: 42 baris data (6 hari × 7 jam)
```

**Sheet 2: DB_GURU_MAPEL** (Master Data Guru)
```
┌────────────┬─────────────────────────┬──────────────┬─────────────────┬─────────────┬──────────────┐
│ KODE_GURU  │      NAMA GURU          │ KODE_DB_ASC  │   MAPEL_LONG    │ MAPEL_SHORT │    NO. WA    │
├────────────┼─────────────────────────┼──────────────┼─────────────────┼─────────────┼──────────────┤
│    02      │ Heru Yulianto M.Pd      │   ING.02     │  B. INGGRIS     │   B.INGG    │ 628533584... │
│    03      │ Drs. Suwarno            │   IND.03     │  B. INDONESIA   │   B.INDO    │ 628230129... │
│    03      │ Drs. Suwarno            │   SKU.03     │  SKU UBUDIYAH   │   S K U     │ 628230129... │
│    07      │ Khoirul Anam S.Pd.I     │   FIQ.07     │  FIQIH          │   FIQIH     │ 628564523... │
│    07      │ Khoirul Anam S.Pd.I     │   QUR.07     │  QUR'AN HADITS  │   QURDITS   │ 628564523... │
│    ...     │        ...              │     ...      │      ...        │     ...     │     ...      │
└────────────┴─────────────────────────┴──────────────┴─────────────────┴─────────────┴──────────────┘

Total: ~100+ rows (satu guru bisa multiple mapel)
Primary Key: KODE_DB_ASC (untuk lookup)
```

**Keuntungan:**
- ✅ Data guru tersentralisasi
- ✅ Update guru cukup di 1 tempat
- ✅ Validasi kode via lookup
- ✅ Mudah add/remove guru
- ✅ Struktur scalable

---

## 🔗 Relasi Data & Lookup Pattern

### Diagram Relasi
```
┌─────────────────────────────────────────────────────────────┐
│                       DB_ASC                                │
│  ┌──────┬────────┬─────────┬─────────┬─────┐              │
│  │ HARI │ Jam-Ke │   7A    │   7B    │ ... │              │
│  ├──────┼────────┼─────────┼─────────┼─────┤              │
│  │SABTU │   1    │ BAR.23  │ ASW.37  │ ... │              │
│  └──────┴────────┴────│────┴────│────┴─────┘              │
│                       │         │                          │
│                       │         │                          │
│              LOOKUP   │         │   LOOKUP                 │
│                       ▼         ▼                          │
└───────────────────────┼─────────┼──────────────────────────┘
                        │         │
┌───────────────────────┼─────────┼──────────────────────────┐
│                       │         │   DB_GURU_MAPEL          │
│  ┌──────────────┬─────▼─────────▼────┬──────────────┐     │
│  │  KODE_GURU   │   KODE_DB_ASC      │  NAMA GURU   │     │
│  ├──────────────┼────────────────────┼──────────────┤     │
│  │     23       │     BAR.23         │  M. Faris    │◄────┘
│  │     37       │     ASW.37         │  A. Mudzakkir│
│  └──────────────┴────────────────────┴──────────────┘
│                        ▲
│                        │
│                  Foreign Key
└────────────────────────────────────────────────────────────┘
```

### Lookup Logic
```javascript
// PSEUDOCODE - Cara kerja lookup

// Step 1: Ambil jadwal dari DB_ASC
const jadwalCell = "BAR.23";  // dari DB_ASC, kelas 7A, jam 1

// Step 2: Cari di DB_GURU_MAPEL berdasarkan KODE_DB_ASC
const guruData = DB_GURU_MAPEL.find(row => row.KODE_DB_ASC === jadwalCell);

// Step 3: Ekstrak informasi
const namaGuru = guruData.NAMA_GURU;      // "Mohammad Faris Fitrah M.Pd.I"
const mapelLong = guruData.MAPEL_LONG;    // "B. ARAB"
const mapelShort = guruData.MAPEL_SHORT;  // "B. ARAB"
const noWA = guruData.NO_WA;              // "6282157375269"

// Step 4: Tampilkan ke UI
displaySchedule({
  kelas: "7A",
  mapel: mapelShort,
  guru: namaGuru
});
```

---

## 🔌 Perubahan API Endpoints

### Endpoint Lama
```javascript
// DEPRECATED - Akan dihapus setelah migrasi stabil
const endpointDatabase = 'https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/DATABASE'
```

### Endpoint Baru
```javascript
// NEW - Gunakan ini untuk development baru
const endpointDbAsc = 'https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/DB_ASC'
const endpointDbGuru = 'https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/DB_GURU_MAPEL'

// Endpoint lain tetap sama
const endpointBel = 'https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/PERIODE%20BEL'
const endpointBelKhusus = 'https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/BEL%20KHUSUS'
const endpointPiket = 'https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/PIKET'
```

### Response Format Baru

**DB_ASC Response:**
```json
[
  {
    "HARI": "SABTU",
    "Jam-Ke": "1",
    "7A": "BAR.23",
    "7B": "ASW.37",
    "7C": "ING.35",
    "...": "...",
    "9H": ""
  }
]
```

**DB_GURU_MAPEL Response:**
```json
[
  {
    "KODE_GURU": "02",
    "NAMA GURU": "Heru Yulianto M.Pd",
    "KODE_DB_ASC": "ING.02",
    "MAPEL_LONG": "B. INGGRIS",
    "MAPEL_SHORT": "B.INGG",
    "NO. WA": "6285335842568"
  },
  {
    "KODE_GURU": "03",
    "NAMA GURU": "Drs. Suwarno",
    "KODE_DB_ASC": "IND.03",
    "MAPEL_LONG": "B. INDONESIA",
    "MAPEL_SHORT": "B.INDO",
    "NO. WA": "6282301290112"
  }
]
```

---

## 💻 Perubahan Code Yang Diperlukan

### 1. Update Global Variables

**Lama:**
```javascript
let globalJadwalData = [];
```

**Baru:**
```javascript
let globalDbAscData = [];      // Data dari DB_ASC (jadwal)
let globalDbGuruData = [];     // Data dari DB_GURU_MAPEL (master guru)
let globalJadwalProcessed = []; // Data hasil join/lookup untuk display
```

---

### 2. Update fetchData() Function

**Lama:**
```javascript
async function fetchData(forceAnnounce = false) {
  try {
    const [dbData, belData, belKhususData, piketData] = await Promise.all([
      fetch(endpointDatabase).then(res => res.json()),
      fetch(endpointBel).then(res => res.json()),
      fetch(endpointBelKhusus).then(res => res.json()),
      fetch(endpointPiket).then(res => res.json())
    ]);
    
    globalJadwalData = dbData;
    // ... rest of processing
  } catch (error) {
    console.error('Fetch error:', error);
  }
}
```

**Baru:**
```javascript
async function fetchData(forceAnnounce = false) {
  try {
    // PERUBAHAN: Tambah 1 endpoint untuk DB_GURU_MAPEL
    const [dbAscData, dbGuruData, belData, belKhususData, piketData] = await Promise.all([
      fetch(endpointDbAsc).then(res => res.json()),
      fetch(endpointDbGuru).then(res => res.json()),  // NEW
      fetch(endpointBel).then(res => res.json()),
      fetch(endpointBelKhusus).then(res => res.json()),
      fetch(endpointPiket).then(res => res.json())
    ]);
    
    // Store raw data
    globalDbAscData = dbAscData;
    globalDbGuruData = dbGuruData;
    globalBelData = belData;
    globalBelKhususData = belKhususData;
    globalPiketData = piketData;
    
    // Process & join data
    globalJadwalProcessed = processJadwalWithLookup(dbAscData, dbGuruData);
    
    // ... rest of processing
  } catch (error) {
    console.error('Fetch error:', error);
  }
}
```

---

### 3. Implementasi Fungsi Lookup

**BARU - Fungsi yang perlu ditambahkan:**
```javascript
/**
 * Lookup guru info from KODE_DB_ASC
 * @param {string} kodeDbAsc - Kode seperti "BAR.23", "ING.02"
 * @param {Array} dbGuruData - Data dari DB_GURU_MAPEL
 * @returns {Object|null} - {namaGuru, mapelLong, mapelShort, noWa} atau null
 */
function lookupGuruInfo(kodeDbAsc, dbGuruData) {
  if (!kodeDbAsc || kodeDbAsc.trim() === '') {
    return null;
  }
  
  const guruRow = dbGuruData.find(row => 
    row['KODE_DB_ASC'] === kodeDbAsc || 
    row.KODE_DB_ASC === kodeDbAsc
  );
  
  if (!guruRow) {
    console.warn(`Guru not found for kode: ${kodeDbAsc}`);
    return null;
  }
  
  return {
    namaGuru: guruRow['NAMA GURU'] || guruRow.NAMA_GURU || '',
    mapelLong: guruRow['MAPEL_LONG'] || guruRow.MAPEL_LONG || '',
    mapelShort: guruRow['MAPEL_SHORT'] || guruRow.MAPEL_SHORT || '',
    noWa: guruRow['NO. WA'] || guruRow.NO_WA || ''
  };
}

/**
 * Process jadwal dengan lookup guru info
 * @param {Array} dbAscData - Data dari DB_ASC
 * @param {Array} dbGuruData - Data dari DB_GURU_MAPEL
 * @returns {Array} - Array of processed jadwal objects
 */
function processJadwalWithLookup(dbAscData, dbGuruData) {
  const processed = [];
  
  // Daftar semua kelas
  const kelasPagi = ['7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B', '9C'];
  const kelasSiang = ['7D', '7E', '7F', '7G', '8D', '8E', '8F', '8G', '8H', '9D', '9E', '9F', '9G', '9H'];
  const allKelas = [...kelasPagi, ...kelasSiang];
  
  dbAscData.forEach(row => {
    const hari = row['HARI'] || row.HARI;
    const jamKe = row['Jam-Ke'] || row['Jam Ke-'] || row.JAM_KE;
    
    allKelas.forEach(kelas => {
      const kodeDbAsc = row[kelas];
      
      if (kodeDbAsc && kodeDbAsc.trim() !== '') {
        const guruInfo = lookupGuruInfo(kodeDbAsc, dbGuruData);
        
        if (guruInfo) {
          processed.push({
            hari: hari,
            jamKe: jamKe,
            kelas: kelas,
            shift: kelasPagi.includes(kelas) ? 'PUTRA' : 'PUTRI',
            kodeDbAsc: kodeDbAsc,
            namaGuru: guruInfo.namaGuru,
            mapelLong: guruInfo.mapelLong,
            mapelShort: guruInfo.mapelShort,
            noWa: guruInfo.noWa
          });
        }
      }
    });
  });
  
  return processed;
}
```

---

### 4. Update Render Functions

**Lama:**
```javascript
function renderJadwal(jadwalData) {
  jadwalData.forEach(item => {
    const card = createCard(
      item.kelas,
      item.mapel,  // Sudah include nama guru dari cell
      item.guru
    );
    container.appendChild(card);
  });
}
```

**Baru:**
```javascript
function renderJadwal(jadwalData) {
  // jadwalData sekarang sudah processed dengan lookup
  jadwalData.forEach(item => {
    const card = createCard(
      item.kelas,
      item.mapelShort,  // Dari lookup
      item.namaGuru     // Dari lookup
    );
    container.appendChild(card);
  });
}
```

---

### 5. Update Filter Functions

**Fungsi filter by Jam Ke dan Shift perlu disesuaikan:**

```javascript
function getCurrentSchedule(jamKe, shift, hari) {
  // Filter dari globalJadwalProcessed (sudah di-lookup)
  return globalJadwalProcessed.filter(item => 
    item.jamKe === jamKe && 
    item.shift === shift && 
    item.hari === hari
  );
}
```

---

## 🔍 Perbedaan Penting

### Field Name Changes

| Lama                  | Baru              | Notes                          |
|-----------------------|-------------------|--------------------------------|
| `row['Jam Ke-']`      | `row['Jam-Ke']`   | Perhatikan format penulisan    |
| `HARI` (7 hari)       | `HARI` (6 hari)   | JUMAT dihapus                  |
| Langsung ada guru     | Perlu lookup      | Gunakan `lookupGuruInfo()`     |
| `MAPEL` field         | Split 3 field     | MAPEL_LONG, MAPEL_SHORT, kode  |

### Hari Aktif

**Lama:**
```javascript
const hariAktif = ['SABTU', 'AHAD', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];
// 7 hari
```

**Baru:**
```javascript
const hariAktif = ['SABTU', 'AHAD', 'SENIN', 'SELASA', 'RABU', 'KAMIS'];
// 6 hari - JUMAT DIHAPUS
```

### Empty Cells

**Penting:** Di DB_ASC, beberapa cell untuk shift siang di jam-jam tertentu kosong (empty string).

```javascript
// Selalu cek sebelum lookup
if (kodeDbAsc && kodeDbAsc.trim() !== '') {
  const guruInfo = lookupGuruInfo(kodeDbAsc, dbGuruData);
  // ... process
}
```

---

## 📊 Data Validation & Testing

### Pre-Migration Checklist

**Data Integrity:**
```javascript
// Test 1: Cek semua kode di DB_ASC ada di DB_GURU_MAPEL
function validateDataIntegrity() {
  const allCodes = new Set();
  
  // Kumpulkan semua kode dari DB_ASC
  globalDbAscData.forEach(row => {
    Object.keys(row).forEach(key => {
      if (key !== 'HARI' && key !== 'Jam-Ke' && row[key]) {
        allCodes.add(row[key]);
      }
    });
  });
  
  // Cek apakah semua kode ada di DB_GURU_MAPEL
  const missingCodes = [];
  allCodes.forEach(code => {
    const found = globalDbGuruData.find(g => g.KODE_DB_ASC === code);
    if (!found) {
      missingCodes.push(code);
    }
  });
  
  if (missingCodes.length > 0) {
    console.error('Missing codes in DB_GURU_MAPEL:', missingCodes);
    return false;
  }
  
  console.log('✅ Data integrity check passed');
  return true;
}
```

**Row Count Validation:**
```javascript
// Test 2: Cek jumlah row sesuai ekspektasi
function validateRowCount() {
  const expectedRows = 6 * 7; // 6 hari × 7 jam = 42 rows
  
  if (globalDbAscData.length !== expectedRows) {
    console.warn(`Expected ${expectedRows} rows, got ${globalDbAscData.length}`);
    return false;
  }
  
  console.log('✅ Row count validation passed');
  return true;
}
```

**Lookup Performance:**
```javascript
// Test 3: Benchmark lookup speed
function benchmarkLookup() {
  const startTime = performance.now();
  
  processJadwalWithLookup(globalDbAscData, globalDbGuruData);
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`Lookup processing time: ${duration.toFixed(2)}ms`);
  
  if (duration > 1000) {
    console.warn('⚠️ Lookup is slow, consider optimization');
  } else {
    console.log('✅ Lookup performance is good');
  }
}
```

---

## 🚨 Troubleshooting

### Issue 1: "Guru not found for kode: XXX.YY"

**Symptoms:**
- Console warning muncul
- Card tidak menampilkan nama guru
- Mapel kosong

**Root Cause:**
- Kode di DB_ASC tidak ada di DB_GURU_MAPEL
- Typo dalam kode

**Solution:**
```javascript
// Debug: List semua kode yang bermasalah
function debugMissingCodes() {
  const missingCodes = [];
  
  globalDbAscData.forEach(row => {
    Object.keys(row).forEach(key => {
      if (key !== 'HARI' && key !== 'Jam-Ke' && row[key]) {
        const code = row[key];
        const found = globalDbGuruData.find(g => g.KODE_DB_ASC === code);
        if (!found) {
          missingCodes.push(code);
        }
      }
    });
  });
  
  console.table([...new Set(missingCodes)]);
}
```

**Fix:** Tambahkan kode yang missing ke DB_GURU_MAPEL sheet

---

### Issue 2: Performance Degradation

**Symptoms:**
- Aplikasi terasa lambat
- Fetch time meningkat
- UI freeze saat render

**Root Cause:**
- Nested loop lookup tidak optimal
- Terlalu banyak DOM manipulation

**Solution:**
```javascript
// Optimization: Create lookup map (O(1) instead of O(n))
function createGuruLookupMap(dbGuruData) {
  const lookupMap = new Map();
  
  dbGuruData.forEach(row => {
    const kode = row['KODE_DB_ASC'] || row.KODE_DB_ASC;
    if (kode) {
      lookupMap.set(kode, {
        namaGuru: row['NAMA GURU'] || row.NAMA_GURU || '',
        mapelLong: row['MAPEL_LONG'] || row.MAPEL_LONG || '',
        mapelShort: row['MAPEL_SHORT'] || row.MAPEL_SHORT || '',
        noWa: row['NO. WA'] || row.NO_WA || ''
      });
    }
  });
  
  return lookupMap;
}

// Usage in processJadwalWithLookup:
const guruMap = createGuruLookupMap(dbGuruData);
const guruInfo = guruMap.get(kodeDbAsc);  // O(1) lookup
```

---

### Issue 3: Empty Schedule Display

**Symptoms:**
- Jadwal tidak muncul sama sekali
- Console log: "No schedule data"

**Root Cause:**
- Field name mismatch (HARI vs Hari)
- Jam-Ke vs Jam Ke-
- Filter logic salah

**Solution:**
```javascript
// Robust field accessor dengan fallback
function getFieldValue(row, ...fieldNames) {
  for (const name of fieldNames) {
    if (row[name] !== undefined) {
      return row[name];
    }
  }
  return null;
}

// Usage:
const hari = getFieldValue(row, 'HARI', 'Hari', 'hari');
const jamKe = getFieldValue(row, 'Jam-Ke', 'Jam Ke-', 'JAM_KE', 'jamKe');
```

---

## 📚 Code Examples

### Complete Migration Example

```javascript
// ============================================
// COMPLETE MIGRATION CODE EXAMPLE
// ============================================

// 1. Constants
const SPREADSHEET_ID = '1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I';
const BASE_URL = 'https://opensheet.elk.sh';

const endpointDbAsc = `${BASE_URL}/${SPREADSHEET_ID}/DB_ASC`;
const endpointDbGuru = `${BASE_URL}/${SPREADSHEET_ID}/DB_GURU_MAPEL`;
const endpointBel = `${BASE_URL}/${SPREADSHEET_ID}/PERIODE%20BEL`;
const endpointBelKhusus = `${BASE_URL}/${SPREADSHEET_ID}/BEL%20KHUSUS`;
const endpointPiket = `${BASE_URL}/${SPREADSHEET_ID}/PIKET`;

// 2. Global Variables
let globalDbAscData = [];
let globalDbGuruData = [];
let globalGuruLookupMap = null;
let globalJadwalProcessed = [];
let globalBelData = [];
let globalBelKhususData = [];
let globalPiketData = [];

// 3. Helper Functions
function createGuruLookupMap(dbGuruData) {
  const lookupMap = new Map();
  
  dbGuruData.forEach(row => {
    const kode = row['KODE_DB_ASC'] || row.KODE_DB_ASC;
    if (kode) {
      lookupMap.set(kode, {
        namaGuru: row['NAMA GURU'] || row.NAMA_GURU || '',
        mapelLong: row['MAPEL_LONG'] || row.MAPEL_LONG || '',
        mapelShort: row['MAPEL_SHORT'] || row.MAPEL_SHORT || '',
        noWa: row['NO. WA'] || row.NO_WA || ''
      });
    }
  });
  
  return lookupMap;
}

function lookupGuruInfo(kodeDbAsc, lookupMap) {
  if (!kodeDbAsc || kodeDbAsc.trim() === '') {
    return null;
  }
  
  return lookupMap.get(kodeDbAsc) || null;
}

function getFieldValue(row, ...fieldNames) {
  for (const name of fieldNames) {
    if (row[name] !== undefined && row[name] !== null) {
      return row[name];
    }
  }
  return null;
}

// 4. Main Processing Function
function processJadwalWithLookup(dbAscData, guruLookupMap) {
  const processed = [];
  
  const kelasPagi = ['7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B', '9C'];
  const kelasSiang = ['7D', '7E', '7F', '7G', '8D', '8E', '8F', '8G', '8H', '9D', '9E', '9F', '9G', '9H'];
  const allKelas = [...kelasPagi, ...kelasSiang];
  
  dbAscData.forEach(row => {
    const hari = getFieldValue(row, 'HARI', 'Hari', 'hari');
    const jamKe = getFieldValue(row, 'Jam-Ke', 'Jam Ke-', 'JAM_KE', 'jamKe');
    
    if (!hari || !jamKe) {
      console.warn('Missing hari or jamKe in row:', row);
      return;
    }
    
    allKelas.forEach(kelas => {
      const kodeDbAsc = row[kelas];
      
      if (kodeDbAsc && kodeDbAsc.trim() !== '') {
        const guruInfo = lookupGuruInfo(kodeDbAsc, guruLookupMap);
        
        if (guruInfo) {
          processed.push({
            hari: hari,
            jamKe: String(jamKe),
            kelas: kelas,
            shift: kelasPagi.includes(kelas) ? 'PUTRA' : 'PUTRI',
            kodeDbAsc: kodeDbAsc,
            namaGuru: guruInfo.namaGuru,
            mapelLong: guruInfo.mapelLong,
            mapelShort: guruInfo.mapelShort,
            noWa: guruInfo.noWa
          });
        } else {
          console.warn(`Guru not found for kode: ${kodeDbAsc} (Hari: ${hari}, Jam: ${jamKe}, Kelas: ${kelas})`);
        }
      }
    });
  });
  
  return processed;
}

// 5. Main Fetch Function
async function fetchData(forceAnnounce = false) {
  console.log('🔄 Fetching data from new structure...');
  
  try {
    const [dbAscData, dbGuruData, belData, belKhususData, piketData] = await Promise.all([
      fetch(endpointDbAsc).then(res => {
        if (!res.ok) throw new Error(`DB_ASC fetch failed: ${res.status}`);
        return res.json();
      }),
      fetch(endpointDbGuru).then(res => {
        if (!res.ok) throw new Error(`DB_GURU_MAPEL fetch failed: ${res.status}`);
        return res.json();
      }),
      fetch(endpointBel).then(res => {
        if (!res.ok) throw new Error(`PERIODE BEL fetch failed: ${res.status}`);
        return res.json();
      }),
      fetch(endpointBelKhusus).then(res => {
        if (!res.ok) throw new Error(`BEL KHUSUS fetch failed: ${res.status}`);
        return res.json();
      }),
      fetch(endpointPiket).then(res => {
        if (!res.ok) throw new Error(`PIKET fetch failed: ${res.status}`);
        return res.json();
      })
    ]);
    
    console.log('✅ All data fetched successfully');
    console.log(`   - DB_ASC rows: ${dbAscData.length}`);
    console.log(`   - DB_GURU_MAPEL rows: ${dbGuruData.length}`);
    
    // Store raw data
    globalDbAscData = dbAscData;
    globalDbGuruData = dbGuruData;
    globalBelData = belData;
    globalBelKhususData = belKhususData;
    globalPiketData = piketData;
    
    // Create lookup map for performance
    globalGuruLookupMap = createGuruLookupMap(dbGuruData);
    console.log(`   - Guru lookup map created: ${globalGuruLookupMap.size} entries`);
    
    // Process jadwal with lookup
    const startProcess = performance.now();
    globalJadwalProcessed = processJadwalWithLookup(dbAscData, globalGuruLookupMap);
    const endProcess = performance.now();
    
    console.log(`✅ Jadwal processed in ${(endProcess - startProcess).toFixed(2)}ms`);
    console.log(`   - Total schedule entries: ${globalJadwalProcessed.length}`);
    
    // Validate data
    validateDataIntegrity();
    
    // Continue with rest of logic (determine current Jam Ke, render, etc.)
    determineCurrentScheduleAndRender(forceAnnounce);
    
  } catch (error) {
    console.error('❌ Fetch error:', error);
    showErrorMessage('Gagal memuat data jadwal. Silakan refresh halaman.');
  }
}

// 6. Validation Functions
function validateDataIntegrity() {
  const allCodesInAsc = new Set();
  
  // Collect all codes from DB_ASC
  globalDbAscData.forEach(row => {
    Object.keys(row).forEach(key => {
      if (key !== 'HARI' && key !== 'Jam-Ke' && row[key]) {
        allCodesInAsc.add(row[key]);
      }
    });
  });
  
  // Check if all codes exist in lookup map
  const missingCodes = [];
  allCodesInAsc.forEach(code => {
    if (!globalGuruLookupMap.has(code)) {
      missingCodes.push(code);
    }
  });
  
  if (missingCodes.length > 0) {
    console.error('❌ Missing codes in DB_GURU_MAPEL:', missingCodes);
    showWarningMessage(`Ditemukan ${missingCodes.length} kode mapel yang tidak memiliki data guru.`);
  } else {
    console.log('✅ Data integrity check passed - all codes have guru info');
  }
  
  return missingCodes.length === 0;
}

// 7. Example Render Function (simplified)
function renderCurrentSchedule(currentScheduleData) {
  const container = document.getElementById('scheduleContainer');
  container.innerHTML = ''; // Clear existing
  
  if (!currentScheduleData || currentScheduleData.length === 0) {
    container.innerHTML = '<div class="no-data">Tidak ada jadwal untuk jam ini</div>';
    return;
  }
  
  // Sort by kelas
  currentScheduleData.sort((a, b) => {
    const kelasOrder = ['7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B', '9C', 
                        '7D', '7E', '7F', '7G', '8D', '8E', '8F', '8G', '8H', 
                        '9D', '9E', '9F', '9G', '9H'];
    return kelasOrder.indexOf(a.kelas) - kelasOrder.indexOf(b.kelas);
  });
  
  currentScheduleData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'schedule-card';
    card.innerHTML = `
      <div class="card-header">${item.kelas}</div>
      <div class="card-mapel">${item.mapelShort}</div>
      <div class="card-guru">${item.namaGuru}</div>
    `;
    container.appendChild(card);
  });
}

// 8. Get Current Schedule Helper
function getCurrentSchedule(hari, jamKe, shift) {
  return globalJadwalProcessed.filter(item => 
    item.hari === hari && 
    item.jamKe === String(jamKe) && 
    item.shift === shift
  );
}

// 9. Example Full Schedule Modal (filter by shift)
function showFullScheduleForShift(targetShift = 'SEMUA') {
  let filteredData = globalJadwalProcessed;
  
  if (targetShift !== 'SEMUA') {
    filteredData = globalJadwalProcessed.filter(item => item.shift === targetShift);
  }
  
  // Group by Hari and Jam
  const grouped = {};
  filteredData.forEach(item => {
    const key = `${item.hari}-${item.jamKe}`;
    if (!grouped[key]) {
      grouped[key] = {
        hari: item.hari,
        jamKe: item.jamKe,
        schedules: []
      };
    }
    grouped[key].schedules.push(item);
  });
  
  // Render to modal
  const modalContent = document.getElementById('fullScheduleContent');
  modalContent.innerHTML = '';
  
  Object.values(grouped).forEach(group => {
    const section = document.createElement('div');
    section.className = 'schedule-section';
    section.innerHTML = `
      <h3>${group.hari} - Jam Ke-${group.jamKe}</h3>
      <div class="schedule-grid">
        ${group.schedules.map(item => `
          <div class="schedule-item">
            <strong>${item.kelas}</strong><br>
            ${item.mapelShort}<br>
            <small>${item.namaGuru}</small>
          </div>
        `).join('')}
      </div>
    `;
    modalContent.appendChild(section);
  });
  
  // Show modal
  document.getElementById('fullScheduleModal').style.display = 'block';
}

// 10. Utility: Debug Current State
function debugCurrentState() {
  console.log('=== DEBUG: CURRENT STATE ===');
  console.log('DB_ASC rows:', globalDbAscData.length);
  console.log('DB_GURU rows:', globalDbGuruData.length);
  console.log('Guru lookup map size:', globalGuruLookupMap?.size);
  console.log('Processed jadwal entries:', globalJadwalProcessed.length);
  console.log('Sample processed entry:', globalJadwalProcessed[0]);
  console.log('============================');
}
```

---

## 🎯 Migration Checklist untuk Developer

### Phase 1: Persiapan ✅
- [x] Sheet DB_ASC dibuat
- [x] Sheet DB_GURU_MAPEL dibuat
- [x] Data validation completed
- [x] Backup DATABASE lama

### Phase 2: Code Implementation 🔄
- [ ] Update constants & endpoints
- [ ] Add new global variables
- [ ] Implement `createGuruLookupMap()`
- [ ] Implement `lookupGuruInfo()`
- [ ] Implement `processJadwalWithLookup()`
- [ ] Update `fetchData()` function
- [ ] Update render functions
- [ ] Add validation functions
- [ ] Update filter logic
- [ ] Test locally

### Phase 3: Testing 🧪
- [ ] Test data fetching
- [ ] Test lookup performance
- [ ] Test schedule rendering
- [ ] Test modal full schedule
- [ ] Test announcement feature
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Validate all kelas displayed

### Phase 4: Deployment 🚀
- [ ] Commit changes to git
- [ ] Push to repository
- [ ] Verify Netlify deployment
- [ ] Monitor console errors
- [ ] Check production data
- [ ] Backup old code

### Phase 5: Monitoring 📊
- [ ] Monitor for 1 week
- [ ] Check error logs
- [ ] Gather user feedback
- [ ] Fix bugs if any
- [ ] Performance optimization

### Phase 6: Cleanup 🧹
- [ ] Remove old DATABASE references
- [ ] Update documentation
- [ ] Archive old code
- [ ] Delete old endpoints (optional)

---

## 🔧 Optimization Tips

### 1. Cache Lookup Map
```javascript
// Store lookup map in memory, rebuild only when data changes
let cachedGuruMapTimestamp = null;

function getGuruLookupMap(dbGuruData) {
  const currentTimestamp = Date.now();
  
  // Rebuild cache every 5 minutes or on demand
  if (!globalGuruLookupMap || 
      !cachedGuruMapTimestamp || 
      (currentTimestamp - cachedGuruMapTimestamp) > 300000) {
    
    globalGuruLookupMap = createGuruLookupMap(dbGuruData);
    cachedGuruMapTimestamp = currentTimestamp;
    console.log('🔄 Guru lookup map refreshed');
  }
  
  return globalGuruLookupMap;
}
```

### 2. Lazy Loading for Full Schedule
```javascript
// Don't process all data upfront, only when modal opened
let fullScheduleCache = null;

function showFullSchedule(targetShift) {
  if (!fullScheduleCache) {
    console.log('Processing full schedule...');
    fullScheduleCache = processJadwalWithLookup(
      globalDbAscData, 
      globalGuruLookupMap
    );
  }
  
  // Filter and render
  renderFullSchedule(fullScheduleCache, targetShift);
}
```

### 3. Debounce Frequent Operations
```javascript
// Debounce untuk avoid excessive processing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage
const debouncedFetch = debounce(fetchData, 500);
```

---

## 📖 Additional Resources

### Testing Queries
```javascript
// Console commands untuk testing

// 1. Fetch dan lihat response
fetch('https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/DB_ASC')
  .then(r => r.json())
  .then(d => console.table(d.slice(0, 5)));

// 2. Test lookup
const testCode = 'BAR.23';
const result = lookupGuruInfo(testCode, globalGuruLookupMap);
console.log('Lookup result:', result);

// 3. Count entries per shift
const pagiCount = globalJadwalProcessed.filter(i => i.shift === 'PUTRA').length;
const siangCount = globalJadwalProcessed.filter(i => i.shift === 'PUTRI').length;
console.log(`Pagi: ${pagiCount}, Siang: ${siangCount}`);

// 4. List unique mapel
const uniqueMapel = [...new Set(globalJadwalProcessed.map(i => i.mapelShort))];
console.log('Unique mapel:', uniqueMapel.sort());

// 5. Find guru with most classes
const guruClassCount = {};
globalJadwalProcessed.forEach(i => {
  guruClassCount[i.namaGuru] = (guruClassCount[i.namaGuru] || 0) + 1;
});
console.table(
  Object.entries(guruClassCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
);
```

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot read property 'KODE_DB_ASC' of undefined` | Row kosong atau format salah | Add null check |
| `Guru not found for kode: XXX` | Kode tidak ada di DB_GURU_MAPEL | Tambahkan ke sheet |
| `TypeError: lookupMap.get is not a function` | Map belum initialized | Check `createGuruLookupMap()` called |
| Schedule tidak muncul | Field name mismatch | Use `getFieldValue()` helper |
| Performance lambat | Lookup di loop besar | Use Map instead of array.find() |

---

## 🎓 Best Practices

### DO ✅
- Always validate data before processing
- Use Map for O(1) lookups
- Cache expensive operations
- Log meaningful debug info
- Handle empty/null values gracefully
- Test with real data
- Monitor performance
- Document code changes

### DON'T ❌
- Don't use nested loops for lookup
- Don't fetch data too frequently
- Don't assume field names
- Don't skip error handling
- Don't process all data if not needed
- Don't forget to update documentation
- Don't deploy without testing
- Don't remove backups too early

---

## 📞 Support & Help

### Jika Menemui Masalah

1. **Check Console First**
   ```javascript
   // Run di browser console
   debugCurrentState();
   validateDataIntegrity();
   ```

2. **Verify Data Source**
   - Buka Google Sheets langsung
   - Check DB_ASC dan DB_GURU_MAPEL ada
   - Verify data format sesuai

3. **Test API Endpoints**
   ```bash
   # Test di browser atau Postman
   https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/DB_ASC
   ```

4. **Check Network Tab**
   - F12 → Network
   - Filter: Fetch/XHR
   - Verify 200 OK responses

5. **Contact Developer**
   - Include console logs
   - Include screenshot
   - Include steps to reproduce

---

## 📝 Change Log

### Version 2.0.0 - Desember 2024
**BREAKING CHANGES:**
- ✨ Sheet DATABASE dipecah menjadi DB_ASC + DB_GURU_MAPEL
- ✨ Implementasi lookup pattern untuk data guru
- ✨ Optimasi performance dengan Map lookup
- ✨ JUMAT dihapus dari jadwal (6 hari saja)
- 🔧 Field name changes: "Jam Ke-" → "Jam-Ke"
- 🔧 Endpoint baru untuk DB_ASC dan DB_GURU_MAPEL

**Migration Impact:**
- 🔴 HIGH: Core data processing functions must be rewritten
- 🟡 MEDIUM: Render functions need adjustment
- 🟢 LOW: UI/Theme system tidak terpengaruh

---

## 🏁 Conclusion

Migrasi ini adalah **breaking change** yang signifikan namun memberikan:
- ✅ Struktur data lebih clean dan maintainable
- ✅ Performance lebih baik dengan lookup optimization
- ✅ Flexibility untuk update guru info
- ✅ Scalability untuk future features

**Estimated Migration Time:** 4-6 jam untuk full implementation & testing

**Risk Level:** 🟡 MEDIUM - Perlu testing menyeluruh sebelum production

**Rollback Plan:** Revert ke endpoint DATABASE lama jika critical issues

---

**Last Updated:** Desember 2024  
**Migration Status:** 🔄 IN PROGRESS  
**Document Version:** 1.0.0  
**Author:** AI Development Agent

---

## 📚 Appendix

### A. Complete Field Mapping

| Sheet | Field Name | Data Type | Example | Notes |
|-------|-----------|-----------|---------|-------|
| DB_ASC | HARI | String | "SABTU" | 6 values only |
| DB_ASC | Jam-Ke | String/Number | "1" | 1-7 |
| DB_ASC | 7A-9H | String | "BAR.23" | Kode mapel |
| DB_GURU_MAPEL | KODE_GURU | String | "02" | 2 digit |
| DB_GURU_MAPEL | NAMA GURU | String | "Heru Yulianto M.Pd" | Full name |
| DB_GURU_MAPEL | KODE_DB_ASC | String | "ING.02" | Foreign key |
| DB_GURU_MAPEL | MAPEL_LONG | String | "B. INGGRIS" | Full name |
| DB_GURU_MAPEL | MAPEL_SHORT | String | "B.INGG" | Display name |
| DB_GURU_MAPEL | NO. WA | String | "6285335842568" | WhatsApp |

### B. Example Data Flows

**Flow 1: Display Current Schedule**
```
User opens page
    ↓
fetchData() called
    ↓
Fetch DB_ASC + DB_GURU_MAPEL in parallel
    ↓
Create guru lookup map (Map<kode, info>)
    ↓
Process: for each row in DB_ASC
    for each kelas in row
        lookup guru info from map
        create schedule entry
    ↓
Filter by current hari + jamKe + shift
    ↓
Render to UI
```

**Flow 2: Show Full Schedule Modal**
```
User clicks "Lihat Jadwal Lengkap"
    ↓
Get all processed jadwal from globalJadwalProcessed
    ↓
Filter by shift (if specified)
    ↓
Group by hari + jamKe
    ↓
Render grouped data to modal
    ↓
Show modal
```

**Flow 3: Announce Schedule**
```
Timer triggers or user clicks announce
    ↓
Get current schedule entries
    ↓
For each entry: speak "Kelas X, Mapel Y, Guru Z"
    ↓
Play closing audio
```

---

**END OF MIGRATION.md**