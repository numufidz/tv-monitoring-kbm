# AGENT.md - Panduan untuk AI Development Agent

**Dokumentasi teknis untuk memandu AI agent dalam mengembangkan dan merawat proyek E-Jadwal TV**

---

## 📋 Informasi Proyek

### Identitas Proyek
- **Nama:** E-Jadwal TV - Monitoring Jadwal Pelajaran Digital
- **Institusi:** MTs. An-Nur Bululawang
- **Repository:** Antigravity/tv-monitoring-kbm
- **Status:** Production (Live at Netlify)

### Teknologi Stack
```
Frontend:    HTML5, CSS3, JavaScript (Vanilla)
Data Layer:  Google Sheets API (opensheet.elk.sh proxy)
Hosting:     Netlify (Static)
Browser APIs: Web Speech, Local Storage, Fetch
```

---

## 🎯 Konteks Historis

### Perjalanan Pengembangan
Proyek ini telah melalui beberapa fase:

**Phase 1: Initial Build**
- Implementasi dasar tampilan jadwal TV
- Koneksi ke Google Sheets via opensheet.elk.sh
- Basic theme & layout system

**Phase 2: Feature Addition**
- Fitur pengumuman suara (TTS)
- Modal jadwal lengkap
- Guru piket display
- Multiple theme support

**Phase 3: Refinement (Current)**
- Bug fixes
- UI improvements
- Performance optimization

### Known Issues History
- Jadwal hanya menampilkan 3 kelas (7A/7D/9H) - diperbaiki dengan proper filtering
- Guru names tidak muncul - fixed dengan column name variations
- Data row matching gagal - fixed dengan proper datetime handling

---

## 📊 Struktur Data Detail

### Google Sheets Configuration

**Spreadsheet ID:** `1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I`

#### Sheet 1: DATABASE
```
Kolom A: Hari (SABTU, AHAD, SENIN, SELASA, RABU, KAMIS, JUMAT)
Kolom B: Jam Ke- (1, 2, 3, 4, 5, 6, 7)
Kolom C-K: Pagi (7A, 7B, 7C, 8A, 8B, 8C, 9A, 9B, 9C)
Kolom L-Y: Siang (7D, 7E, 7F, 7G, 8D, 8E, 8F, 8G, 8H, 9D, 9E, 9F, 9G, 9H)

Contoh row:
SABTU | 1 | ASW.37 | ING.02 | ... (kode mapel untuk 23 kelas)
```

#### Sheet 2: PERIODE BEL
```
Shift | Jam Ke- | Jam Mulai | Jam Selesai | [Catatan]
PUTRA | 1       | 06:30     | 07:15
PUTRA | 2       | 07:15     | 08:00
...
PUTRA | IST     | 09:00     | 09:15
...
PUTRI | 1       | 12:30     | 13:15
PUTRI | 2       | 13:15     | 14:00
...
```

#### Sheet 3: BEL KHUSUS
Struktur sama dengan PERIODE BEL, digunakan untuk hari Kamis

#### Sheet 4: PIKET
```
HARI   | PIKET SHIFT PAGI | PIKET SHIFT SIANG
SABTU  | Ustadz Ahmad     | Ustadzah Siti
AHAD   | Ustadz Budi      | Ustadzah Nurul
...
```

### Data Flow Diagram
```
Google Sheets (5 sheets)
         ↓
  opensheet.elk.sh API
         ↓
  fetchData() async fetch
         ↓
  Parse & Store (globalVar)
         ↓
  Filter by time (current Jam Ke-)
         ↓
  Render to DOM
         ↓
  User sees: Kelas + Mapel + Guru
```

---

## 🔌 API Endpoints

### All Endpoints Use Pattern:
```
https://opensheet.elk.sh/{SPREADSHEET_ID}/{SHEET_NAME}
```

### Actual Endpoints
```javascript
const endpointDatabase = 'https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/DATABASE'
const endpointBel = 'https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/PERIODE%20BEL'
const endpointBelKhusus = 'https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/BEL%20KHUSUS'
const endpointPiket = 'https://opensheet.elk.sh/1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I/PIKET'
```

### Response Format
```javascript
// Returns: Array of Objects
[
  {
    "Hari": "SABTU",
    "Jam Ke-": "1",
    "7A": "ASW.37",
    "7B": "ING.02",
    // ... semua 23 kelas
  },
  // ... satu row per jam per hari
]
```

### Error Handling
- Network error → Show "Gagal memuat data" message
- Empty response → Show "Tidak ada data jadwal" message
- Invalid format → Console log + graceful fallback

---

## 🏗️ Arsitektur Code

### File Organization
```
script.js (823 lines)
├── Constants & Endpoints (lines 1-13)
├── DOM Elements (lines 15-21)
├── State Variables (lines 23-33)
├── Theme System (lines 35-73)
├── Clock & Calendar (lines 75-110)
├── Sorting Functions (lines 112-130)
├── Data Processing (lines 132-200+)
├── Main Fetch Loop (lines 220+)
├── Announcement Functions (lines 280+)
├── Control Functions (lines 350+)
├── Voice/Audio (lines 400+)
├── Modal Functions (lines 600+)
└── Event Listeners & Init (lines 700+)
```

### Key Functions Reference

#### Data Operations
```javascript
fetchData(forceAnnounce = false)
  // Main orchestration function
  // Called: Every 15 seconds + on manual trigger
  // Does: Fetch all sheets → determine current Jam Ke → render
  // Returns: void (updates globalVar & DOM)

convertDatabaseToJadwal(dbData, jamKe, shift, hari)
  // (if implemented) Transform raw data to display format
  // Filter by: day + jam + shift
  // Returns: [{Kelas, Mapel, Guru}, ...]
```

#### Time Management
```javascript
updateClock()
  // Update display clock & date
  // Considers: timeOffset, timeOffsetMinutes, dayOffset
  // Returns: void (updates DOM)

adjustTime(offset)
adjustMinute(offset)
adjustDay(offset)
  // Manual time override for testing
  // Re-triggers: fetchData() immediately
```

#### Audio & Announcement
```javascript
announceSchedule(jadwal, jamKe, shift, isKamis = false)
  // TTS announce current schedule
  // Sequence: intro.mp3 → [schedule items] → closing

loadVoices()
  // Load available voices from browser speech synthesis
  // Groups by: gender (female/male/other)
  // Filters: Indonesian voices preferred

stopAnnouncement()
  // Stop current announcement & audio playback
```

#### UI Controls
```javascript
nextTheme()
switchLayout()
adjustFont(change)
toggleFont()
showSchedule()
showFullSchedule(targetShift = 'SEMUA')
```

---

## 🔄 Event Loops & Timing

### Automatic Intervals
```javascript
setInterval(updateClock, 1000)           // Every 1 second
setInterval(fetchData, 15000)            // Every 15 seconds
setInterval(voiceSync, 30000)            // Every 30 seconds (voice refresh)
setInterval(inactivityCheck, 30000)      // Every 30 seconds
```

### Manual Triggers
- Voice change → `changeVoice()`
- Theme switch → `switchLayout()` → `nextTheme()`
- Announce now → `announceNow()` → `fetchData(true)`
- Font adjust → `adjustFont()` (immediate DOM update)
- Time adjust → `adjustTime/Minute/Day()` → `updateClock()` & `fetchData()`

### Duplicate Prevention
```javascript
let lastAnnouncedJamKe = null;

// In fetchData():
if (jamKe !== lastAnnouncedJamKe || forceAnnounce) {
  lastAnnouncedJamKe = jamKe;
  announceSchedule(...);
}
```

---

## 🎨 UI/UX Architecture

### Visual Hierarchy
```
Header (Clock + Date + Shift Info)
    ↓
Main Grid (Class Cards - Kelas | Mapel | Guru)
    ↓
Footer (Guru Piket)
    ↓
Control Panel (Right Sidebar - Hidden by default)
```

### Theme System
```javascript
9 themes (index 0-8):
  0: Klasik (#0f2027)
  1: Modern (gradient)
  2: Sunset (gradient)
  3: Vibrant (dark)
  4: Neon Glow (layout class)
  5: Retro Wave (layout class)
  6: Nature (layout class)
  7: Matrix (layout class)
  8: Glassmorphism (layout class)
```

### Responsive Design
- Mobile-first approach
- Flexbox for layout
- Font scaling with `currentFontSize` multiplier
- Grid auto-adjust based on screen size

---

## 🐛 Common Issues & Solutions

### Issue: Jadwal tidak update
**Root Cause Options:**
1. fetchData() tidak dipanggil
2. API unreachable
3. Data format berubah
4. Time calculation salah

**Debug Steps:**
```javascript
// In console:
1. Check: globalBelData?.length
2. Check: globalJadwalData?.length
3. Check current time vs BEL data
4. Check network tab for failed requests
5. Log: console.log(globalBelData[0])
```

### Issue: Pengumuman berulang
**Root Cause:**
- `lastAnnouncedJamKe` tidak ter-update

**Fix:**
```javascript
// Ensure in fetchData():
if (jamKe !== lastAnnouncedJamKe || forceAnnounce) {
  lastAnnouncedJamKe = jamKe;  // MUST SET BEFORE calling announce
  announceSchedule(...);
}
```

### Issue: Voice tidak terdengar
**Root Cause Options:**
1. Browser muted
2. Web Speech API not supported
3. No voices loaded
4. Audio context suspended

**Debug:**
```javascript
// In console:
speechSynthesis.getVoices().length  // Should be > 0
selectedVoice  // Should not be null
```

### Issue: Theme tidak apply
**Root Cause:**
- CSS class not in stylesheet
- Layout class conflicts

**Fix:**
- Check `layouts[]` array matches CSS classes in index.html
- Verify no duplicate class toggles
- Clear browser cache

---

## 🔨 Development Workflow

### Making Changes

**Step 1: Identify Issue**
```bash
# Check console for errors
# Verify data in network tab
# Trace through code logic
```

**Step 2: Locate Code**
```bash
# Use grep_search for function names
# Check script.js line numbers
# Reference this AGENT.md for architecture
```

**Step 3: Implement Fix**
```bash
# Understand surrounding code context
# Make minimal change
# Test locally first
```

**Step 4: Test**
```bash
# F12 Console for errors/logs
# Check network requests
# Verify UI updates
# Test across browsers
```

**Step 5: Commit**
```bash
git add .
git commit -m "Brief description"
git push origin main
# Netlify auto-deploys on push
```

### Code Style Guidelines
- Use camelCase for variables & functions
- Use UPPER_CASE for constants
- Comment complex logic
- Keep functions < 50 lines where possible
- Use descriptive variable names

---

## 📈 Performance Considerations

### Optimization Done
- Parallel fetch: `Promise.all()` for 4 API calls
- Debounce announce: `lastAnnouncedJamKe` check
- Lazy voice loading: `onvoiceschanged` event
- Event delegation: Global listeners, not per-element

### Potential Improvements
```javascript
// Memoization for time-based lookups
const jamKeCache = {};

// Pagination for modal scrolling
// Lazy render for large class lists
// Service Worker for offline support
// IndexedDB for data caching

// Reduce fetch frequency in non-business hours
const hour = new Date().getHours();
const interval = (hour < 6 || hour > 18) ? 60000 : 15000;
```

---

## 🔒 Security Notes

### Current Security Posture
- No authentication (not needed - public data)
- No data validation (trust Google Sheets)
- No CSRF protection (static site, no forms)
- No XSS vectors (no user input except controls)

### Data Protection
- All data from public Google Sheets
- No sensitive info stored locally
- No API keys exposed
- CORS handled by opensheet.elk.sh

### Future Hardening
```javascript
// Input validation for control inputs
// Content Security Policy headers (on hosting)
// Subresource Integrity for CDN resources
// Rate limiting headers from opensheet.elk.sh
```

---

## 📚 Resource References

### Google Sheets
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [opensheet.elk.sh GitHub](https://github.com/ashtosh/opensheet)

### Web APIs
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

### CSS & Layout
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [CSS Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [CSS Gradients](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient)

---

## 📝 Maintenance Checklist

### Weekly
- [ ] Check for API errors in production
- [ ] Verify schedule displays correctly
- [ ] Test announcement audio

### Monthly
- [ ] Update Google Sheets if needed
- [ ] Review console logs for warnings
- [ ] Test on different devices/browsers
- [ ] Backup Google Sheets

### Quarterly
- [ ] Performance audit
- [ ] Security review
- [ ] Update dependencies (if any)
- [ ] Collect user feedback

---

## 🚀 Deployment

### Netlify Auto-Deploy
```bash
# Every push to main triggers:
1. Clone repository
2. npm install (if package.json exists)
3. Build (if build command exists)
4. Deploy to edge
```

### Manual Updates
```bash
# If needed to deploy immediately:
# Netlify Dashboard > Deployments > Trigger Deploy
```

### Rollback
```bash
# Netlify Dashboard > Deployments > Redeploy
# Or: git revert & push
```

---

## 📞 Support & Escalation

### When to Contact Human Developers
1. **Major architectural changes needed**
   - Changing data source (not Sheets)
   - Adding backend
   - Complete rewrite

2. **Complex bugs**
   - Browser compatibility issues
   - Performance problems at scale
   - Security vulnerabilities

3. **Feature requests**
   - Integration with other systems
   - Custom hardware interfacing
   - Advanced reporting

---

## 🤖 AI Agent Capabilities

### This Agent CAN:
✅ Read & understand the codebase
✅ Make targeted code changes
✅ Debug common issues
✅ Add new simple features
✅ Optimize performance
✅ Write documentation
✅ Setup local development
✅ Analyze Google Sheets structure
✅ Test UI changes
✅ Deploy via git push

### This Agent CANNOT:
❌ Access spreadsheet data directly (read-only via API)
❌ Create new Google Sheets
❌ Modify spreadsheet structure
❌ Change Netlify configuration
❌ Access browser developer tools directly
❌ Test browser-only features (audio, TTS)
❌ Make architectural decisions alone
❌ Deploy to production without git

---

## 📋 Next Steps for Agent

When taking on new tasks:

1. **Read this AGENT.md first** ✓
2. **Understand the context** (historical issues, architecture)
3. **Locate affected code** (grep_search, read_file)
4. **Make minimal changes** (focused fixes)
5. **Test locally** (if possible)
6. **Document changes** (update relevant MD files)
7. **Commit with clear message**

---

**Last Updated:** Desember 2024
**Version:** 1.0.0
**Maintained By:** AI Development Agent + Human Team

