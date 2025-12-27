// Configuration File
const CONFIG = {
    // App Info
    APP_NAME: 'Sistem Keluhan Masjid BKM',
    VERSION: '1.0.0',
    
    // Masjid Info (GANTI SESUAI MASJID ANDA)
    MASJID: {
        nama: 'Masjid Al-Fajar',
        alamat: 'Jl. Pahlawan, Kedai Durian',
        kontak: '0895-0444-0411'
    },
    
    // Google Sheets Configuration
    // TUTORIAL: https://github.com/jamiewilson/form-to-google-sheets
    SHEETS: {
        // Ganti dengan URL Web App Google Sheets Anda
        SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwpjfv8DA9HOHsFuxHPezsiOdsiqsRzK8jfnho7PX8jmbj4XpXE43vuluwTT1CDaB2b/exec',
        
        // Nama sheet
        SHEET_NAME: 'Keluhan',
        
        // Auto-save interval (milliseconds)
        AUTO_SAVE_INTERVAL: 30000 // 30 detik
    },
    
    // UI Settings
    UI: {
        ITEMS_PER_PAGE: 10,
        TOAST_DURATION: 3000, // 3 detik
        ANIMATION_SPEED: 300
    },
    
    // Status Options
    STATUS: {
        DITUNDA: 'Ditunda',
        PROSES: 'Proses',
        SELESAI: 'Selesai'
    },
    
    // Priority Options
    PRIORITY: {
        URGENT: 'Urgent',
        PENTING: 'Penting',
        RUTIN: 'Rutin'
    },
    
    // Category Options
    CATEGORY: {
        PELAYANAN: 'Pelayanan',
        SARANA: 'Sarana',
        PRASARANA: 'Prasarana'
    },
    
    // Local Storage Keys
    STORAGE: {
        COMPLAINTS: 'bkm_complaints',
        FILTERS: 'bkm_filters',
        SETTINGS: 'bkm_settings'
    }
};

// Feature Flags
const FEATURES = {
    OFFLINE_MODE: true,
    AUTO_BACKUP: true,
    WHATSAPP_INTEGRATION: false, // Coming soon
    PDF_EXPORT: true,
    BULK_ACTIONS: true
};

// Export for ES6 modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, FEATURES };
}
