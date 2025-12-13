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

| Sheet Name | Purpose | Rows | Columns | Update Frequency |
|-----------|---------|------|---------|------------------|
| DATABASE | Master jadwal pelajaran | 50+ | 25 | Daily |
| PERIODE BEL | Jadwal waktu regular | 14 | 4 | Semester |
| BEL KHUSUS | Jadwal khusus Kamis | 14 | 4 | Semester |
| PIKET | Guru piket duty roster | 10+ | 3 | Monthly |

---

## 📊 API Endpoints

### Endpoint Pattern
```
https://opensheet.elk.sh/{SPREADSHEET_ID}/{SHEET_NAME}
```

### Endpoint List

#### 1. DATABASE - Master Schedule
```
URL:    https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/DATABASE
Method: GET
Auth:   None
CORS:   Enabled
```

**Response Format:**
```json
[
  {
    "Hari": "SABTU",
    "Jam Ke-": "1",
    "7A": "ASW.37",
    "7B": "ING.02",
    "7C": "QUR.11",
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
  },
  {
    "Hari": "SABTU",
    "Jam Ke-": "2",
    "7A": "ING.02",
    ...
  }
]
```

**Column Mapping:**
- `Hari`: Hari pelajaran (SABTU, AHAD, SENIN, SELASA, RABU, KAMIS, JUMAT)
- `Jam Ke-`: Nomor jam (1, 2, 3, 4, 5, 6, 7)
- `7A-9C`: 9 kelas shift pagi (PUTRA)
- `7D-9H`: 14 kelas shift siang (PUTRI)
- Cell values: Kode mapel format `[INITIAL].[NUMBER]`

**Example Kode Mapel:**
```
ASW.37  = Akidah Akhlak, Teacher #37
ING.02  = Bahasa Inggris, Teacher #2
QUR.11  = Quran Hadist, Teacher #11
MTK.44  = Matematika, Teacher #44
```

#### 2. PERIODE BEL - Regular Bell Schedule
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

#### 3. BEL KHUSUS - Thursday Special Schedule
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

#### 4. PIKET - Duty Teachers
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

### Complete Fetch Flow
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

    // 2. Parallel fetch all 4 endpoints
    const [dataDB, dataBel, dataBelK, dataPiket] = await Promise.all([
      fetch(endpointDatabase).then(r => r.json()),
      fetch(endpointBel).then(r => r.json()),
      fetch(endpointBelKhusus).then(r => r.json()),
      fetch(endpointPiket).then(r => r.json())
    ]);

    // 3. Store globally
    globalBelData = dataBel;
    globalBelKhususData = dataBelK;
    globalJadwalData = dataDB;

    // 4. Determine which BEL sheet to use
    const isKamis = hari === 'KAMIS';
    const belData = isKamis ? dataBelK : dataBel;

    // 5. Update UI shift indicator
    shiftKBM.textContent = `KBM ${shift}`;

    // 6. Find current period
    const belHariIni = belData.filter(p => p.Shift === shift);
    const periode = belHariIni.find(p => 
      timeNow >= p['Jam Mulai'] && 
      timeNow <= p['Jam Selesai']
    );

    // 7. Check if in KBM period
    const isInKBMPeriod = periode && periode['Jam Ke-'] !== 'IST';

    // 8. Update duty teacher
    await updateGuruPiket(hari, jam, isInKBMPeriod);

    // 9. Handle different cases
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

    // 10. KBM in progress - render schedule
    const jamKe = periode['Jam Ke-'];
    const jamMulai = periode['Jam Mulai'];
    const jamSelesai = periode['Jam Selesai'];
    
    angkaKe.textContent = jamKe;
    periodeJam.textContent = `${jamMulai} - ${jamSelesai}`;

    // 11. Filter schedule for current period
    const jadwal = filterSchedule(dataDB, jamKe, shift, hari);

    if (jadwal.length === 0) {
      gridContainer.innerHTML = '<div>Tidak ada data jadwal untuk jam ini</div>';
      return;
    }

    // 12. Render cards
    renderJadwal(jadwal);

    // 13. Announce if period changed
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

## 🔍 Data Filtering Logic

### Filter by Hari + Jam Ke- + Shift
```javascript
function filterSchedule(dbData, jamKe, shift, hari) {
  // 1. Find matching row
  const row = dbData.find(r => 
    r['Hari'].trim().toUpperCase() === hari &&
    r['Jam Ke-'].trim() === jamKe
  );
  
  if (!row) return [];

  // 2. Determine which kelas for this shift
  const kelasMap = shift === 'PUTRA'
    ? {
        '7A': row['7A'],
        '7B': row['7B'],
        '7C': row['7C'],
        '8A': row['8A'],
        '8B': row['8B'],
        '8C': row['8C'],
        '9A': row['9A'],
        '9B': row['9B'],
        '9C': row['9C']
      }
    : {
        '7D': row['7D'],
        '7E': row['7E'],
        '7F': row['7F'],
        '7G': row['7G'],
        '8D': row['8D'],
        '8E': row['8E'],
        '8F': row['8F'],
        '8G': row['8G'],
        '8H': row['8H'],
        '9D': row['9D'],
        '9E': row['9E'],
        '9F': row['9F'],
        '9G': row['9G'],
        '9H': row['9H']
      };

  // 3. Extract non-empty values
  const jadwal = [];
  Object.entries(kelasMap).forEach(([kelas, kode]) => {
    if (kode && kode.trim()) {
      jadwal.push({
        Kelas: kelas,
        Kode: kode.trim(),
        'Nama Mapel': 'TBD',  // Would need lookup
        'Nama Lengkap Guru': 'TBD'
      });
    }
  });

  return jadwal;
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

**Last Updated:** Desember 2024
**API Version:** 1.0 (OpenSheet)
**Documentation Version:** 1.0

