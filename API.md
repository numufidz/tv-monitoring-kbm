# API.md - Dokumentasi API dan Data Integration

**Referensi lengkap untuk integrasi dengan Google Sheets**

---

## 📡 API Overview

### Service Provider
- **Name:** OpenSheet
- **URL:** https://opensheet.elk.sh
- **Documentation:** https://github.com/ashtosh/opensheet
- **License:** MIT
- **Type:** Free JSON API Gateway for Google Sheets

### Purpose
OpenSheet adalah service yang mentranslate Google Sheets ke JSON API dengan CORS support, sehingga memudahkan frontend apps untuk membaca data Sheets.

---

## 🔑 Google Sheets Configuration

### Spreadsheet Details
```
ID:     1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I
Name:   [Nama sekolah] - Jadwal KBM
Access: Public (Share > Anyone with link > Viewer)
Owner:  [School Admin Email]
```

### Sheets dalam Spreadsheet

| DATABASE | Master jadwal pelajaran | 50+ | 25 | Daily | ❌ DEPRECATED - Use DB_ASC |
| DB_ASC | Master jadwal (WIDE format) | 42 | 25 | Daily | ✅ NEW - Active v2.0 |
| DB_GURU_MAPEL | Master guru data | 100+ | 6 | Daily | ✅ NEW - v2.0 lookup |
| KELAS_SHIFT | Class-to-shift mapping | 23 | 2 | Semester | ✅ NEW - v2.0 helper |
| PERIODE BEL | Jadwal waktu regular | 14 | 4 | Semester | ✅ Active |
| BEL KHUSUS | Jadwal khusus Kamis | 14 | 4 | Semester | ✅ Active |
| PIKET | Guru piket duty roster | 10+ | 3 | Monthly | ✅ Active |

---

## 📊 API Endpoints

### Endpoint List (v2.0 - 6 Total)

#### 0. DB_ASC - Master Schedule (WIDE Format) ✅ NEW v2.0
```
URL:    https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/DB_ASC
Method: GET
Auth:   None
CORS:   Enabled
Status: ✅ ACTIVE - Primary schedule source
```

**Response Format:**
```json
[
  {
    "HARI": "SABTU",
    "Jam-Ke": "1",
    "7A": "BAR.23",
    "7B": "ASW.37",
    "7C": "ING.35",
    "8A": "MTK.44",
    "8B": "IPA.55",
    "8C": "B.IN.06",
    "9A": "AGL.99",
    "9B": "OL.33",
    "9C": "PKN.22",
    "7D": "ASW.37",
    "7E": "FIQ.18",
    "7F": "HAD.25",
    "7G": "ING.02",
    "8D": "MTK.77",
    "8E": "IPA.88",
    "8F": "SEJ.44",
    "8G": "BIO.55",
    "8H": "KIM.66",
    "9D": "AGL.99",
    "9E": "OL.33",
    "9F": "PKN.22",
    "9G": "B.IN.06",
    "9H": "B.IB.11"
  }
]
```

**Key Differences from DATABASE:**
- Column name: `Jam-Ke` (with dash) instead of `Jam Ke-`
- Only 6 days (no JUMAT) - 42 rows total
- Kode format: `[INITIAL].[NUMBER]` (lookup key to DB_GURU_MAPEL)
- Values are **ONLY kode mapel**, not guru info
- Used with DB_GURU_MAPEL for lookup

---

#### 0.5 DB_GURU_MAPEL - Master Guru Data ✅ NEW v2.0
```
URL:    https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/DB_GURU_MAPEL
Method: GET
Auth:   None
CORS:   Enabled
Status: ✅ ACTIVE - Lookup source for guru info
```

**Response Format:**
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
  },
  {
    "KODE_GURU": "03",
    "NAMA GURU": "Drs. Suwarno",
    "KODE_DB_ASC": "SKU.03",
    "MAPEL_LONG": "SKU UBUDIYAH",
    "MAPEL_SHORT": "S K U",
    "NO. WA": "6282301290112"
  }
]
```

**Key Features:**
- Primary key: `KODE_DB_ASC` (for lookup from DB_ASC)
- One guru can have multiple mapel (same phone, different kode)
- Centralized guru data - update once, use everywhere
- O(1) lookup via hash map

---

#### 0.75 KELAS_SHIFT - Class-to-Shift Mapping ✅ NEW v2.0
```
URL:    https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/KELAS_SHIFT
Method: GET
Auth:   None
CORS:   Enabled
Status: ✅ ACTIVE - Dynamic shift configuration
```

**Response Format:**
```json
[
  {"KELAS": "7A", "SHIFT": "PUTRA"},
  {"KELAS": "7B", "SHIFT": "PUTRA"},
  {"KELAS": "7C", "SHIFT": "PUTRA"},
  {"KELAS": "8A", "SHIFT": "PUTRA"},
  {"KELAS": "8B", "SHIFT": "PUTRA"},
  {"KELAS": "8C", "SHIFT": "PUTRA"},
  {"KELAS": "9A", "SHIFT": "PUTRA"},
  {"KELAS": "9B", "SHIFT": "PUTRA"},
  {"KELAS": "9C", "SHIFT": "PUTRA"},
  {"KELAS": "7D", "SHIFT": "PUTRI"},
  {"KELAS": "7E", "SHIFT": "PUTRI"},
  {"KELAS": "7F", "SHIFT": "PUTRI"},
  {"KELAS": "7G", "SHIFT": "PUTRI"},
  {"KELAS": "8D", "SHIFT": "PUTRI"},
  {"KELAS": "8E", "SHIFT": "PUTRI"},
  {"KELAS": "8F", "SHIFT": "PUTRI"},
  {"KELAS": "8G", "SHIFT": "PUTRI"},
  {"KELAS": "8H", "SHIFT": "PUTRI"},
  {"KELAS": "9D", "SHIFT": "PUTRI"},
  {"KELAS": "9E", "SHIFT": "PUTRI"},
  {"KELAS": "9F", "SHIFT": "PUTRI"},
  {"KELAS": "9G", "SHIFT": "PUTRI"},
  {"KELAS": "9H", "SHIFT": "PUTRI"}
]
```

**Benefits:**
- Dynamic class assignment (change shift without code redeploy)
- Future-proof for class reorganization
- Single source of truth for class-shift mapping

---

#### 1. DATABASE - DEPRECATED ❌
```
URL:    https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/DATABASE
Status: ❌ DEPRECATED
Reason: Replaced by DB_ASC + DB_GURU_MAPEL (v2.0)
Migration: See MIGRATION.md
Timeline: Will be removed after 1 month stability period

⚠️ Do NOT use this endpoint in new code.
⚠️ Use DB_ASC + DB_GURU_MAPEL instead.
```
```
URL:    https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/PERIODE%20BEL
Method: GET
Auth:   None
CORS:   Enabled
```

**Response Format:**
```json
[
  {
    "Shift": "PUTRA",
    "Jam Ke-": "1",
    "Jam Mulai": "06:30",
    "Jam Selesai": "07:15"
  },
  {
    "Shift": "PUTRA",
    "Jam Ke-": "2",
    "Jam Mulai": "07:15",
    "Jam Selesai": "08:00"
  },
  {
    "Shift": "PUTRA",
    "Jam Ke-": "3",
    "Jam Mulai": "08:00",
    "Jam Selesai": "08:45"
  },
  {
    "Shift": "PUTRA",
    "Jam Ke-": "IST",
    "Jam Mulai": "08:45",
    "Jam Selesai": "09:00"
  },
  {
    "Shift": "PUTRA",
    "Jam Ke-": "4",
    "Jam Mulai": "09:00",
    "Jam Selesai": "09:45"
  },
  {
    "Shift": "PUTRA",
    "Jam Ke-": "5",
    "Jam Mulai": "09:45",
    "Jam Selesai": "10:30"
  },
  {
    "Shift": "PUTRA",
    "Jam Ke-": "6",
    "Jam Mulai": "10:30",
    "Jam Selesai": "11:15"
  },
  {
    "Shift": "PUTRA",
    "Jam Ke-": "7",
    "Jam Mulai": "11:15",
    "Jam Selesai": "12:00"
  },
  {
    "Shift": "PUTRI",
    "Jam Ke-": "1",
    "Jam Mulai": "12:30",
    "Jam Selesai": "13:15"
  },
  {
    "Shift": "PUTRI",
    "Jam Ke-": "2",
    "Jam Mulai": "13:15",
    "Jam Selesai": "14:00"
  },
  ...
]
```

**Column Mapping:**
- `Shift`: "PUTRA" (pagi) atau "PUTRI" (siang)
- `Jam Ke-`: "1"-"7" untuk pelajaran, "IST" untuk istirahat
- `Jam Mulai`: Format HH:MM (24-hour)
- `Jam Selesai`: Format HH:MM (24-hour)

#### 4. BEL KHUSUS - Thursday Special Schedule
```
URL:    https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/BEL%20KHUSUS
Method: GET
Auth:   None
CORS:   Enabled
```

**Response Format:** Sama dengan PERIODE BEL

**Used For:**
- Hari Kamis memiliki jadwal bel yang berbeda
- Aplikasi otomatis switch ke sheet ini jika hari === KAMIS

#### 5. PIKET - Duty Teachers
```
URL:    https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/PIKET
Method: GET
Auth:   None
CORS:   Enabled
```

**Response Format:**
```json
[
  {
    "HARI": "SABTU",
    "PIKET SHIFT PAGI": "Ustadz Ahmad",
    "PIKET SHIFT SIANG": "Ustadzah Siti"
  },
  {
    "HARI": "AHAD",
    "PIKET SHIFT PAGI": "Ustadz Budi",
    "PIKET SHIFT SIANG": "Ustadzah Nurul"
  },
  {
    "HARI": "SENIN",
    "PIKET SHIFT PAGI": "Ustadz Chairul",
    "PIKET SHIFT SIANG": "Ustadzah Dwi"
  },
  ...
]
```

**Column Mapping:**
- `HARI`: Nama hari (uppercase)
- `PIKET SHIFT PAGI`: Nama guru piket shift pagi
- `PIKET SHIFT SIANG`: Nama guru piket shift siang

---

## 🔄 Fetch Implementation

### Complete Fetch Flow (v2.0 - WITH LOOKUP)
```javascript
async function fetchData(forceAnnounce = false) {
  try {
    // 1. Calculate current time with offsets
    const now = new Date();
    now.setHours(now.getHours() + timeOffset);
    now.setMinutes(now.getMinutes() + timeOffsetMinutes);
    now.setDate(now.getDate() + dayOffset);

    const jam = now.getHours();
    const menit = now.getMinutes();
    let hari = now.toLocaleDateString('id-ID', { weekday: 'long' }).toUpperCase();
    
    // Normalize day names
    if (hari === 'MINGGU') hari = 'AHAD';
    
    const shift = jam < 12 ? 'PUTRA' : 'PUTRI';
    const timeNow = `${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}`;

    // 2. Parallel fetch all 6 endpoints (v2.0)
    const [dataDbAsc, dataDbGuru, dataKelasShift, dataBel, dataBelK, dataPiket] = await Promise.all([
      fetch(endpointDbAsc).then(r => r.json()),
      fetch(endpointDbGuru).then(r => r.json()),
      fetch(endpointKelasShift).then(r => r.json()),
      fetch(endpointBel).then(r => r.json()),
      fetch(endpointBelKhusus).then(r => r.json()),
      fetch(endpointPiket).then(r => r.json())
    ]);

    // 3. Store globally
    globalDbAscData = dataDbAsc;
    globalDbGuruData = dataDbGuru;
    globalKelasShiftData = dataKelasShift;
    globalBelData = dataBel;
    globalBelKhususData = dataBelK;
    globalPiketData = dataPiket;

    // 4. NEW: Create lookup map for performance (O(1) instead of O(n))
    globalGuruLookupMap = createGuruLookupMap(dataDbGuru);

    // 5. NEW: Process jadwal with lookup (transform DB_ASC using DB_GURU_MAPEL)
    globalJadwalProcessed = processJadwalWithLookup(dataDbAsc, globalGuruLookupMap);

    // 6. Determine which BEL sheet to use
    const isKamis = hari === 'KAMIS';
    const belData = isKamis ? dataBelK : dataBel;

    // 7. Update UI shift indicator
    shiftKBM.textContent = `KBM ${shift}`;

    // 8. Find current period
    const belHariIni = belData.filter(p => p.Shift === shift);
    const periode = belHariIni.find(p => 
      timeNow >= p['Jam Mulai'] && 
      timeNow <= p['Jam Selesai']
    );

    // 9. Check if in KBM period
    const isInKBMPeriod = periode && periode['Jam Ke-'] !== 'IST';

    // 10. Update duty teacher
    await updateGuruPiket(hari, jam, isInKBMPeriod);

    // 11. Handle different cases
    if (!periode) {
      // No bell period
      angkaKe.textContent = '-';
      periodeJam.textContent = '-';
      gridContainer.innerHTML = '<div>Tidak ada KBM saat ini</div>';
      return;
    }

    if (periode['Jam Ke-'] === 'IST') {
      // Break time
      angkaKe.textContent = 'IST';
      periodeJam.textContent = `${periode['Jam Mulai']} - ${periode['Jam Selesai']}`;
      gridContainer.innerHTML = '<div>Sedang istirahat</div>';
      return;
    }

    // 12. KBM in progress - render schedule
    const jamKe = periode['Jam Ke-'];
    const jamMulai = periode['Jam Mulai'];
    const jamSelesai = periode['Jam Selesai'];
    
    angkaKe.textContent = jamKe;
    periodeJam.textContent = `${jamMulai} - ${jamSelesai}`;

    // 13. NEW: Filter processed jadwal (already has guru info)
    const jadwal = getCurrentSchedule(hari, jamKe, shift);

    if (jadwal.length === 0) {
      gridContainer.innerHTML = '<div>Tidak ada data jadwal untuk jam ini</div>';
      return;
    }

    // 14. Render cards
    renderJadwal(jadwal);

    // 15. Announce if period changed
    if (jamKe !== lastAnnouncedJamKe || forceAnnounce) {
      lastAnnouncedJamKe = jamKe;
      announceSchedule(jadwal, jamKe, shift, isKamis);
    }

  } catch (error) {
    console.error('Fetch error:', error);
    gridContainer.innerHTML = `<div style="color: red;">Gagal memuat data.<br><small>${error.message}</small></div>`;
  }
}
```

### Parallel Request Pattern
```javascript
const [dataA, dataB, dataC, dataD] = await Promise.all([
  fetch(url1).then(r => r.json()),
  fetch(url2).then(r => r.json()),
  fetch(url3).then(r => r.json()),
  fetch(url4).then(r => r.json())
]);

// Benefits:
// - Faster: All 4 requests run simultaneously
// - vs Sequential: Would be 4x slower
// - Typical: 500-1000ms parallel vs 2-4 seconds sequential
```

---

## � Data Filtering Logic (v2.0 - WITH LOOKUP)

### Lookup Pattern (O(1) Hash Map)
```javascript
// Step 1: Create lookup map once after fetch (O(n) one-time cost)
function createGuruLookupMap(dbGuruData) {
  const lookupMap = new Map();
  dbGuruData.forEach(row => {
    const kode = row['KODE_DB_ASC'];
    if (kode) {
      lookupMap.set(kode, {
        namaGuru: row['NAMA GURU'],
        mapelLong: row['MAPEL_LONG'],
        mapelShort: row['MAPEL_SHORT'],
        noWa: row['NO. WA']
      });
    }
  });
  return lookupMap;
}

// Step 2: Use map for O(1) lookups
const guruInfo = lookupMap.get('ING.02');  // ~0.001ms
// Result: {namaGuru: "Heru Yulianto", mapelShort: "B.INGG", ...}
```

### Process Jadwal With Lookup
```javascript
function processJadwalWithLookup(dbAscData, guruLookupMap) {
  const processed = [];
  const kelasPagi = ['7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B', '9C'];
  const kelasSiang = ['7D', '7E', '7F', '7G', '8D', '8E', '8F', '8G', '8H', '9D', '9E', '9F', '9G', '9H'];
  const allKelas = [...kelasPagi, ...kelasSiang];
  
  dbAscData.forEach(row => {
    const hari = row['HARI'];
    const jamKe = row['Jam-Ke'];
    
    allKelas.forEach(kelas => {
      const kodeDbAsc = row[kelas];
      
      if (kodeDbAsc && kodeDbAsc.trim() !== '') {
        const guruInfo = guruLookupMap.get(kodeDbAsc);
        
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
        } else {
          console.warn(`Guru not found for kode: ${kodeDbAsc}`);
        }
      }
    });
  });
  
  return processed;
}
```

### Filter by Hari + Jam Ke + Shift (Simple After Processing)
```javascript
function getCurrentSchedule(hari, jamKe, shift) {
  // Simple filter - data already processed and joined
  return globalJadwalProcessed.filter(item => 
    item.hari === hari && 
    item.jamKe === String(jamKe) && 
    item.shift === shift
  );
  
  // Returns: [{kelas: '7A', namaGuru: 'Heru Yulianto', mapelShort: 'B.INGG', ...}, ...]
}
```

---

## ❌ Error Handling

### Common Errors

#### 1. Network Error
```javascript
catch (error) {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    // Network unreachable
    console.error('Network error - no internet?');
  }
}
```

#### 2. JSON Parse Error
```javascript
const response = await fetch(url);
if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}
const data = await response.json();  // Can throw SyntaxError
```

#### 3. Sheet Not Found
```
Response: 200 OK
Body: []  // Empty array

Result: All .find() return undefined
Solution: Check sheet name spelling
```

#### 4. Column Name Mismatch
```javascript
// Unsafe:
const value = row['Jam Ke-'];  // Undefined if actual is 'Jam Ke'

// Safer:
const value = row['Jam Ke-'] || row['Jam Ke'] || row['JamKe'];
```

---

## 📈 Performance Optimization

### Caching Strategy (Not Implemented Yet)
```javascript
let dataCache = {
  database: null,
  bel: null,
  belKhusus: null,
  piket: null,
  timestamp: 0
};

const CACHE_DURATION = 60000; // 1 minute

async function fetchWithCache(endpoint, key) {
  const now = Date.now();
  if (dataCache[key] && (now - dataCache.timestamp) < CACHE_DURATION) {
    return dataCache[key];
  }
  
  const data = await fetch(endpoint).then(r => r.json());
  dataCache[key] = data;
  dataCache.timestamp = now;
  return data;
}
```

### Request Deduplication (Not Implemented Yet)
```javascript
let pendingRequests = new Map();

async function fetchUnique(endpoint, key) {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);  // Return existing promise
  }
  
  const promise = fetch(endpoint).then(r => r.json());
  pendingRequests.set(key, promise);
  
  promise.finally(() => {
    pendingRequests.delete(key);  // Clean up
  });
  
  return promise;
}
```

---

## 📝 Data Format Reference

### Kode Mapel Format
```
FORMAT: [INITIAL].[NUMBER]
Examples:
  ASW.37   = Akidah Akhlak, Teacher ID 37
  ING.02   = Bahasa Inggris, Teacher ID 2
  QUR.11   = Quran Hadist, Teacher ID 11
  MTK.44   = Matematika, Teacher ID 44
  B.IN.06  = Bahasa Indonesia, Teacher ID 6
  OL.33    = Olahraga, Teacher ID 33
  PKN.22   = PKN, Teacher ID 22
  AGL.99   = Agama/Akhlak, Teacher ID 99
  FIQ.18   = Fiqih, Teacher ID 18
  HAD.25   = Hadist, Teacher ID 25
  SEJ.44   = Sejarah, Teacher ID 44
  BIO.55   = Biologi, Teacher ID 55
  KIM.66   = Kimia, Teacher ID 66
  B.IB.11  = Bahasa Ibrani, Teacher ID 11
```

### Time Format
```
Clock:     HH:MM   (24-hour, e.g., 07:30, 14:45)
Jam Ke-:   Single digit (1, 2, 3, 4, 5, 6, 7)
           or "IST" for break
Day:       Indonesian name (SABTU, AHAD, SENIN, SELASA, RABU, KAMIS, JUMAT)
           Uppercase only
```

---

## 🧪 Testing with cURL

### Test Individual Endpoints
```bash
# Test DATABASE
curl -s https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/DATABASE | jq '.[] | select(.Hari == "SABTU" and .["Jam Ke-"] == "1")'

# Test PERIODE BEL
curl -s https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/PERIODE%20BEL | jq '.[] | select(.Shift == "PUTRA")'

# Test PIKET
curl -s https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/PIKET | jq '.'

# Count rows
curl -s https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/DATABASE | jq 'length'
```

---

## 🔗 Integration Checklist

- [ ] Google Sheets publicly shared
- [ ] All sheet names match exactly (case-sensitive)
- [ ] Column names match in code
- [ ] API endpoints reachable
- [ ] CORS working (test in browser console)
- [ ] Response format matches expected
- [ ] Error handling in place
- [ ] Manual testing completed

---

**Last Updated:** Desember 2025  
**API Version:** 2.0 (OpenSheet + Lookup Pattern)  
**Documentation Version:** 2.0

