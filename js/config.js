// ============================================
// CONFIG.JS - Supabase Auth Version with Role System
// ============================================

const CONFIG = {
    // Informasi Masjid
    MASJID: {
        nama: "Masjid Al-Fajar",
        alamat: "Jl. Pahlawan Dsn VI, Kedai Durian",
        kota: "Deli Serdang, Sumatera Utara",
        phone: "+62 895-0444-0411",
        email: "masjidalfajar.kedaidurian@gmail.com"
    },

    // Google Sheets Configuration
    SHEETS: {
        SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwpjfv8DA9HOHsFuxHPezsiOdsiqsRzK8jfnho7PX8jmbj4XpXE43vuluwTT1CDaB2b/exec",
        SHEET_ID: "YOUR_GOOGLE_SHEET_ID_HERE",
        SHEET_NAME: "Keluhan"
    },

    // 🔐 SUPABASE AUTH CONFIGURATION WITH ROLES
    AUTH: {
        SUPABASE_URL: "https://bvqsyvlqoigujbbcehrg.supabase.co",
        SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cXN5dmxxb2lndWpiYmNlaHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MjY3ODUsImV4cCI6MjA4MjQwMjc4NX0.0pQ_jVShPGkHyYtsRPG5N5jZdtH4MwPF-_Hd8Wd38CQ",
        
        // 👥 USER ROLES (UPDATED - 7 Users)
        USERS: {
            "fozan.reza7@gmail.com": {
                role: "admin",
                name: "Ust. Fauzan Reza",
                department: "Ketua BKM"
            },
            "ust.angga@alfajar.com": {
                role: "admin",
                name: "Ahmad Angga Nst",
                department: "Sekretaris"
            },
             "bagusalfajar@gmail.com": {
                name: "Ust. Bagus Santoso",
                role: "admin",
                department: "Bendahara"
            },
            "ust.syafri@alfajar.com": {
                role: "pic",
                name: "Ust. Syafri Ubaidillah",
                department: "Imam & Operasional"
            },
            "ust.makmal@alfajar.com": {
                role: "pic",
                name: "Ust. M.Akmal, L.C",
                department: "Imam & Operasional"
            },
            "ust.bambang@alfajar.com": {
                role: "pic",
                name: "Ust. Bambang Anjasmara",
                department: "Perawatan"
            },
            "ust.ridho@alfajar.com": {
                role: "pic",
                name: "Muhammad Ridho",
                department: "Kebersihan"
            }
        }
    },

    // Kategori Keluhan
    KATEGORI: [
        "Layanan", "Sarana", "Prasarana", "Elektronik",
        "Kebersihan", "Estetika", "Keamanan", "Lainnya"
    ],

    // Status Keluhan
    STATUS: {
        PENDING: "Ditunda",
        PROSES: "Dalam Proses",
        SELESAI: "Selesai"
    },

    // Prioritas
    PRIORITAS: {
        LOW: "Low",
        MEDIUM: "Medium",
        HIGH: "High"
    },

    // Storage Keys
    STORAGE_KEYS: {
        COMPLAINTS: "keluhan_masjid",
        USER_SESSION: "user_session",
        LAST_SYNC: "last_sync"
    },

    // UI Settings
    UI: {
        ITEMS_PER_PAGE: 10,
        TOAST_DURATION: 3000,
        MOBILE_BREAKPOINT: 768
    }
};

// Export untuk module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
