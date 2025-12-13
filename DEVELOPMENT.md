# DEVELOPMENT.md - Panduan Pengembangan & Contributing

**Panduan untuk developer yang ingin berkontribusi atau mengembangkan proyek ini**

---

## 🚀 Quick Start

### Setup Lokal dalam 5 Menit

```bash
# 1. Clone repository
git clone https://github.com/your-username/tv-monitoring-kbm.git
cd tv-monitoring-kbm

# 2. Start local server
# Option A: Python
python -m http.server 8000

# Option B: Node.js (if installed)
npx http-server

# Option C: VS Code Live Server extension
# Right-click index.html > Open with Live Server

# 3. Open browser
# http://localhost:8000
```

### Verify Setup
```javascript
// Open F12 console, should see:
console.log("Setup OK if:");
// 1. Page loads without errors
// 2. Clock updates every second
// 3. Console shows no CORS errors
// 4. No red error messages in UI
```

---

## 📁 Project Structure

```
tv-monitoring-kbm/
├── index.html           (1141 lines) - DOM structure
├── script.js            (823 lines)  - Application logic
├── manifest.json        - Web app manifest
├── README.md            - User documentation
├── AGENT.md             - AI development guide
├── TECHNICAL.md         - Technical architecture
├── API.md               - API reference
├── TROUBLESHOOTING.md   - Troubleshooting guide
├── DEVELOPMENT.md       - This file
└── audio/
    ├── intro.mp3a       - Intro audio (variant a)
    ├── intro.mp3b       - Intro audio (variant b)
    └── intro.mp3c       - Intro audio (variant c)
```

---

## 🔧 Development Workflow

### Making a Change

#### Step 1: Identify the Issue
```bash
# Read issue description or user complaint
# Check TROUBLESHOOTING.md for known issues
# Search code for related functionality
```

#### Step 2: Create Feature Branch
```bash
git checkout -b feature/fix-xyz
# or
git checkout -b bugfix/issue-xyz
```

#### Step 3: Locate Code
```javascript
// Use grep_search to find function/variable:
// Patterns:
// - "function_name" - Find function definition
// - "const variable" - Find variable declaration
// - "className" - Find CSS class references
```

#### Step 4: Read Context
```
1. Open the file containing the change
2. Read at least 5 lines before and after
3. Understand the surrounding logic
4. Check for related functions
```

#### Step 5: Make Minimal Change
```
- Change ONLY what's necessary
- Don't refactor unrelated code
- Keep modifications focused
- Add comments for complex logic
```

#### Step 6: Test Locally
```javascript
// F12 Console:
// 1. Check for errors (red text)
// 2. Manual test the feature
// 3. Test different scenarios
// 4. Check mobile responsiveness
```

#### Step 7: Commit & Push
```bash
git add .
git commit -m "Fix: Brief description (Issue #123)"
git push origin feature/fix-xyz
```

#### Step 8: Create Pull Request
```
GitHub > Pull Request > Create
- Title: Brief description
- Description: What changed and why
- Screenshots: If UI change
- Testing: How you tested it
```

---

## 💻 Code Style Guide

### JavaScript Conventions

#### Naming
```javascript
// ✅ Good
const spreadsheetID = '123...';
let globalBelData = null;
function updateClock() {}
const convertToJadwal = (data) => {};

// ❌ Bad
const spreadsheetid = '123...';
let gBelData = null;
function updateclock() {}
const convert_to_jadwal = (data) => {};
```

#### Variables
```javascript
// ✅ Good
let currentFontSize = 0.85;     // Descriptive, initialized
const MAX_CLASSES = 23;          // Constants in UPPER_CASE
let belData = null;              // Short name, clear purpose

// ❌ Bad
let cfs = 0.85;                  // Abbreviated, unclear
const maxClasses = 23;           // Should be UPPER_CASE
let data = null;                 // Too generic
```

#### Comments
```javascript
// ✅ Good
// Filter schedule by day and period
const jadwal = filterByHariAndJamKe(dbData, jamKe, shift, hari);

// Convert kode mapel to guru info
const guru = getGuruFromKode(kode, guruData);

// ❌ Bad
// Get data
const jadwal = filterByHariAndJamKe(dbData, jamKe, shift, hari);

// Comment should explain WHY, not WHAT
// Bad: The code already shows WHAT it does
```

#### Functions
```javascript
// ✅ Good - Single responsibility
function filterByHariAndJamKe(dbData, jamKe, shift, hari) {
  // Find matching row
  // Extract relevant classes
  // Return formatted array
}

// ❌ Bad - Too many responsibilities
function processAllData(dbData, belData, piketData, jamKe, shift, hari) {
  // Fetch data, filter, format, render, announce
  // Too complex, hard to test
}
```

#### Error Handling
```javascript
// ✅ Good
try {
  const data = await fetch(endpoint).then(r => r.json());
  if (!data || data.length === 0) {
    console.warn('Empty response from API');
  }
  return data;
} catch (error) {
  console.error('Failed to fetch:', error);
  return [];
}

// ❌ Bad
try {
  const data = await fetch(endpoint).then(r => r.json());
  return data;
} catch {
  // Silently fail, no logging
}
```

---

## 🧪 Testing Guide

### Unit Testing (Manual)

#### Test Clock Function
```javascript
// In console:
timeOffset = 6;
timeOffsetMinutes = 30;
dayOffset = 1;
updateClock();

// Verify:
// Clock shows correct time (current + 6h 30m)
// Date shows tomorrow
// No console errors
```

#### Test Data Filtering
```javascript
// In console:
const testRow = globalJadwalData.find(r => r.Hari === 'SABTU' && r['Jam Ke-'] === '1');
console.log('Test row:', testRow);

// Expected:
// Object with Hari, Jam Ke-, and 23 kelas properties
// All values populated (no undefined)
```

#### Test Theme Switching
```javascript
// In console:
for (let i = 0; i < themes.length; i++) {
  nextTheme();
  console.log('Theme', currentTheme - 1, 'applied');
}

// Verify:
// Background changes each click
// No CSS errors
// All 10 themes display correctly
```

### Integration Testing

#### Full Fetch Cycle
```javascript
// In console:
console.time('fetchData');
await fetchData();
console.timeEnd('fetchData');

// Check:
// globalBelData populated ✓
// globalJadwalData populated ✓
// Grid updated with cards ✓
// Time < 1.5 seconds ✓
```

#### Network Simulation
```
F12 > Network tab > Throttle: "Slow 3G"
Refresh page

Check:
- Page still usable during load
- Error messages clear
- No stuck spinners
```

### Visual Testing

#### Responsive Design
```
Test viewport sizes:
- 320px (mobile)
- 768px (tablet)
- 1024px (desktop)
- 1920px (TV display)

Check:
- Cards resize proportionally
- Text readable at all sizes
- No horizontal scroll
- Control panel accessible
```

#### Cross-Browser
```
Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (if Mac)
- Edge (latest)
- Mobile Chrome

Check:
- Layout consistent
- Colors display correctly
- Audio works
- TTS voice available
```

---

## 🎯 Common Development Tasks

### Task 1: Add New Sheet Data

#### Files to Modify
1. `script.js` - Add endpoint constant
2. `script.js` - Add to fetchData() Promise.all()
3. `script.js` - Add global variable for data
4. Filter/render logic as needed

#### Example: Add GURU_MAPEL Sheet
```javascript
// script.js, line 4
const sheetGuruMapel = 'GURU_MAPEL';

// script.js, line 10
const endpointGuruMapel = `https://opensheet.elk.sh/${spreadsheetID}/${sheetGuruMapel}`;

// script.js, line 26
let globalGuruMapel = null;

// script.js, in fetchData()
const [dataDB, dataBel, dataBelK, dataPiket, dataGuruMapel] = await Promise.all([
  fetch(endpointDatabase).then(r => r.json()),
  fetch(endpointBel).then(r => r.json()),
  fetch(endpointBelKhusus).then(r => r.json()),
  fetch(endpointPiket).then(r => r.json()),
  fetch(endpointGuruMapel).then(r => r.json())  // NEW
]);

globalGuruMapel = dataGuruMapel;  // Store globally
```

### Task 2: Modify Theme

#### Add New Theme Color
```javascript
// script.js, lines 42-49
const themes = [
  // ... existing 10 themes ...
  "linear-gradient(to right, #FF6B6B, #FF8E72)"  // NEW: Coral gradient
];

// That's it! Automatically added to rotation
// Call nextTheme() to test
```

#### Add New Layout Class
```javascript
// script.js, lines 50-52
const layouts = [
  // ... existing 9 layouts ...
  'layout-dark'  // NEW
];

const layoutNames = [
  // ... existing names ...
  'Dark Mode'    // NEW
];

// In index.html, add CSS:
.layout-dark {
  background: #1a1a1a;
  /* ... */
}
```

### Task 3: Fix Data Column Mismatch

#### Scenario: Guru lookup not working

**Symptoms:**
- Guru names show as "N/A"
- Console shows undefined when accessing guru data

**Fix:**
```javascript
// Option 1: Check actual column name in Google Sheets
// Then update in code:
const guruData = dbGuruMapel.find(g => 
  String(g['NAMA_GURU'] || '').trim() === targetName
);

// Option 2: Add fallback for multiple column name variants
const getGuruValue = (obj, key) => {
  // Try exact name
  if (obj[key]) return obj[key];
  // Try variations
  if (obj[key.toLowerCase()]) return obj[key.toLowerCase()];
  if (obj[key.toUpperCase()]) return obj[key.toUpperCase()];
  if (obj[key.replace(/_/g, ' ')]) return obj[key.replace(/_/g, ' ')];
  return null;
};
```

### Task 4: Update Announcement Text

#### Files to Modify
1. `script.js` - announceSchedule() function
2. `script.js` - announceNoKBM() function
3. `script.js` - announceBreak() function

#### Example: Change Announcement
```javascript
// Current: "Saatnya pergantian jam ke 1."
// New: "Sekarang dimulai jam ke 1 pembelajaran."

// In announceSchedule():
const intro = `Sekarang dimulai jam ke ${jamKe} pembelajaran.`;
```

---

## 📊 Performance Optimization Tips

### Code Level
```javascript
// ✅ Good: Reuse querySelector result
const cards = document.querySelectorAll('.card');
cards.forEach(card => card.style.display = 'none');

// ❌ Bad: Query every iteration
for (let i = 0; i < 100; i++) {
  document.querySelector('.card').style.display = 'none';
}
```

### DOM Level
```javascript
// ✅ Good: Batch DOM updates
const fragment = document.createDocumentFragment();
items.forEach(item => {
  const el = document.createElement('div');
  fragment.appendChild(el);
});
container.appendChild(fragment);

// ❌ Bad: Update DOM each iteration
items.forEach(item => {
  const el = document.createElement('div');
  container.appendChild(el);  // Reflow each time
});
```

### API Level
```javascript
// ✅ Good: Parallel requests
const [a, b, c] = await Promise.all([
  fetch(url1), fetch(url2), fetch(url3)
]);  // ~1 second for 3 requests

// ❌ Bad: Sequential requests
const a = await fetch(url1);
const b = await fetch(url2);
const c = await fetch(url3);  // ~3 seconds
```

---

## 🐛 Debugging Techniques

### Console Logging Strategy
```javascript
// ✅ Good: Structured logging
console.group('Fetch Cycle');
console.log('Time:', new Date().toISOString());
console.log('Data sources:', {
  database: dbData?.length,
  bel: belData?.length
});
console.groupEnd();

// ❌ Bad: Unstructured spam
console.log('hi');
console.log('data');
console.log('ok');
```

### Debugger Breakpoints
```javascript
// In code:
debugger;  // Execution pauses here

// OR: F12 > Sources tab
// Click line number to set breakpoint
// Execution pauses when reached
```

### Network Tab Analysis
```
F12 > Network tab

For each request:
1. Time: How long did it take?
2. Size: How much data?
3. Status: 200 (OK) or error?
4. Type: xhr (API), doc (HTML), etc.

Look for:
- Slow requests (> 1 second)
- Large responses (> 100KB)
- Failed requests (red)
- Duplicate requests
```

---

## 📚 Code Review Checklist

Before Submitting Pull Request:

### Code Quality
- [ ] No console.log left (remove debug logging)
- [ ] No hardcoded values (use constants)
- [ ] Comments explain WHY, not WHAT
- [ ] Functions < 50 lines
- [ ] Variable names descriptive
- [ ] No unused variables

### Functionality
- [ ] Feature works as intended
- [ ] Edge cases handled
- [ ] Error messages clear
- [ ] No console errors
- [ ] Performance acceptable

### Testing
- [ ] Manually tested locally
- [ ] Tested in Chrome + Firefox
- [ ] Tested on mobile viewport
- [ ] No breaking existing features
- [ ] Accessibility considered (keyboard nav, screen reader)

### Documentation
- [ ] Code comments added
- [ ] README updated (if applicable)
- [ ] API docs updated (if applicable)
- [ ] CHANGELOG entry added

---

## 🚀 Deployment Process

### Pre-Deployment Checklist
```bash
# 1. Clean up code
rm -f debug.js  # Remove debug files
git status      # Check for uncommitted changes

# 2. Run tests
# Manual testing completed ✓

# 3. Update version
# package.json version: 1.0.1

# 4. Commit
git add .
git commit -m "Release: v1.0.1 - Fix issue #123"

# 5. Tag
git tag v1.0.1
git push origin main --tags

# 6. Netlify auto-deploys on push
# Check: netlify.com dashboard
```

### Post-Deployment Verification
```bash
# 1. Check live site
# Visit: https://tv-monitoring-kbm.netlify.app

# 2. Verify functionality
# - Page loads
# - Data displays
# - Audio works
# - No errors in F12

# 3. Check deployment logs
# Netlify Dashboard > Deploys > Latest > View logs

# 4. Monitor for issues
# Keep eye on error tracking (if implemented)
```

---

## 📝 Documentation Standards

### Code Comments
```javascript
// ✅ Good: Explain why and how
// Filter schedule by day + period to get current class assignments
// Uses shift to determine which 9-14 classes to display
const jadwal = filterByHariAndJamKe(dbData, jamKe, shift, hari);

// ❌ Bad: Obvious or missing
const jadwal = filterByHariAndJamKe(dbData, jamKe, shift, hari);

// ❌ Bad: Says what, not why
// filter the data
const jadwal = filterByHariAndJamKe(dbData, jamKe, shift, hari);
```

### Function Documentation
```javascript
/**
 * Convert database row to formatted schedule
 * @param {Array} dbData - Raw database array
 * @param {String} jamKe - Period number (1-7)
 * @param {String} shift - PUTRA or PUTRI
 * @param {String} hari - Day name (SABTU, AHAD, etc)
 * @returns {Array} [{Kelas, Mapel, Guru}, ...]
 */
function filterByHariAndJamKe(dbData, jamKe, shift, hari) {
  // Implementation
}
```

---

## 🤝 Contributing Guidelines

### For New Contributors

1. **Start Small**: Bug fixes before new features
2. **Read Code**: Understand the architecture first
3. **Ask Questions**: Open issue to discuss before coding
4. **One Feature**: One PR = one feature
5. **Test Thoroughly**: Don't assume it works
6. **Be Patient**: Review takes time

### For Maintainers

1. **Review Promptly**: Within 1 week
2. **Clear Feedback**: Specific, constructive comments
3. **Approve & Merge**: Don't let PRs stale
4. **Thank Contributors**: Acknowledge their effort

---

## 📞 Getting Help

### Resources
- **Code Questions:** Grep through codebase
- **API Questions:** See API.md
- **Architecture:** See AGENT.md & TECHNICAL.md
- **Issues:** Check TROUBLESHOOTING.md
- **Examples:** Look at existing functions

### Asking Questions
```
Good: "Feature X doesn't work when Y happens. I see Z in console. How to fix?"
Bad: "It doesn't work."

Good: Include code sample/screenshot
Bad: Vague description only
```

---

## 🎓 Learning Resources

### JavaScript
- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript.info](https://javascript.info/)
- [Async/Await Guide](https://javascript.info/async-await)

### Web APIs
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

### Google Sheets
- [Google Sheets API](https://developers.google.com/sheets/api)
- [OpenSheet Docs](https://github.com/ashtosh/opensheet)

---

## 📅 Release Schedule

### Maintenance
- **Security patches:** As needed
- **Bug fixes:** Weekly
- **Feature releases:** Monthly
- **Major versions:** Quarterly

### Version Format
```
v1.0.0
├─ 1: Major (breaking changes)
├─ 0: Minor (new features)
└─ 0: Patch (bug fixes)

Example:
v1.2.3
- v1: Major version 1 (production)
- 2: 2 new features added
- 3: 3 bug fixes applied
```

---

**Last Updated:** Desember 2024
**Development Guide Version:** 1.0.0

