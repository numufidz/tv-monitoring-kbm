const spreadsheetID = '1LgqAr0L66JLtygqTqZRXOMKT06_IMopYlsEGc5nVp4I';
const sheetDatabase = 'DATABASE';
const sheetBel = 'PERIODE BEL';
const sheetBelKhusus = 'BEL KHUSUS'; // Tambahkan sheet BEL KHUSUS
const sheetPiket = 'PIKET'; // Tambahkan sheet PIKET

const endpointDatabase = `https://opensheet.elk.sh/${spreadsheetID}/${sheetDatabase}`;
const endpointBel = `https://opensheet.elk.sh/${spreadsheetID}/${sheetBel}`;
const endpointBelKhusus = `https://opensheet.elk.sh/${spreadsheetID}/${sheetBelKhusus}`; // Tambahkan endpoint BEL KHUSUS
const endpointPiket = `https://opensheet.elk.sh/${spreadsheetID}/${sheetPiket}`; // Tambahkan endpoint PIKET

// Elemen DOM
const clock = document.getElementById("clock");
const dayDate = document.getElementById("dayDate");
const shiftKBM = document.getElementById("shiftKBM");
const angkaKe = document.getElementById("angkaKe");
const periodeJam = document.getElementById("periodeJam");
const gridContainer = document.getElementById("gridContainer");
const voiceSelect = document.getElementById("voiceSelect");
const guruPiket = document.getElementById("guruPiket"); // Tambahkan elemen guru piket

// Variabel state
let globalBelData = null;
let globalBelKhususData = null;
let globalJadwalData = null; // Data jadwal pelajaran full
let timeOffset = 0; // Default offset 0 jam (waktu real)
let timeOffsetMinutes = 0; // Offset 0 menit (waktu real)
let dayOffset = 0;
let currentFontSize = 0.85;
let lastAnnouncedJamKe = null;
let selectedVoice = null;

// Audio intro untuk pengumuman
const introAudio = new Audio('audio/intro.mp3');

// Daftar tema untuk tampilan
const themes = [
  "#0f2027", "#1e1e2f", "#2c3e50", "#3d3d3d", "#1a1a1a",
  "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
  "linear-gradient(to right, #2c3e50,rgb(15, 34, 37))",
  "linear-gradient(to right, #141E30, #243B55)",
  "linear-gradient(to right, #232526, #414345)",
  "linear-gradient(to right, #373B44,rgb(10, 46, 104))"
];
let currentTheme = 0;

// Ganti tema tampilan
function nextTheme() {
  document.body.style.background = themes[currentTheme];
  currentTheme = (currentTheme + 1) % themes.length;
}

// Daftar layout tema
const layouts = ['', 'layout-modern', 'layout-sunset', 'layout-vibrant', 'layout-neon', 'layout-retro', 'layout-nature', 'layout-matrix', 'layout-glass'];
const layoutNames = ['Klasik', 'Modern', 'Sunset', 'Vibrant', 'Neon Glow', 'Retro Wave', 'Nature', 'Matrix', 'Glassmorphism'];
let currentLayout = 0;

// Fungsi untuk mengubah layout tema
function switchLayout() {
  // Hapus semua class layout sebelumnya
  layouts.forEach(layout => {
    if (layout) document.body.classList.remove(layout);
  });

  // Pindah ke layout berikutnya
  currentLayout = (currentLayout + 1) % layouts.length;

  // Tambahkan class layout baru (jika bukan klasik/default)
  if (layouts[currentLayout]) {
    document.body.classList.add(layouts[currentLayout]);
  }

  // Tampilkan notifikasi tema yang dipilih (opsional)
  console.log(`Tema diubah ke: ${layoutNames[currentLayout]}`);
}


// Update jam dan tanggal
function updateClock() {
  const now = new Date();

  // Terapkan offset waktu (jam dan menit)
  now.setHours(now.getHours() + timeOffset);
  now.setMinutes(now.getMinutes() + timeOffsetMinutes);
  now.setDate(now.getDate() + dayOffset);

  clock.textContent = now.toLocaleTimeString('id-ID', { hour12: false });

  // Ambil tanggal dengan format lengkap
  let dateString = now.toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Ganti "Minggu" dengan "Ahad" untuk tampilan
  dateString = dateString.replace(/^Minggu,/, 'Ahad,');

  dayDate.textContent = dateString;
}
setInterval(updateClock, 1000);
updateClock();

// Fungsi untuk mengurutkan kelas
function sortClasses(jadwal) {
  return jadwal.sort((a, b) => {
    // Ekstrak angka kelas (misal dari "7A" ambil "7")
    const kelasA = parseInt(a.Kelas.match(/\d+/)[0]);
    const kelasB = parseInt(b.Kelas.match(/\d+/)[0]);

    // Jika kelas berbeda, urutkan berdasarkan angka kelas
    if (kelasA !== kelasB) {
      return kelasA - kelasB;
    }

    // Jika kelas sama, urutkan berdasarkan huruf/kode setelah angka
    const subKelasA = a.Kelas.replace(/\d+/, '');
    const subKelasB = b.Kelas.replace(/\d+/, '');
    return subKelasA.localeCompare(subKelasB);
  });
}

// Fungsi untuk mengambil dan menampilkan guru piket - DIPERBAIKI
async function updateGuruPiket(hari, jam, isInKBMPeriod = false) {
  try {
    // Jika tidak dalam periode KBM, tampilkan pesan "Tidak ada data piket"
    if (!isInKBMPeriod) {
      guruPiket.textContent = 'Tidak ada data piket';
      return;
    }

    const dataPiket = await fetch(endpointPiket).then(r => r.json());

    // Tentukan shift berdasarkan jam
    const shift = jam < 12 ? 'PAGI' : 'SIANG';
    const shiftColumn = shift === 'PAGI' ? 'PIKET SHIFT PAGI' : 'PIKET SHIFT SIANG';

    // Cari data piket untuk hari ini
    const piketHariIni = dataPiket.filter(p => p.HARI && p.HARI.toUpperCase() === hari);

    if (piketHariIni.length === 0) {
      guruPiket.textContent = 'Tidak ada data piket';
      return;
    }

    // Ambil semua guru piket untuk shift yang sesuai
    const daftarPiket = piketHariIni
      .filter(p => p[shiftColumn] && p[shiftColumn].trim() !== '')
      .map(p => p[shiftColumn].trim());

    if (daftarPiket.length === 0) {
      guruPiket.textContent = 'Tidak ada piket';
      return;
    }

    // Tampilkan daftar guru piket
    if (daftarPiket.length === 1) {
      guruPiket.textContent = daftarPiket[0];
    } else {
      guruPiket.innerHTML = daftarPiket.join('<br>');
    }

  } catch (err) {
    console.error("Gagal memuat data piket:", err);
    guruPiket.textContent = 'Error loading piket data';
  }
}

// Fungsi utama untuk mengambil dan menampilkan data jadwal - DIPERBAIKI
async function fetchData(forceAnnounce = false) {
  const now = new Date();

  // Terapkan offset waktu (jam dan menit) - sama seperti di updateClock
  now.setHours(now.getHours() + timeOffset);
  now.setMinutes(now.getMinutes() + timeOffsetMinutes);
  now.setDate(now.getDate() + dayOffset);

  const jam = now.getHours();
  const menit = now.getMinutes();

  // Ambil nama hari dalam bahasa Indonesia
  let hari = now.toLocaleDateString('id-ID', { weekday: 'long' }).toUpperCase();

  // Konversi MINGGU menjadi AHAD untuk menyesuaikan dengan spreadsheet
  if (hari === 'MINGGU') {
    hari = 'AHAD';
  }

  const shift = jam < 12 ? 'PUTRA' : 'PUTRI';
  const timeNow = `${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}`;

  try {
    console.log("Fetching data...");
    const [dataJadwal, dataBel, dataBelKhusus] = await Promise.all([
      fetch(endpointDatabase).then(r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      }),
      fetch(endpointBel).then(r => r.json()),
      fetch(endpointBelKhusus).then(r => r.json())
    ]);

    console.log("Data fetched:", {
      jadwal: dataJadwal?.length,
      bel: dataBel?.length,
      belKhusus: dataBelKhusus?.length
    });

    // Simpan ke variabel global
    globalBelData = dataBel;
    globalBelKhususData = dataBelKhusus;
    globalJadwalData = dataJadwal; // Simpan data pelajaran full

    // Gunakan BEL KHUSUS untuk hari Kamis, PERIODE BEL untuk hari lainnya
    const isKamis = hari === 'KAMIS'; // Periksa apakah hari ini Kamis
    const belData = isKamis ? dataBelKhusus : dataBel;

    shiftKBM.textContent = `KBM ${shift}`; // Tidak pakai indikator "KHUSUS"

    const belHariIni = belData.filter(p => p.Shift === shift);
    let periode = belHariIni.find(p => timeNow >= p['Jam Mulai'] && timeNow <= p['Jam Selesai']);

    // Cek apakah sedang dalam periode KBM (bukan istirahat dan ada periode)
    const isInKBMPeriod = periode && periode['Jam Ke-'] !== 'IST';

    // Update guru piket dengan parameter baru
    await updateGuruPiket(hari, jam, isInKBMPeriod);

    if (!periode) {
      angkaKe.textContent = '-';
      periodeJam.textContent = '-';
      gridContainer.className = "grid center-message";
      gridContainer.innerHTML = `<div>Tidak ada KBM saat ini</div>`;

      // Umumkan jika belum pernah diumumkan atau diminta
      if (lastAnnouncedJamKe !== 'NO_KBM' || forceAnnounce) {
        lastAnnouncedJamKe = 'NO_KBM';
        announceNoKBM();
      }

      return;
    }

    if (periode['Jam Ke-'] === 'IST') {
      angkaKe.textContent = 'IST';
      periodeJam.textContent = `${periode['Jam Mulai']} - ${periode['Jam Selesai']}`;
      gridContainer.className = "grid center-message";
      gridContainer.innerHTML = `<div>Sedang istirahat</div>`;

      // Umumkan jika belum pernah diumumkan atau diminta
      if (lastAnnouncedJamKe !== 'IST' || forceAnnounce) {
        lastAnnouncedJamKe = 'IST';
        announceBreak(periode['Jam Mulai'], periode['Jam Selesai']);
      }

      return;
    }

    const jamKe = periode['Jam Ke-'];
    const jamMulai = periode['Jam Mulai'];
    const jamSelesai = periode['Jam Selesai'];
    angkaKe.textContent = jamKe;
    periodeJam.textContent = `${jamMulai} - ${jamSelesai}`;

    const jadwal = dataJadwal.filter(row =>
      row.Hari.toUpperCase() === hari &&
      row['Jam Ke-'] === jamKe &&
      row.Shift === shift
    );

    if (jadwal.length === 0) {
      gridContainer.className = "grid center-message";
      gridContainer.innerHTML = `<div>Tidak ada data jadwal untuk jam ini</div>`;
      return;
    }

    // Urutkan jadwal berdasarkan kelas
    const sortedJadwal = sortClasses(jadwal);

    gridContainer.className = "grid";
    gridContainer.innerHTML = "";
    sortedJadwal.forEach(row => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.fontSize = `${currentFontSize}rem`;
      card.innerHTML = `
        <div class="kelas-box">${row.Kelas}</div>
        <div class="info-box">
          <div class="mapel">${row['Nama Mapel']}</div>
          <div class="guru">${row['Nama Lengkap Guru']}</div>
        </div>
      `;
      gridContainer.appendChild(card);
    });

    // Umumkan jika jam pelajaran berubah atau diminta
    if (jamKe !== lastAnnouncedJamKe || forceAnnounce) {
      lastAnnouncedJamKe = jamKe;
      announceSchedule(sortedJadwal, jamKe, shift, isKamis);
    }

  } catch (err) {
    console.error("Gagal memuat:", err);

    // Tampilkan error di UI hanya jika belum ada konten (initial load)
    if (!gridContainer.children.length || gridContainer.textContent === 'Memuat jadwal...') {
      gridContainer.className = "grid center-message";
      gridContainer.innerHTML = `<div style="color: red;">Gagal memuat data.<br><small>${err.message}</small></div>`;
    }

    // Jika terjadi error, set guru piket ke "Tidak ada data piket"
    guruPiket.textContent = 'Tidak ada data piket';
  }
}

// Jalankan fetchData setiap 15 detik
setInterval(fetchData, 15000);
fetchData();

// Fungsi untuk mengumumkan jadwal dengan suara
function announceSchedule(jadwal, jamKe, shift, isKamis = false) {
  stopAnnouncement(); // Hentikan pengumuman sebelumnya
  introAudio.play();

  setTimeout(() => {
    let intro = `Saatnya pergantian jam ke ${jamKe}.`;

    // Tambahkan informasi jadwal khusus jika hari Kamis
    if (isKamis) {
      intro = `Saatnya pergantian jam ke ${jamKe}. Ini adalah jadwal khusus hari Kamis.`;
    }

    const suara = [intro];

    jadwal.forEach(row => {
      suara.push(`Kelas ${row.Kelas}. Mata pelajaran ${row['Nama Mapel']}. Ustadz ${row['Nama Lengkap Guru']}.`);
    });

    suara.push("Terima kasih atas perhatiannya. Selamat bertugas.");

    let index = 0;

    function speakNext() {
      if (index >= suara.length) return;

      const kalimat = suara[index];
      const utterance = new SpeechSynthesisUtterance(kalimat);
      utterance.lang = "id-ID";
      utterance.rate = 1.15;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        setTimeout(() => {
          index++;
          speakNext(); // lanjutkan setelah jeda 0.5 detik
        }, 500);
      };

      window.speechSynthesis.speak(utterance);
    }

    speakNext(); // mulai bicara pertama
  }, 1200); // jeda setelah intro audio
}

// Fungsi untuk mengumumkan tidak ada KBM
function announceNoKBM() {
  stopAnnouncement(); // Hentikan pengumuman sebelumnya
  introAudio.play();

  setTimeout(() => {
    const suara = [
      "Saat ini tidak ada kegiatan belajar mengajar.",
      "Silakan menunggu hingga jadwal KBM berikutnya dimulai.",
      "Terima kasih atas perhatiannya."
    ];

    let index = 0;

    function speakNext() {
      if (index >= suara.length) return;

      const kalimat = suara[index];
      const utterance = new SpeechSynthesisUtterance(kalimat);
      utterance.lang = "id-ID";
      utterance.rate = 1.15;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        setTimeout(() => {
          index++;
          speakNext();
        }, 500);
      };

      window.speechSynthesis.speak(utterance);
    }

    speakNext();
  }, 1200);
}

// Fungsi untuk mengumumkan waktu istirahat
function announceBreak(jamMulai, jamSelesai) {
  stopAnnouncement(); // Hentikan pengumuman sebelumnya
  introAudio.play();

  setTimeout(() => {
    const suara = [
      "Saat ini adalah waktu istirahat.",
      `Waktu istirahat dari pukul ${jamMulai} hingga ${jamSelesai}.`,
      "Silakan gunakan waktu istirahat dengan baik.",
      "Terima kasih atas perhatiannya."
    ];

    let index = 0;

    function speakNext() {
      if (index >= suara.length) return;

      const kalimat = suara[index];
      const utterance = new SpeechSynthesisUtterance(kalimat);
      utterance.lang = "id-ID";
      utterance.rate = 1.15;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        setTimeout(() => {
          index++;
          speakNext();
        }, 500);
      };

      window.speechSynthesis.speak(utterance);
    }

    speakNext();
  }, 1200);
}


// Fungsi untuk umumkan jadwal sekarang
function announceNow() {
  fetchData(true);
}

// Fungsi untuk berhenti mengumumkan
function stopAnnouncement() {
  introAudio.pause();
  introAudio.currentTime = 0;
  window.speechSynthesis.cancel();
}

// Fungsi untuk mengganti font
function toggleFont() {
  const fonts = ['Roboto', 'Arial', 'Courier New', 'Verdana'];
  const body = document.body;
  let currentFont = body.style.fontFamily || 'Roboto';
  let index = fonts.indexOf(currentFont);
  if (index === -1) index = 0;
  index = (index + 1) % fonts.length;
  body.style.fontFamily = fonts[index];
}

// Fungsi untuk mengubah ukuran font
function adjustFont(change) {
  currentFontSize += change;

  // Perbarui ukuran font .card dan semua elemen di dalamnya
  document.querySelectorAll(".card").forEach(card => {
    card.style.fontSize = `${currentFontSize}rem`;

    const mapel = card.querySelector(".mapel");
    const guru = card.querySelector(".guru");

    if (mapel) mapel.style.fontSize = `${currentFontSize * 2.3}rem`;
    if (guru) guru.style.fontSize = `${currentFontSize * 1.3}rem`;
  });
}

// Fungsi untuk menyesuaikan waktu jam (dalam jam)
function adjustTime(offset) {
  timeOffset += offset;
  updateClock();
  fetchData();
}

// Fungsi baru untuk menyesuaikan waktu menit
function adjustMinute(offset) {
  timeOffsetMinutes += offset;
  updateClock();
  fetchData();
}

// Fungsi untuk menyesuaikan hari
function adjustDay(offset) {
  dayOffset += offset;
  updateClock();
  fetchData();
}

// Fungsi untuk memuat daftar suara dan mengisi dropdown
function loadVoices() {
  const voices = window.speechSynthesis.getVoices();

  // Kosongkan dropdown kecuali opsi default
  while (voiceSelect.options.length > 1) {
    voiceSelect.remove(1);
  }

  // Filter untuk suara bahasa Indonesia (jika ada)
  const indonesianVoices = voices.filter(voice => voice.lang === 'id-ID' || voice.lang.startsWith('id'));

  // Jika tidak ada suara Indonesia, gunakan semua suara yang tersedia
  const voicesToShow = indonesianVoices.length > 0 ? indonesianVoices : voices;

  // Kelompokkan suara berdasarkan gender
  const maleVoices = [];
  const femaleVoices = [];
  const otherVoices = [];

  voicesToShow.forEach(voice => {
    // Deteksi gender berdasarkan nama
    const voiceName = voice.name.toLowerCase();
    const femaleKeywords = ['female', 'woman', 'girl', 'wanita', 'perempuan'];
    const maleKeywords = ['male', 'man', 'boy', 'pria', 'laki'];

    let isFemale = femaleKeywords.some(keyword => voiceName.includes(keyword));
    let isMale = maleKeywords.some(keyword => voiceName.includes(keyword));

    if (isFemale) {
      femaleVoices.push(voice);
    } else if (isMale) {
      maleVoices.push(voice);
    } else {
      otherVoices.push(voice);
    }
  });

  // Helper untuk membuat optgroup
  function createOptGroup(label, voiceList) {
    if (voiceList.length === 0) return;
    const optgroup = document.createElement('optgroup');
    optgroup.label = label;
    voiceList.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.voiceURI || voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      option.setAttribute('data-voice-index', voices.indexOf(voice));
      optgroup.appendChild(option);
    });
    voiceSelect.appendChild(optgroup);
  }

  createOptGroup('👩 Suara Wanita', femaleVoices);
  createOptGroup('👨 Suara Pria', maleVoices);
  createOptGroup('🔊 Suara Lainnya', otherVoices);

  // Jika sebelumnya ada suara yang dipilih, coba pilih lagi
  if (selectedVoice) {
    for (let i = 0; i < voiceSelect.options.length; i++) {
      if (voiceSelect.options[i].value === (selectedVoice.voiceURI || selectedVoice.name)) {
        voiceSelect.selectedIndex = i;
        break;
      }
    }
  }
}

// Fungsi untuk mengubah suara yang dipilih
function changeVoice() {
  const selectedOption = voiceSelect.options[voiceSelect.selectedIndex];
  if (!selectedOption || selectedOption.value === "") return;

  const voices = window.speechSynthesis.getVoices();
  let voice = null;

  if (selectedOption.hasAttribute('data-voice-index')) {
    const voiceIndex = parseInt(selectedOption.getAttribute('data-voice-index'));
    if (!isNaN(voiceIndex) && voiceIndex >= 0 && voiceIndex < voices.length) {
      voice = voices[voiceIndex];
    }
  }

  if (!voice) {
    voice = voices.find(v => (v.voiceURI === selectedOption.value) || (v.name === selectedOption.value));
  }

  if (voice) {
    selectedVoice = voice;
    console.log(`Suara diubah ke: ${voice.name}`);
    stopAnnouncement();

    const utterance = new SpeechSynthesisUtterance("Suara telah diubah ke " + voice.name);
    utterance.lang = voice.lang || "id-ID";
    utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }
}

// Event Listeners
voiceSelect.addEventListener('change', changeVoice);

if ('onvoiceschanged' in speechSynthesis) {
  speechSynthesis.addEventListener('voiceschanged', loadVoices);
} else {
  setTimeout(loadVoices, 1000);
}

// Deteksi interaksi pengguna
let lastInteractionTime = Date.now();
['click', 'mousemove', 'keydown', 'touchstart'].forEach(event => {
  window.addEventListener(event, () => {
    lastInteractionTime = Date.now();
  });
});

// Refresh otomatis jika tidak ada interaksi selama 2 menit
setInterval(() => {
  if (Date.now() - lastInteractionTime >= 120000) {
    fetchData();
  }
}, 30000);

// Load voices on page load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(loadVoices, 500);
  setTimeout(loadVoices, 2000);
});

// Sinkronisasi suara
setInterval(() => {
  if (window.speechSynthesis && selectedVoice) {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.includes(selectedVoice)) {
      const sameVoice = voices.find(v => v.name === selectedVoice.name);
      if (sameVoice) {
        selectedVoice = sameVoice;
      }
    }
  }
}, 30000);


// ===== FITUR MODAL JADWAL =====

function showSchedule() {
  const modal = document.getElementById('scheduleModal');
  const content = document.getElementById('scheduleContent');

  if (!globalBelData || !globalBelKhususData) {
    alert("Data jadwal belum dimuat. Tunggu sebentar...");
    return;
  }

  // Tentukan hari aktif berdasarkan offset
  const now = new Date();
  now.setDate(now.getDate() + dayOffset);
  let hari = now.toLocaleDateString('id-ID', { weekday: 'long' }).toUpperCase();
  if (hari === 'MINGGU') hari = 'AHAD';

  const isKamis = hari === 'KAMIS';
  const data = isKamis ? globalBelKhususData : globalBelData;

  // Filter Shift
  const jadwalPutra = data.filter(d => d.Shift === 'PUTRA');
  const jadwalPutri = data.filter(d => d.Shift === 'PUTRI');

  // Render HTML
  let html = `
    <h2 style="text-align: center; margin-bottom: 5px; color: #FFD700;">JADWAL BEL HARIAN</h2>
    <h3 style="text-align: center; margin-bottom: 20px; color: #fff;">Hari: ${hari} ${isKamis ? '(Khusus)' : ''}</h3>
    
    <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
      <!-- Tabel Putra -->
      <div style="flex: 1; min-width: 300px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 12px; border: 1px solid rgba(0,255,255,0.3);">
        <h4 style="text-align: center; color: #00ffff; border-bottom: 1px solid #00ffff; padding-bottom: 10px; margin-top: 0;">SHIFT PUTRA (Pagi)</h4>
        <table style="width: 100%; border-collapse: collapse; color: white;">
          <tr style="background: rgba(0,255,255,0.1);">
            <th style="padding: 8px; text-align: center;">Jam</th>
            <th style="padding: 8px; text-align: center;">Waktu</th>
          </tr>
          ${jadwalPutra.map((row, i) => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); background: ${row['Jam Ke-'] === 'IST' ? 'rgba(255,255,0,0.1)' : (i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.05)')}">
              <td style="padding: 6px; text-align: center; font-weight: bold;">${row['Jam Ke-']}</td>
              <td style="padding: 6px; text-align: center;">${row['Jam Mulai']} - ${row['Jam Selesai']}</td>
            </tr>
          `).join('')}
        </table>
      </div>

      <!-- Tabel Putri -->
      <div style="flex: 1; min-width: 300px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,105,180,0.3);">
        <h4 style="text-align: center; color: #ff69b4; border-bottom: 1px solid #ff69b4; padding-bottom: 10px; margin-top: 0;">SHIFT PUTRI (Siang)</h4>
        <table style="width: 100%; border-collapse: collapse; color: white;">
          <tr style="background: rgba(255,105,180,0.1);">
            <th style="padding: 8px; text-align: center;">Jam</th>
            <th style="padding: 8px; text-align: center;">Waktu</th>
          </tr>
          ${jadwalPutri.map((row, i) => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); background: ${row['Jam Ke-'] === 'IST' ? 'rgba(255,255,0,0.1)' : (i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.05)')}">
              <td style="padding: 6px; text-align: center; font-weight: bold;">${row['Jam Ke-']}</td>
              <td style="padding: 6px; text-align: center;">${row['Jam Mulai']} - ${row['Jam Selesai']}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    </div>
  `;

  content.innerHTML = html;
  modal.style.display = 'flex';
}

function closeSchedule() {
  document.getElementById('scheduleModal').style.display = 'none';
}

// Tutup modal jika klik di luar area konten
window.onclick = function (event) {
  const modal = document.getElementById('scheduleModal');
  if (event.target == modal) {
    closeSchedule();
  }
}

function showFullSchedule(targetShift = 'SEMUA') {
  const modal = document.getElementById('scheduleModal');
  const content = document.getElementById('scheduleContent');

  if (!globalJadwalData) {
    alert("Data jadwal belum dimuat. Tunggu sebentar...");
    return;
  }

  // Tentukan hari aktif
  const now = new Date();
  now.setDate(now.getDate() + dayOffset);
  let hari = now.toLocaleDateString('id-ID', { weekday: 'long' }).toUpperCase();
  if (hari === 'MINGGU') hari = 'AHAD';

  // Filter data berdasarkan hari
  const scheduleToday = globalJadwalData.filter(d => d.Hari && d.Hari.toString().trim().toUpperCase() === hari);

  if (scheduleToday.length === 0) {
    content.innerHTML = `<h3 style="text-align:center; color:white;">Tidak ada jadwal untuk hari ${hari} (Data Kosong)</h3>`;
    modal.style.display = 'flex';
    return;
  }

  // --- LOGIKA PIVOT TABEL ---
  const allClasses = [...new Set(scheduleToday.map(d => d.Kelas))].sort();
  const allJams = [...new Set(scheduleToday.map(d => parseInt(d['Jam Ke-'])))].sort((a, b) => a - b);
  const maxJam = Math.max(...allJams);

  // Pisahkan Kelas
  const classesPagi = allClasses.filter(c => c.match(/[ABC]$/));
  const classesSiang = allClasses.filter(c => c.match(/[DEFG]$/));
  const sisaKelas = allClasses.filter(c => !c.match(/[ABC]$/) && !c.match(/[DEFG]$/));
  if (sisaKelas.length > 0) classesPagi.push(...sisaKelas);
  classesPagi.sort();

  function createTableHTML(title, classes) {
    if (classes.length === 0) return '';
    let tableHtml = `
      <div style="margin-bottom: 25px; background: rgba(0,0,0,0.4); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <h3 style="color: #FFD700; border-left: 4px solid #FFD700; padding-left: 10px; margin-top:0;">${title}</h3>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; color: white;">
            <thead>
              <tr style="background: rgba(255,255,255,0.1);">
                <th style="border: 1px solid rgba(255,255,255,0.2); padding: 8px; width: 50px;">Jam</th>
                ${classes.map(cls => `<th style="border: 1px solid rgba(255,255,255,0.2); padding: 8px; min-width: 80px;">${cls}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
    `;

    for (let jam = 1; jam <= maxJam; jam++) {
      tableHtml += `<tr>
        <td style="border: 1px solid rgba(255,255,255,0.2); padding: 6px; text-align: center; font-weight: bold; background: rgba(255,255,255,0.05);">${jam}</td>`;
      classes.forEach(cls => {
        const entry = scheduleToday.find(d => parseInt(d['Jam Ke-']) === jam && d.Kelas === cls);
        const mapel = entry ? entry['Nama Mapel'] : '-';
        tableHtml += `<td style="border: 1px solid rgba(255,255,255,0.2); padding: 6px; text-align: center;">${mapel}</td>`;
      });
      tableHtml += `</tr>`;
    }

    tableHtml += `</tbody></table></div></div>`;
    return tableHtml;
  }

  // Render
  let titleShift = targetShift === 'SEMUA' ? 'LENGKAP' : targetShift;
  let html = `
    <h2 style="text-align: center; margin-bottom: 5px; color: #fff;">JADWAL PELAJARAN ${titleShift}</h2>
    <h3 style="text-align: center; margin-bottom: 25px; color: #00ffff;">HARI: ${hari}</h3>
  `;

  if (targetShift === 'PAGI') {
    html += createTableHTML('K B M  -  P A G I', classesPagi);
  } else if (targetShift === 'SIANG') {
    html += createTableHTML('K B M  -  S I A N G', classesSiang);
  } else {
    html += createTableHTML('K B M  -  P A G I', classesPagi);
    html += createTableHTML('K B M  -  S I A N G', classesSiang);
  }

  content.innerHTML = html;
  modal.style.display = 'flex';
}
