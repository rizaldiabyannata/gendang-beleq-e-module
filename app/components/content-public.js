// Dihasilkan oleh scripts/build-content.mjs — jangan disunting langsung.
// Sunting content/defaults.mjs lalu jalankan: bun run content
const CONTENT = {
  "identitas": {
    "penulis": "Melani Aulia Khatami",
    "instansi": "Universitas Mataram",
    "fase": "F / XI · SMA/MA",
    "mapel": "Fisika · Semester Genap",
    "pertemuan": "3 × 3 JP",
    "tahun": "2026 / 2027",
    "kataKunci": "Komponen gelombang bunyi, cepat rambat bunyi, intensitas & taraf intensitas, efek Doppler"
  },
  "tujuan": [
    "Menjelaskan pengertian dan komponen gelombang bunyi melalui fenomena Gendang Beleq.",
    "Mengidentifikasi sumber bunyi pada Gendang Beleq beserta buktinya.",
    "Menganalisis pengaruh ketegangan dan ukuran membran terhadap frekuensi bunyi.",
    "Menghitung cepat rambat bunyi menggunakan hubungan v = λ · f.",
    "Membedakan intensitas dan taraf intensitas bunyi pada tabuhan gendang.",
    "Menjelaskan efek Doppler pada peristiwa pawai nyongkolan.",
    "Menyajikan hasil penyelidikan sederhana secara jujur dan sistematis."
  ],
  "pendahuluan": {
    "judul": "Pernahkah kamu terlena mendengar alunan musik?",
    "teks": "Kombinasi suara tinggi dan rendah yang harmonis menciptakan keindahan tersendiri — suling, gitar, piano, biola, semuanya punya warna suara berbeda sehingga kita bisa membedakannya. Pada dasarnya bunyi tercipta dari getaran yang menggetarkan udara di sekitarnya. Getaran itu merambat, menggetarkan gendang telinga kita, dan hasilnya adalah suara yang kita dengar.",
    "pemantik": "Kalau bunyi berasal dari getaran, bagian mana dari gendang beleq yang sebenarnya bergetar — dan mengapa tabuhan di tengah terdengar berbeda dari tabuhan di pinggir?"
  },
  "kesenian": {
    "judul": "Bunyi gendang beleq adalah gelombang akustik",
    "p1": "Gelombang bunyi dapat menjalar pada medium gas, cair, maupun padat. Partikel medium berosilasi searah penjalaran gelombang — inilah yang disebut gelombang longitudinal: arah getarnya sejajar dengan arah rambatnya.",
    "p2": "Gendang beleq adalah kesenian ansambel kebanggaan masyarakat Sasak di Lombok, dimainkan dengan cara ditabuh secara berkelompok. Seluruh instrumennya bekerja seimbang, saling menutupi dan melengkapi — cerminan keseimbangan kolektif dalam musik tradisi timur.",
    "catatan": "Gendang Mame (jantan) berukuran lebih besar dengan nada lebih rendah, Gendang Nine (perempuan) lebih kecil dengan nada lebih tinggi. Coba bandingkan keduanya di Lab Simulasi."
  },
  "videoUrl": "",
  "glosarium": [
    {
      "term": "Amplitudo",
      "def": "Besarnya simpangan maksimum dari posisi keseimbangan. Pada bunyi, amplitudo menentukan seberapa keras suara yang dihasilkan."
    },
    {
      "term": "Cepat Rambat Bunyi",
      "def": "Kecepatan gelombang bunyi merambat melalui medium tertentu; bergantung pada sifat medium seperti kerapatan dan elastisitas."
    },
    {
      "term": "Efek Doppler",
      "def": "Naik atau turunnya frekuensi bunyi yang diterima pendengar ketika sumber bunyi bergerak mendekat atau menjauh."
    },
    {
      "term": "Frekuensi",
      "def": "Banyaknya getaran yang terjadi dalam setiap satu detik, bersatuan hertz (Hz)."
    },
    {
      "term": "Periode",
      "def": "Waktu yang dibutuhkan untuk satu kali getaran penuh; T = 1/f."
    },
    {
      "term": "Intensitas",
      "def": "Daya bunyi yang menembus bidang tiap satuan luas permukaan secara tegak lurus."
    },
    {
      "term": "Interferensi",
      "def": "Paduan dua gelombang atau lebih menjadi satu gelombang baru; dapat saling menguatkan atau melemahkan."
    },
    {
      "term": "Gelombang Longitudinal",
      "def": "Gelombang yang arah getarnya sejajar dengan arah rambatannya — seperti bunyi di udara."
    },
    {
      "term": "Ultrasonik",
      "def": "Gelombang bunyi dengan frekuensi di atas kemampuan pendengaran manusia (>20.000 Hz)."
    }
  ],
  "materi": {
    "mersenne": {
      "judul": "Hukum Mersenne pada membran gendang",
      "rumus": "f ∝ (1 / d) · √(T / σ)",
      "vars": [
        [
          "f",
          "frekuensi dasar membran (Hz)"
        ],
        [
          "d",
          "diameter membran (m) — makin besar, makin rendah nadanya"
        ],
        [
          "T",
          "tegangan kulit (N/m) — dikencangkan lewat pasak rotan (pantok)"
        ],
        [
          "σ",
          "massa kulit per satuan luas (kg/m²) — kulit tebal bergetar lebih lambat"
        ]
      ],
      "teks": "Tiga hal yang diatur pengrajin Sasak persis tiga besaran di rumus ini. Gendang Mame dibuat berdiameter besar dengan kulit lebih kendur, jadi d besar dan T kecil — frekuensinya rendah, nadanya bass. Gendang Nine dibuat lebih kecil dan lebih kencang, jadi d kecil dan T besar — frekuensinya tinggi, nadanya treble.",
      "cek": "Buktikan di Lab Simulasi: geser ketegangan dari Kendur ke Kencang dan baca angka frekuensinya. Naik atau turun? Bandingkan juga Mame dengan Nine pada ketegangan yang sama."
    },
    "pelayangan": {
      "judul": "Pelayangan: dua gendang, satu denyut",
      "rumus": "fₗₐᵧₐₙᵧₐₙ = | f₁ − f₂ |",
      "teks": "Ketika Gendang Mame dan Gendang Nine ditabuh bersamaan dengan frekuensi yang berdekatan, kedua gelombang saling menguatkan lalu saling melemahkan secara bergantian. Telinga menangkapnya sebagai satu bunyi yang keras–lemah–keras–lemah: itulah pelayangan.",
      "contoh": "Jika Mame berbunyi 148 Hz dan Nine 152 Hz, akan terdengar 4 layangan tiap detik. Inilah yang dikejar pengrajin saat menyetel pantok dengan telinga: mereka mengatur ketegangan sampai denyutnya terasa pas.",
      "local": "Inilah arti akustik dari \"saling menutupi dan melengkapi\" pada ansambel gendang beleq."
    },
    "mameNine": [
      [
        "Diameter membran",
        "Lebih besar",
        "Lebih kecil"
      ],
      [
        "Ketegangan kulit",
        "Lebih rendah",
        "Lebih kencang"
      ],
      [
        "Kecepatan getar",
        "Lebih lambat",
        "Lebih cepat"
      ],
      [
        "Frekuensi",
        "Rendah",
        "Tinggi"
      ],
      [
        "Karakter nada",
        "Bass",
        "Treble"
      ]
    ],
    "konsep": {
      "komponen": [
        "Komponen Gelombang",
        "Amplitudo, frekuensi, periode, fase, panjang gelombang, dan cepat rambat — semuanya dimiliki bunyi karena bunyi adalah gelombang."
      ],
      "klas": [
        "Klasifikasi Frekuensi",
        "Infrasonik (0–20 Hz), audiosonik (20–20.000 Hz), dan ultrasonik (>20.000 Hz). Telinga manusia hanya menangkap rentang audiosonik."
      ],
      "sifat": [
        "Sifat Gelombang Bunyi",
        "Bunyi dapat dipantulkan (refleksi), dilenturkan (difraksi), dan dipadukan (interferensi) — dan selalu butuh medium."
      ],
      "cepat": [
        "Cepat Rambat Bunyi",
        "v = λ · f. Nilainya ditentukan oleh medium dan suhu, bukan oleh frekuensi sumber bunyi."
      ],
      "intens": [
        "Intensitas & Taraf Intensitas",
        "Intensitas adalah daya bunyi per satuan luas; taraf intensitas dinyatakan dalam desibel (dB). Makin kuat tabuhan, makin besar taraf intensitasnya."
      ],
      "dop": [
        "Efek Doppler",
        "Perubahan frekuensi yang terdengar karena gerak relatif sumber bunyi dan pendengar — persis yang terjadi saat rombongan nyongkolan melintas."
      ]
    },
    "resonansiSteps": [
      {
        "tag": "01",
        "title": "Kayu tawa atau nangka dipilih",
        "body": "Pengrajin Sasak memilih batang kayu tawa atau nangka, lalu mengerok bagian tengahnya secara manual hingga menjadi tabung silinder berongga yang presisi."
      },
      {
        "tag": "02",
        "title": "Rongga jadi ruang resonansi",
        "body": "Resonansi adalah ikut bergetarnya suatu benda karena benda lain bergetar pada frekuensi alamiah yang sama. Udara di dalam tabung ikut bergetar dan memperkuat getaran membran."
      },
      {
        "tag": "03",
        "title": "Dinding cembung menahan bunyi lebih lama",
        "body": "Tabung gendang beleq sedikit melengkung cembung di tengah. Bentuk ini memantulkan gelombang berdiri ke pusat tabung sehingga dentuman bass bertahan lebih lama (sustain)."
      }
    ],
    "mediumRows": [
      {
        "medium": "Udara (20 °C)",
        "v": "343 m/s",
        "note": "Medium pertunjukan nyongkolan"
      },
      {
        "medium": "Air",
        "v": "≈ 1.500 m/s",
        "note": "Lebih rapat, bunyi lebih cepat"
      },
      {
        "medium": "Zat padat (besi)",
        "v": "≈ 5.100 m/s",
        "note": "Paling elastis, paling cepat"
      }
    ],
    "dopplerVars": [
      {
        "sym": "fₚ",
        "def": "frekuensi yang didengar pendengar (Hz)"
      },
      {
        "sym": "fₛ",
        "def": "frekuensi sumber bunyi (Hz)"
      },
      {
        "sym": "v",
        "def": "cepat rambat bunyi di udara (m/s)"
      },
      {
        "sym": "vₚ",
        "def": "kecepatan pendengar (m/s)"
      },
      {
        "sym": "vₛ",
        "def": "kecepatan sumber bunyi (m/s)"
      }
    ],
    "tahukahResonansi": "Pengrajin Sasak tidak memakai tuner digital saat menyetel Gendang Mame dan Nine. Mereka hanya mengandalkan pendengaran dan perasaan untuk mengatur pasak rotan (pantok) sampai selisih frekuensi laki-laki dan perempuan terdengar harmonis.",
    "tahukahKulit": "Kulit sapi untuk gendang direndam air kapur dan dikeringkan di bawah matahari tanpa mesin peregang. Perlakuan alami ini menjaga serat kolagen tetap elastis — serat inilah yang memberi timbre khas yang tidak bisa ditiru mika sintetis.",
    "pemantikResonansi": [
      "Apa yang terjadi pada volume dan kualitas suara gendang beleq jika rongga tabungnya disumbat kain padat? Jelaskan dengan prinsip resonansi.",
      "Walau dipukul pada frekuensi yang sama, mengapa kamu tetap bisa membedakan suara gendang beleq dari drum modern?",
      "Saat siang panas, apakah cepat rambat bunyi gendang beleq lebih besar daripada malam yang dingin? Buktikan dengan rumus."
    ],
    "pemantikDoppler": [
      "Rombongan nyongkolan mendekati penonton dengan kecepatan 2 m/s. Jika gendang ditabuh pada 200 Hz dan cepat rambat bunyi 340 m/s, berapa frekuensi yang didengar penonton?",
      "Mengapa penabuh yang ikut berjalan di dalam rombongan tidak merasakan efek Doppler dari gendangnya sendiri?",
      "Bagaimana suhu udara siang di Lombok memengaruhi nilai v, dan apa dampaknya pada besar perubahan frekuensi?"
    ],
    "instrumen": [
      "Gendang Mame",
      "Gendang Nine",
      "Cemprang",
      "Perembak",
      "Petuk",
      "Oncer",
      "Rincik",
      "Reong Mame",
      "Reong Nine",
      "Gong Mame",
      "Gong Nine"
    ],
    "komponen": [
      {
        "tag": "A",
        "title": "Amplitudo (A)",
        "body": "Simpangan maksimum getaran. Amplitudo menentukan keras-lemahnya bunyi: makin besar amplitudo getaran membran, makin keras bunyi yang dihasilkan. Satuannya meter.",
        "rumus": "satuan: meter (m)"
      },
      {
        "tag": "f",
        "title": "Frekuensi (f)",
        "body": "Jumlah getaran yang terjadi dalam satu detik. Frekuensi menentukan tinggi-rendahnya nada — nada tinggi berfrekuensi besar, nada rendah berfrekuensi kecil.",
        "rumus": "f = n / t   ·   satuan: hertz (Hz)"
      },
      {
        "tag": "T",
        "title": "Periode (T)",
        "body": "Waktu yang dibutuhkan untuk membuat satu kali osilasi. Periode berbanding terbalik dengan frekuensi.",
        "rumus": "T = 1 / f   ·   satuan: sekon (s)"
      }
    ],
    "klasifikasi": [
      {
        "name": "Infrasonik",
        "range": "0 – 20 Hz",
        "body": "Tak terdengar telinga manusia. Gajah, merpati, dan paus mampu menangkapnya — itu sebabnya sebagian hewan lebih dulu menjauh sebelum letusan gunung atau gempa."
      },
      {
        "name": "Audiosonik",
        "range": "20 – 20.000 Hz",
        "body": "Rentang yang dapat didengar manusia. Percakapan normal berada pada 512–2048 Hz. Bisikan dan teriakan berbeda pada amplitudo, bukan frekuensi: teriakan jauh lebih keras, bukan otomatis lebih tinggi nadanya."
      },
      {
        "name": "Ultrasonik",
        "range": "> 20.000 Hz",
        "body": "Di atas ambang pendengaran manusia. Lumba-lumba adalah salah satu hewan yang mampu mendengarnya."
      }
    ],
    "langkahSolusi": [
      {
        "step": "Diketahui",
        "text": "f = 243 Hz"
      },
      {
        "step": "Ditanyakan",
        "text": "T = … ?"
      },
      {
        "step": "Rumus",
        "text": "T = 1 / f"
      },
      {
        "step": "Penyelesaian",
        "text": "T = 1 / 243 = 4,12 × 10⁻³ s (sekitar 0,0041 sekon)"
      }
    ],
    "sifat": [
      {
        "title": "1 · Pemantulan (refleksi)",
        "body": "Hukum pemantulan berlaku pada bunyi: sudut datang sama dengan sudut pantul. Dalam ruang tertutup, bunyi pantul yang datang hampir bersamaan dengan bunyi asli menimbulkan gaung. Karena itu studio dan gedung konser dilapisi bahan peredam.",
        "local": "tabuhan gendang di lapangan terbuka terdengar lebih “bersih” daripada di dalam gedung."
      },
      {
        "title": "2 · Pelenturan (difraksi)",
        "body": "Bunyi mudah berdifraksi karena panjang gelombangnya besar — sentimeter sampai meter. Itu sebabnya kita mendengar suara mesin mobil di tikungan sebelum melihatnya.",
        "local": "bunyi rombongan gendang beleq sudah terdengar sebelum rombongannya kelihatan di ujung jalan."
      },
      {
        "title": "3 · Perpaduan (interferensi)",
        "body": "Dua gelombang bunyi dapat saling menguatkan (konstruktif) atau melemahkan (destruktif). Berdiri di antara dua speaker berfrekuensi hampir sama membuat kita mendengar bunyi keras dan lemah bergantian.",
        "local": "sepasang Gendang Mame dan Nine yang ditabuh bersamaan menghasilkan pola bunyi yang naik-turun."
      }
    ],
    "syarat": [
      {
        "n": 1,
        "text": "Ada sumber bunyi — benda yang bergetar."
      },
      {
        "n": 2,
        "text": "Ada medium untuk merambatkan gelombang bunyi."
      },
      {
        "n": 3,
        "text": "Ada penerima bunyi dalam jangkauan sumber bunyi."
      }
    ],
    "pustaka": [
      "Hikmawati, H., dkk. (2022). Metode Eksperimen pada Pembelajaran IPA dengan Konteks Kearifan Lokal untuk Meningkatkan Hasil Belajar Siswa. GeoScienceEd Journal, 3(2), 11–15.",
      "Kanginan, M., & Ardian, P. (2023). Fisika untuk SMA-MA.",
      "Lestari, N. K. (2022). Buku Fisika Kelas XI. Erlangga Mahameru.",
      "Radjawane, M. M., Alvius, T., & Jono, S. (2023). Buku Fisika. Kemendikbudristek.",
      "Ruwanto, B. (2023). Buku Fisika Kelas XI. Perpustakaan Nasional: KDT.",
      "Wahyu, Y., Edu, A. L., & Nardi, M. (2020). Problematika Pemanfaatan Media Pembelajaran IPA di Sekolah Dasar. Jurnal Penelitian Pendidikan IPA, 6(1), 107–112."
    ]
  },
  "penilaian": {
    "bobotKuis": 50,
    "bobotLkpd": 25,
    "bobotEsai": 25,
    "kkmModul": 75
  },
  "langkah": {
    "info": true,
    "materi": true,
    "lab": true,
    "lkpd": true,
    "kuis": true,
    "rangkuman": true
  },
  "banks": [
    {
      "id": "b1",
      "title": "Latihan Soal · Konsep Dasar Bunyi",
      "desc": "Pemanasan setelah membaca materi komponen gelombang.",
      "open": true,
      "kkm": 70,
      "items": [
        {
          "type": "pg",
          "q": "Bunyi tabuhan Gendang Beleq merambat melalui medium yang berbeda sehingga waktu sampainya ke pendengar juga berbeda. Pernyataan yang paling tepat adalah…",
          "opts": [
            "Setiap medium memiliki kemampuan merambatkan bunyi yang berbeda",
            "Semua medium memiliki cepat rambat bunyi yang sama",
            "Bunyi hanya merambat jika mediumnya air",
            "Frekuensi bunyi berubah mengikuti warna medium",
            "Nada bunyi menentukan jenis medium"
          ]
        },
        {
          "type": "bs",
          "q": "Bunyi tabuhan gendang beleq termasuk gelombang longitudinal karena arah getar partikel udara sejajar dengan arah rambatnya."
        },
        {
          "type": "pg",
          "q": "Dalam laporannya, Gisna menulis \"frekuensi bunyi 440 Hz, jadi cepat rambat bunyi 440 m/s\". Kalimat perbaikan yang paling tepat adalah…",
          "opts": [
            "Pernyataan benar karena Hz sama dengan m/s",
            "Pernyataan benar jika bunyinya keras",
            "Cepat rambat bunyi ditentukan oleh medium dan suhu, bukan oleh frekuensi sumber",
            "Cepat rambat bunyi ditentukan oleh amplitudo",
            "Cepat rambat bunyi selalu 340 m/s pada semua kondisi"
          ]
        },
        {
          "type": "isian",
          "q": "Bunyi tabuhan gendang di udara berfrekuensi 500 Hz dengan panjang gelombang 0,70 m. Berapa cepat rambat bunyinya? Tulis angkanya saja dalam m/s."
        },
        {
          "type": "multi",
          "q": "Manakah yang termasuk komponen gelombang bunyi tabuhan gendang? Pilih SEMUA yang benar.",
          "opts": [
            "Amplitudo",
            "Frekuensi",
            "Warna cahaya",
            "Panjang gelombang",
            "Massa pendengar"
          ]
        }
      ]
    },
    {
      "id": "b2",
      "title": "Tes Formatif · Intensitas & Doppler",
      "desc": "Uji pemahaman setelah lab simulasi dan LKPD.",
      "open": true,
      "kkm": 75,
      "items": [
        {
          "type": "pg",
          "q": "Dalam pertunjukan Gendang Beleq, seorang pemain memukul gendang lebih kuat dari sebelumnya. Akibat yang paling mungkin terjadi adalah…",
          "opts": [
            "Frekuensi bunyi bertambah sehingga nada lebih tinggi",
            "Intensitas bunyi bertambah sehingga bunyi terdengar lebih keras",
            "Cepat rambat bunyi berkurang sehingga bunyi melemah",
            "Periode bunyi bertambah sehingga bunyi makin pelan",
            "Panjang gelombang tetap sehingga bunyi tidak berubah"
          ]
        },
        {
          "type": "pg",
          "q": "Alat yang paling sesuai untuk mengukur taraf intensitas bunyi dalam percobaan di kelas adalah…",
          "opts": [
            "Stopwatch",
            "Termometer",
            "Neraca pegas",
            "Amperemeter",
            "Sound level meter"
          ]
        },
        {
          "type": "bs",
          "q": "Ketika rombongan nyongkolan menjauh dari penonton, frekuensi bunyi yang keluar dari gendang itu sendiri ikut mengecil."
        },
        {
          "type": "isian",
          "q": "Satuan taraf intensitas bunyi yang dibaca sound level meter adalah…"
        },
        {
          "type": "multi",
          "q": "Rombongan penabuh mendekati penonton yang berdiri diam. Manakah pernyataan yang BENAR? Pilih semua.",
          "opts": [
            "Gelombang bunyi di depan sumber termampatkan",
            "Frekuensi yang didengar lebih tinggi dari frekuensi sumber",
            "Panjang gelombang di depan sumber bertambah panjang",
            "Cepat rambat bunyi di udara ikut bertambah",
            "Peristiwa ini disebut efek Doppler"
          ]
        }
      ]
    },
    {
      "id": "b3",
      "title": "Kuis Cepat · Benar atau Salah",
      "desc": "Sepuluh detik per soal. Cocok untuk apersepsi di awal kelas.",
      "open": true,
      "kkm": 70,
      "items": [
        {
          "type": "bs",
          "q": "Bunyi dapat merambat melalui ruang hampa udara."
        },
        {
          "type": "bs",
          "q": "Gendang Mame berukuran lebih besar dan menghasilkan nada lebih rendah dibanding Gendang Nine."
        },
        {
          "type": "bs",
          "q": "Membran gendang yang dikencangkan akan menghasilkan nada yang lebih rendah."
        },
        {
          "type": "bs",
          "q": "Rongga kayu pada badan gendang berfungsi sebagai ruang resonansi yang memperkuat bunyi."
        },
        {
          "type": "bs",
          "q": "Bunyi ultrasonik adalah bunyi dengan frekuensi di bawah 20 Hz."
        },
        {
          "type": "bs",
          "q": "Bunyi merambat lebih cepat di dalam besi dibanding di udara."
        }
      ]
    },
    {
      "id": "b4",
      "title": "Pencocokan · Istilah & Definisi",
      "desc": "Latihan kosakata fisika bunyi dan bagian gendang beleq.",
      "open": true,
      "kkm": 70,
      "items": [
        {
          "type": "cocok",
          "q": "Pasangkan setiap istilah dengan definisinya yang tepat.",
          "pairs": [
            [
              "Amplitudo",
              "Simpangan maksimum dari posisi keseimbangan"
            ],
            [
              "Frekuensi",
              "Banyaknya getaran dalam satu detik"
            ],
            [
              "Periode",
              "Waktu untuk satu kali getaran penuh"
            ],
            [
              "Resonansi",
              "Ikut bergetarnya benda karena frekuensi alamiah yang sama"
            ]
          ]
        },
        {
          "type": "cocok",
          "q": "Pasangkan bagian atau istilah Gendang Beleq dengan keterangannya.",
          "pairs": [
            [
              "Gendang Mame",
              "Gendang jantan, lebih besar, nada rendah"
            ],
            [
              "Gendang Nine",
              "Gendang perempuan, lebih kecil, nada tinggi"
            ],
            [
              "Nyongkolan",
              "Pawai adat mengantar pengantin"
            ],
            [
              "Pantok",
              "Pasak rotan penyetel ketegangan kulit"
            ]
          ]
        },
        {
          "type": "cocok",
          "q": "Pasangkan besaran dengan satuannya.",
          "pairs": [
            [
              "Frekuensi",
              "hertz (Hz)"
            ],
            [
              "Cepat rambat",
              "meter per sekon (m/s)"
            ],
            [
              "Intensitas",
              "watt per meter kuadrat (W/m²)"
            ],
            [
              "Taraf intensitas",
              "desibel (dB)"
            ]
          ]
        }
      ]
    },
    {
      "id": "b5",
      "title": "Isian Singkat · Hitungan & Rumus",
      "desc": "Latihan berhitung. Tulis angka saja, koma boleh dipakai.",
      "open": true,
      "kkm": 70,
      "items": [
        {
          "type": "isian",
          "q": "Sebuah gendang bergetar 250 kali dalam 5 detik. Berapa frekuensinya dalam hertz?"
        },
        {
          "type": "isian",
          "q": "Gendang Nine ditabuh dan kulitnya bergetar pada 200 Hz. Berapa periode satu getaran penuh dalam sekon? Tulis dalam desimal."
        },
        {
          "type": "isian",
          "q": "Saat pawai nyongkolan, cepat rambat bunyi di udara 340 m/s. Panjang gelombang tabuhan gendang terukur 1,7 m. Berapa frekuensinya dalam Hz?"
        },
        {
          "type": "isian",
          "q": "Daya bunyi sebuah Gendang Mame 0,4 W menyebar menembus bidang seluas 2 m² di depan penabuh. Berapa intensitas bunyinya dalam W/m²?"
        },
        {
          "type": "isian",
          "q": "Gelombang bunyi yang frekuensinya di atas 20.000 Hz disebut gelombang…"
        },
        {
          "type": "isian",
          "q": "Dua gendang dibuat dari kulit yang sama dengan ketegangan yang sama, tetapi diameter Gendang Mame dua kali diameter Gendang Nine. Jika Gendang Nine berbunyi 300 Hz, berapa perkiraan frekuensi Gendang Mame dalam Hz?"
        },
        {
          "type": "isian",
          "q": "Gendang Mame berbunyi 148 Hz dan Gendang Nine 152 Hz ditabuh bersamaan. Berapa frekuensi pelayangan yang terdengar dalam Hz?"
        }
      ]
    },
    {
      "id": "b6",
      "title": "Esai · Etnosains Gendang Beleq",
      "desc": "Jawaban panjang. Dinilai dari kelengkapan kata kunci konsep.",
      "open": false,
      "kkm": 60,
      "items": [
        {
          "type": "esai",
          "q": "Jelaskan mengapa Gendang Mame dan Gendang Nine menghasilkan nada yang berbeda. Kaitkan dengan ukuran membran, ketegangan kulit, dan frekuensi getaran."
        },
        {
          "type": "esai",
          "q": "Pada tradisi Nyongkolan, penonton mendengar nada gendang berubah saat rombongan melintas. Jelaskan peristiwa ini menggunakan konsep efek Doppler."
        },
        {
          "type": "esai",
          "q": "Menurutmu, mengapa mempelajari fisika melalui kesenian daerah seperti Gendang Beleq itu penting? Berikan minimal dua alasan."
        }
      ]
    },
    {
      "id": "b7",
      "title": "Ujian Akhir Modul",
      "desc": "Campuran semua tipe soal. Dibuka guru saat asesmen sumatif.",
      "open": false,
      "kkm": 75,
      "items": [
        {
          "type": "pg",
          "q": "Tabung kayu Gendang Beleq dikerok hingga berongga. Fungsi utama rongga udara itu secara akustik adalah…",
          "opts": [
            "Meredam getaran kulit agar suara tidak terlalu keras",
            "Bertindak sebagai kolom udara tempat terjadinya resonansi",
            "Mengubah gelombang longitudinal menjadi transversal",
            "Menghilangkan nada dasar dan hanya memancarkan harmonik atas",
            "Menjaga amplitudo getaran tetap konstan"
          ]
        },
        {
          "type": "multi",
          "q": "Faktor apa saja yang MEMENGARUHI cepat rambat bunyi tabuhan gendang beleq di udara? Pilih semua yang benar.",
          "opts": [
            "Jenis medium",
            "Suhu medium",
            "Frekuensi sumber bunyi",
            "Kerapatan medium",
            "Amplitudo pukulan"
          ]
        },
        {
          "type": "isian",
          "q": "Rombongan nyongkolan mendekati penonton dengan kecepatan 10 m/s. Gendang ditabuh pada 340 Hz dan cepat rambat bunyi 340 m/s. Berapa frekuensi yang didengar penonton dalam Hz? Bulatkan ke satuan terdekat."
        },
        {
          "type": "cocok",
          "q": "Pasangkan rumus dengan besaran yang dihitungnya.",
          "pairs": [
            [
              "v = λ · f",
              "Cepat rambat bunyi"
            ],
            [
              "T = 1/f",
              "Periode getaran"
            ],
            [
              "I = P/A",
              "Intensitas bunyi"
            ],
            [
              "TI = 10 log (I/I₀)",
              "Taraf intensitas bunyi"
            ]
          ]
        },
        {
          "type": "esai",
          "q": "Rancang satu percobaan sederhana untuk membuktikan bahwa ketegangan membran gendang beleq memengaruhi frekuensi bunyinya. Sebutkan variabel bebas, variabel terikat, dan variabel kontrolnya."
        }
      ]
    }
  ]
};
export default CONTENT;
