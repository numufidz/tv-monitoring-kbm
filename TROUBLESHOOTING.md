# TROUBLESHOOTING.md - Panduan Troubleshooting & Deployment

**Panduan lengkap untuk diagnosis masalah dan deployment aplikasi**

---

## 🔧 Troubleshooting Guide

### Common Issues

---

## ❌ Issue #1: Tidak Ada Jadwal yang Ditampilkan

### Symptoms
- Halaman blank atau "Tidak ada data jadwal"
- Grid kosong meskipun seharusnya ada KBM
- Hanya muncul 3 kelas (7A, 7D, 9H) dari seharusnya 9-14

### Diagnosis Flowchart
```
Start
  ↓
Is it KBM time? (Check periodeJam display)
  ├─ No → Correct, no KBM outside working hours
  ├─ Yes → Continue
  ↓
Open F12 Developer Tools > Console
  ↓
Check errors (red text)
  ├─ Network error? → Issue #2
  ├─ TypeError? → Issue #3
  ├─ No errors → Continue
  ↓
Type in console: console.log(globalJadwalData?.length)
  ├─ undefined or 0 → Google Sheets not accessible
  ├─ > 0 → Data loaded, filtering problem
  ↓
Trace filtering logic:
  - Check current hari, jamKe, shift values
  - Verify they match spreadsheet values
  - Check for case sensitivity
```

### Solutions

#### Solution 1a: Check Google Sheets Access
```javascript
// In console:
fetch('https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/DATABASE')
  .then(r => r.json())
  .then(data => console.log('Success:', data.length, 'rows'))
  .catch(e => console.error('Error:', e));
```

**Expected Output:**
```
Success: 56 rows  (7 days × 8 periods)
```

**If you see error:**
- Check Google Sheets is public (Share > Anyone with link > Viewer)
- Verify Spreadsheet ID is correct
- Try accessing in incognito window

#### Solution 1b: Verify Column Names Match
```javascript
// In console:
console.log(globalJadwalData[0]);  // Print first row

// Look for:
// - "Hari" column
// - "Jam Ke-" column (with dash!)
// - "7A", "7B", etc. columns
```

**Common Issues:**
- Column named "Jam Ke" (no dash) instead of "Jam Ke-"
- Column named "JAM KE-" (uppercase)
- Extra spaces in column names

#### Solution 1c: Check Day Name Normalization
```javascript
// In console:
const now = new Date();
let hari = now.toLocaleDateString('id-ID', { weekday: 'long' }).toUpperCase();
if (hari === 'MINGGU') hari = 'AHAD';
console.log('Current day:', hari);

// Expected: SABTU, AHAD, SENIN, SELASA, RABU, KAMIS, JUMAT
// If spreadsheet uses different names, update code
```

#### Solution 1d: Verify Time Period Exists
```javascript
// In console:
const now = new Date();
const jam = now.getHours();
const menit = now.getMinutes();
const shift = jam < 12 ? 'PUTRA' : 'PUTRI';
const timeNow = `${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}`;

console.log('Current time:', timeNow);
console.log('Current shift:', shift);

// Check PERIODE BEL
const matching = globalBelData?.find(p => 
  p.Shift === shift && 
  timeNow >= p['Jam Mulai'] && 
  timeNow <= p['Jam Selesai']
);
console.log('Matching period:', matching);
```

---

## ❌ Issue #2: Network Error - "Gagal memuat data"

### Symptoms
- Error message shows in red
- F12 > Network tab shows failed requests
- Google Sheets API unreachable

### Root Causes
1. **No internet connection**
2. **OpenSheet service down**
3. **CORS blocked**
4. **Spreadsheet removed/made private**

### Solutions

#### Check Internet
```bash
ping google.com
# If fails: No internet, reconnect to network
```

#### Check OpenSheet Service
```bash
# Visit in browser:
https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/DATABASE

# If shows JSON: Service is up
# If shows error: Service down, wait or use alternative
```

#### Check Spreadsheet Access
```javascript
// Method 1: Direct link test
// Visit: https://docs.google.com/spreadsheets/d/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I

// Should show spreadsheet (no login required)
// If "Access Denied": Not shared properly

// Method 2: Share check
// Right-click spreadsheet > Share
// Should show "Anyone with the link" or "Public"
```

#### Check CORS
```javascript
// In console:
fetch('https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/DATABASE')
  .then(r => {
    console.log('Status:', r.status);
    console.log('Headers:', r.headers);
    return r.json();
  })
  .then(data => console.log('Data:', data.length))
  .catch(e => console.error('CORS Error:', e));
```

---

## ❌ Issue #3: Pengumuman Suara Tidak Bekerja

### Symptoms
- Tombol "Announce Now" diklik tapi tidak ada suara
- Audio intro tidak terdengar
- TTS tidak berfungsi

### Root Causes
1. **Browser muted** (speaker icon in address bar)
2. **Volume sistem 0**
3. **Web Speech API tidak didukung**
4. **Audio file missing** (intro.mp3)
5. **Voices not loaded**

### Solutions

#### Check Browser Audio
```javascript
// In console:
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const audioOutput = devices.filter(d => d.kind === 'audiooutput');
    console.log('Audio devices:', audioOutput.length);
  });
```

#### Check Web Speech API
```javascript
// In console:
if ('speechSynthesis' in window) {
  console.log('Web Speech API available');
  console.log('Voices:', speechSynthesis.getVoices().length);
} else {
  console.error('Web Speech API NOT supported');
}
```

#### Check Intro Audio File
```javascript
// In console:
const audio = new Audio('audio/intro.mp3');
audio.oncanplaythrough = () => console.log('Audio file OK');
audio.onerror = (e) => console.error('Audio file error:', e);
audio.load();

// Or check in DevTools > Network tab:
// Should see audio/intro.mp3 with 200 status
```

#### Verify Voices Loaded
```javascript
// In console:
console.log('Selected voice:', selectedVoice?.name);

// If null:
speechSynthesis.addEventListener('voiceschanged', () => {
  const voices = speechSynthesis.getVoices();
  console.log('Voices loaded:', voices.length);
});

// Manually trigger loadVoices()
loadVoices();
```

#### Test Simple Announcement
```javascript
// In console:
const utterance = new SpeechSynthesisUtterance('Testing');
utterance.lang = 'id-ID';
utterance.rate = 1.15;
if (selectedVoice) utterance.voice = selectedVoice;

utterance.onstart = () => console.log('Speaking...');
utterance.onend = () => console.log('Done');
utterance.onerror = (e) => console.error('Error:', e);

speechSynthesis.speak(utterance);
```

---

## ❌ Issue #4: Theme/Layout Tidak Berubah

### Symptoms
- Theme button clicked tapi background tidak berubah
- Layout class tidak ter-apply
- CSS tidak ter-update

### Root Causes
1. **CSS not loaded**
2. **CSS class not in stylesheet**
3. **Inline style override**
4. **Browser cache**

### Solutions

#### Check CSS Loading
```javascript
// In console:
console.log(document.styleSheets.length);  // Should be > 0

// Check specific stylesheet:
Array.from(document.styleSheets).forEach(ss => {
  console.log('Stylesheet:', ss.href);
});
```

#### Verify Theme Applied
```javascript
// In console:
console.log('Current theme index:', currentTheme);
console.log('Background style:', document.body.style.background);
console.log('Theme array:', themes[currentTheme]);
```

#### Hard Refresh Browser
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
Or: Ctrl + Shift + Delete → Clear cache for this website
```

#### Check Layout Classes
```javascript
// In console:
console.log('Body classes:', document.body.className);
console.log('Applied layout:', layouts[currentLayout]);

// Manually apply:
document.body.classList.add('layout-modern');
```

---

## ❌ Issue #5: Waktu Tidak Akurat

### Symptoms
- Clock menampilkan waktu salah
- Jadwal tidak sesuai dengan waktu actual
- Offset tidak berfungsi

### Solutions

#### Check System Time
```javascript
// In console:
console.log('System time:', new Date());

// Compare with actual time on your device
// If differs > 1 minute: Update system clock
```

#### Check Timezone
```javascript
// In console:
const now = new Date();
console.log('Timezone offset (minutes):', now.getTimezoneOffset());

// Indonesia: Should be -420 (UTC+7)
// If different: Device timezone wrong
```

#### Manual Time Adjustment
```javascript
// Use control panel buttons:
// +H / -H: Adjust hours
// +M / -M: Adjust minutes
// +D / -D: Adjust days

// In console (direct):
timeOffset = 6;  // Add 6 hours
timeOffsetMinutes = 30;  // Add 30 minutes
dayOffset = 1;   // Add 1 day
updateClock();
fetchData();
```

---

## ✅ Issue #6: Only 3 Classes Display Instead of 9-14

### Symptoms
- Morning shows only 7A (should show 7A-9C)
- Afternoon shows only 7D, 9D, 9H (should show 7D-9H)
- Missing classes in grid

### Root Causes
1. **Filter logic too strict** (filtering by shift marker that doesn't exist)
2. **Column names don't match** (hardcoded names different from actual)
3. **Data missing in spreadsheet** (empty cells for some kelas)

### Solutions

#### Check Database Structure
```javascript
// In console:
console.log(globalJadwalData[0]);

// Should see columns:
// "7A", "7B", "7C", ... "9C" for PUTRA
// "7D", "7E", "7F", ... "9H" for PUTRI
```

#### Check Column Values
```javascript
// For SABTU Jam Ke- 1:
const row = globalJadwalData.find(r => r.Hari === 'SABTU' && r['Jam Ke-'] === '1');

// Verify all 23 columns have values
['7A','7B','7C','8A','8B','8C','9A','9B','9C','7D','7E','7F','7G','8D','8E','8F','8G','8H','9D','9E','9F','9G','9H'].forEach(kelas => {
  console.log(kelas, '=', row[kelas]);
});
```

#### Use Direct Class List (Workaround)
```javascript
// Replace filter logic with hardcoded list:
const kelasListPagi = ['7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B', '9C'];
const kelasListSiang = ['7D', '7E', '7F', '7G', '8D', '8E', '8F', '8G', '8H', '9D', '9E', '9F', '9G', '9H'];

// Then extract codes for current shift:
const kelasList = shift === 'PUTRA' ? kelasListPagi : kelasListSiang;
const jadwal = kelasList
  .map(kelas => ({
    Kelas: kelas,
    Kode: row[kelas],
    'Nama Mapel': 'TBD',
    'Nama Lengkap Guru': 'TBD'
  }))
  .filter(item => item.Kode);  // Remove empty
```

---

## 🚀 Deployment Guide

### Prerequisites
- Git installed
- GitHub account
- Netlify account (free)
- Google Sheets public

### Step-by-Step Deployment

#### 1. Setup Git Repository
```bash
cd tv-monitoring-kbm
git init
git add .
git commit -m "Initial commit"
```

#### 2. Create GitHub Repository
```bash
# On GitHub.com:
# 1. Click + icon → New repository
# 2. Name: tv-monitoring-kbm
# 3. Don't initialize (we have local repo)
# 4. Click Create

# In terminal:
git remote add origin https://github.com/YOUR_USERNAME/tv-monitoring-kbm.git
git branch -M main
git push -u origin main
```

#### 3. Connect to Netlify
```bash
# Option A: CLI (if installed)
npm i -g netlify-cli
netlify deploy --prod

# Option B: Web UI (recommended)
# 1. Go to netlify.com
# 2. Login with GitHub
# 3. Click "New site from Git"
# 4. Select GitHub, authorize
# 5. Select repository: tv-monitoring-kbm
# 6. Leave build settings empty (static site)
# 7. Click Deploy
```

#### 4. Configure Netlify Settings
```yaml
# netlify.toml (create in root)
[build]
  publish = "."
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

#### 5. Auto-Deploy on Push
```bash
# Netlify auto-deploys on push to main
# Just push changes:
git add .
git commit -m "Fix: Update jadwal"
git push origin main

# Netlify automatically:
# 1. Detects push
# 2. Clones repo
# 3. Deploys files
# 4. Updates live site
```

### Monitoring Deployment

#### Netlify Dashboard
```
netlify.com > Settings > Deploys

Shows:
- Deployment status (Building/Published/Failed)
- Deployment history
- Build logs
- Custom domain settings
```

#### View Build Logs
```
Netlify Dashboard > Deploys > Click specific deploy > Build log

Look for:
- Build errors
- Warning messages
- Deployment URL
```

#### Rollback to Previous Version
```
Netlify Dashboard > Deploys > Select previous deploy > Restore

Or use Git:
git revert HEAD
git push origin main
```

---

## 🧪 Testing Checklist

### Pre-Deployment Tests
- [ ] Works on Chrome (latest)
- [ ] Works on Firefox (latest)
- [ ] Works on Safari (if available)
- [ ] Responsive on mobile (test with F12)
- [ ] All 4 API endpoints return data
- [ ] Announcement audio plays
- [ ] Theme switching works
- [ ] Time controls work
- [ ] No console errors or warnings
- [ ] Google Sheets data matches display

### Post-Deployment Tests
- [ ] Live URL accessible
- [ ] Page loads within 2 seconds
- [ ] Jadwal updates every 15 seconds
- [ ] Announcement works
- [ ] No mixed content warnings (HTTPS)
- [ ] Responsive on mobile devices

### Browser Compatibility Test
```javascript
// In console of each browser:
console.log({
  userAgent: navigator.userAgent,
  speechAPI: 'speechSynthesis' in window,
  fetchAPI: 'fetch' in window,
  localStorage: 'localStorage' in window,
  flexbox: CSS.supports('display', 'flex'),
  grid: CSS.supports('display', 'grid')
});
```

---

## 📊 Performance Testing

### Measure Load Time
```javascript
// In console:
performance.measure('custom', 'navigationStart', 'loadEventEnd');
const measure = performance.getEntriesByName('custom')[0];
console.log('Total load time:', measure.duration, 'ms');

// Breakdown:
console.log({
  domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
  pageLoad: performance.timing.loadEventEnd - performance.timing.navigationStart
});
```

### Network Waterfall
```
F12 > Network tab > Refresh

Look for:
- HTML: ~50KB
- CSS: ~100KB
- JS: ~50KB
- Images: ~500KB
- API calls: ~20KB each

Total: ~750KB (acceptable for first load)
Subsequent: ~100KB (cached assets)
```

---

## 🔒 Security Checklist

Before Going Live:
- [ ] No hardcoded passwords or API keys
- [ ] Google Sheets is public (intended)
- [ ] HTTPS enabled (automatic on Netlify)
- [ ] No console.log of sensitive data
- [ ] No user input without validation
- [ ] No XSS vulnerabilities
- [ ] No CORS issues

---

## 📞 Support Escalation

### When to Restart Browser
- Audio not working
- Weird CSS glitches
- Voice list empty

### When to Clear Cache
- Old data showing
- Stale theme
- CSS not updating

### When to Contact ISP
- Cannot reach OpenSheet API
- DNS issues
- Network unreachable

### When to Contact Google
- Google Sheets API changes
- Sheets API deprecation notices
- Account security issues

---

## 📝 Version History

### v1.0.0 (Production)
- Initial release
- Features: Jadwal, TTS, Themes, Piket
- API: OpenSheet
- Hosting: Netlify

### Future v1.1.0 (Planned)
- Guru lookup integration
- Offline caching
- Service worker
- Mobile app

---

**Last Updated:** Desember 2024
**Troubleshooting Version:** 1.0.0

