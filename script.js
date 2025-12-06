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
    const [dataJadwal, dataBel, dataBelKhusus] = await Promise.all([
      fetch(endpointDatabase).then(r => r.json()),
      fetch(endpointBel).then(r => r.json()),
      fetch(endpointBelKhusus).then(r => r.json()) // Tambahkan fetch untuk BEL KHUSUS
    ]);

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
    gridContainer.className = "grid center-message";
    gridContainer.innerHTML = `<div>Gagal memuat data</div>`;
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

  // Debug: log total suara yang tersedia
  console.log(`Total suara tersedia: ${voices.length}`);

  // Kosongkan dropdown kecuali opsi default
  while (voiceSelect.options.length > 1) {
    voiceSelect.remove(1);
  }

  // Filter untuk suara bahasa Indonesia (jika ada)
  const indonesianVoices = voices.filter(voice => voice.lang === 'id-ID' || voice.lang.startsWith('id'));

  console.log(`Jumlah suara Indonesia: ${indonesianVoices.length}`);

  // Jika tidak ada suara Indonesia, gunakan semua suara yang tersedia
  const voicesToShow = indonesianVoices.length > 0 ? indonesianVoices : voices;

  // Kelompokkan suara berdasarkan gender (jika informasi tersedia)
  const maleVoices = [];
  const femaleVoices = [];
  const otherVoices = [];

  voicesToShow.forEach(voice => {
    // Debug: log info masing-masing suara
    console.log(`Suara: ${voice.name}, Bahasa: ${voice.lang}, Default: ${voice.default}`);

    // Deteksi gender berdasarkan nama (tidak sempurna tapi cukup untuk kebanyakan kasus)
    const voiceName = voice.name.toLowerCase();

    // Kata kunci untuk mendeteksi suara wanita
    const femaleKeywords = ['female', 'woman', 'girl', 'wanita', 'perempuan'];

    // Kata kunci untuk mendeteksi suara pria
    const maleKeywords = ['male', 'man', 'boy', 'pria', 'laki'];

    let isFemale = femaleKeywords.some(keyword => voiceName.includes(keyword));
    let isMale = maleKeywords.some(keyword => voiceName.includes(keyword));

    // Pengelompokan berdasarkan kata kunci
    if (isFemale) {
      femaleVoices.push(voice);
    } else if (isMale) {
      maleVoices.push(voice);
    } else {
      otherVoices.push(voice);
    }
  });

  // Tambahkan grup suara wanita dengan label
  if (femaleVoices.length > 0) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = '👩 Suara Wanita';

    femaleVoices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.voiceURI || voice.name; // Gunakan voiceURI jika tersedia
      option.textContent = `${voice.name} (${voice.lang})`;
      option.setAttribute('data-voice-index', voices.indexOf(voice)); // Simpan indeks suara
      optgroup.appendChild(option);
    });

    voiceSelect.appendChild(optgroup);
  }

  // Tambahkan grup suara pria dengan label
  if (maleVoices.length > 0) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = '👨 Suara Pria';

    maleVoices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.voiceURI || voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      option.setAttribute('data-voice-index', voices.indexOf(voice));
      optgroup.appendChild(option);
    });

    voiceSelect.appendChild(optgroup);
  }

  // Tambahkan suara lainnya jika ada
  if (otherVoices.length > 0) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = '🔊 Suara Lainnya';

    otherVoices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.voiceURI || voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      option.setAttribute('data-voice-index', voices.indexOf(voice));
      optgroup.appendChild(option);
    });

    voiceSelect.appendChild(optgroup);
  }

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

  // Coba dapatkan suara berdasarkan indeks yang disimpan
  let voice = null;
  if (selectedOption.hasAttribute('data-voice-index')) {
    const voiceIndex = parseInt(selectedOption.getAttribute('data-voice-index'));
    if (!isNaN(voiceIndex) && voiceIndex >= 0 && voiceIndex < voices.length) {
      voice = voices[voiceIndex];
    }
  }

  // Jika tidak berhasil, coba dengan cara lain
  if (!voice) {
    voice = voices.find(v => (v.voiceURI === selectedOption.value) || (v.name === selectedOption.value));
  }

  if (voice) {
    selectedVoice = voice;
    console.log(`Suara diubah ke: ${voice.name} (${voice.lang})`);

    // Test suara yang dipilih
    stopAnnouncement();

    const utterance = new SpeechSynthesisUtterance("Suara telah diubah ke " + voice.name);
    utterance.lang = voice.lang || "id-ID";
    utterance.voice = voice;

    // Log untuk debugging
    console.log("Setting utterance.voice =", voice.name);

    window.speechSynthesis.speak(utterance);

    // Lakukan pengumuman jadwal saat ini dengan suara baru
    setTimeout(() => {
      fetchData(true);
    }, 5000);
  } else {
    console.error("Tidak dapat menemukan suara:", selectedOption.value);
  }
}

// Tambahkan event listener untuk perubahan pada select
voiceSelect.addEventListener('change', changeVoice);

// Event listener untuk perubahan daftar suara
if ('onvoiceschanged' in speechSynthesis) {
  speechSynthesis.addEventListener('voiceschanged', () => {
    loadVoices();
  });
} else {
  // Fallback untuk browser yang tidak mendukung event onvoiceschanged
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

// Load voices on page load (for browsers where onvoiceschanged might not fire)
document.addEventListener('DOMContentLoaded', () => {
  // Upaya pertama untuk memuat suara
  setTimeout(() => {
    loadVoices();
  }, 100);

  // Upaya kedua untuk memuat suara (untuk beberapa browser yang lambat)
  setTimeout(loadVoices, 2000);
});

// Sinkronisasi suara - berjaga-jaga jika speechSynthesis kehilangan konteksnya
setInterval(() => {
  if (window.speechSynthesis && selectedVoice) {
    const voices = window.speechSynthesis.getVoices();
    // Pastikan voice yang dipilih masih ada dalam daftar
    if (!voices.includes(selectedVoice)) {
      const sameVoice = voices.find(v => v.name === selectedVoice.name);
      if (sameVoice) {
        selectedVoice = sameVoice;
        console.log("Restored voice reference:", selectedVoice.name);
      }
    }
  }
}, 30000);