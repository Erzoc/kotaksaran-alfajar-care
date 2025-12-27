// Storage Manager - Google Sheets Integration
const Storage = {
    // Local storage as fallback
    local: {
        save: function(key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (e) {
                console.error('Local storage error:', e);
                return false;
            }
        },

        load: function(key) {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                console.error('Local storage error:', e);
                return null;
            }
        },

        remove: function(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Local storage error:', e);
                return false;
            }
        }
    },

    // Google Sheets API
    sheets: {
        // Fetch all data from Google Sheets
        fetch: async function() {
            try {
                UI.showLoading(true);
                
                // If no script URL configured, use local storage
                if (!CONFIG.SHEETS.SCRIPT_URL || CONFIG.SHEETS.SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID')) {
                    console.log('Using local storage (Google Sheets not configured)');
                    const localData = Storage.local.load(CONFIG.STORAGE_KEYS.COMPLAINTS);
                    UI.showLoading(false);
                    return localData || [];
                }

                const response = await fetch(CONFIG.SHEETS.SCRIPT_URL + '?action=read');
                const data = await response.json();
                
                UI.showLoading(false);
                
                if (data.status === 'success') {
                    // Save to local storage as cache
                    Storage.local.save(CONFIG.STORAGE_KEYS.COMPLAINTS, data.data);
                    return data.data;
                }
                
                throw new Error(data.message || 'Failed to fetch data');
            } catch (error) {
                console.error('Sheets fetch error:', error);
                UI.showLoading(false);
                
                // Fallback to local storage
                UI.showToast('Menggunakan data offline', 'info');
                return Storage.local.load(CONFIG.STORAGE_KEYS.COMPLAINTS) || [];
            }
        },

        // Save data to Google Sheets
        save: async function(data) {
            try {
                // Save to local storage first
                Storage.local.save(CONFIG.STORAGE_KEYS.COMPLAINTS, data);

                // If no script URL configured, only use local
                if (!CONFIG.SHEETS.SCRIPT_URL || CONFIG.SHEETS.SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID')) {
                    return { status: 'success', message: 'Data disimpan secara lokal' };
                }

                // Send to Google Sheets
                const response = await fetch(CONFIG.SHEETS.SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'write',
                        data: data
                    })
                });

                return { status: 'success', message: 'Data berhasil disimpan' };
            } catch (error) {
                console.error('Sheets save error:', error);
                // Data already saved to local, so return success
                return { status: 'success', message: 'Data disimpan secara lokal' };
            }
        },

        // Add single complaint
        add: async function(complaint) {
            try {
                // Get current data
                let data = Storage.local.load(CONFIG.STORAGE_KEYS.COMPLAINTS) || [];
                
                // Add new complaint
                data.push(complaint);
                
                // Save updated data
                return await Storage.sheets.save(data);
            } catch (error) {
                console.error('Add complaint error:', error);
                throw error;
            }
        },

        // Update complaint
        update: async function(id, updatedData) {
            try {
                let data = Storage.local.load(CONFIG.STORAGE_KEYS.COMPLAINTS) || [];
                
                const index = data.findIndex(item => item.id === id);
                if (index === -1) {
                    throw new Error('Keluhan tidak ditemukan');
                }
                
                data[index] = { ...data[index], ...updatedData };
                
                return await Storage.sheets.save(data);
            } catch (error) {
                console.error('Update complaint error:', error);
                throw error;
            }
        },

        // Delete complaint
        delete: async function(id) {
            try {
                let data = Storage.local.load(CONFIG.STORAGE_KEYS.COMPLAINTS) || [];
                
                data = data.filter(item => item.id !== id);
                
                return await Storage.sheets.save(data);
            } catch (error) {
                console.error('Delete complaint error:', error);
                throw error;
            }
        },

        // Bulk delete
        bulkDelete: async function(ids) {
            try {
                let data = Storage.local.load(CONFIG.STORAGE_KEYS.COMPLAINTS) || [];
                
                data = data.filter(item => !ids.includes(item.id));
                
                return await Storage.sheets.save(data);
            } catch (error) {
                console.error('Bulk delete error:', error);
                throw error;
            }
        }
    },

    // Export data to various formats
    export: {
        // Export to CSV
        toCSV: function(data) {
            const headers = ['No', 'ID', 'Tanggal', 'Pelapor', 'Kategori', 'Prioritas', 
                           'Uraian', 'Solusi', 'Status', 'PIC', 'Biaya', 'Tanggal Selesai'];
            
            let csv = headers.join(',') + '\n';
            
            data.forEach((item, index) => {
                const row = [
                    index + 1,
                    item.id,
                    Utils.formatDate(item.tanggal),
                    `"${item.nama}"`,
                    item.kategori,
                    item.prioritas,
                    `"${item.uraian}"`,
                    `"${item.solusi || '-'}"`,
                    item.status,
                    item.penanggungjawab || '-',
                    item.biaya || 0,
                    item.tanggalSelesai ? Utils.formatDate(item.tanggalSelesai) : '-'
                ];
                csv += row.join(',') + '\n';
            });
            
            return csv;
        },

        // Export to JSON
        toJSON: function(data) {
            return JSON.stringify(data, null, 2);
        },

        // Generate report text
        toReport: function(data) {
            const report = [];
            report.push('='.repeat(70));
            report.push(`LAPORAN KELUHAN MASJID ${CONFIG.MASJID.nama.toUpperCase()}`);
            report.push(`Periode: ${Utils.getCurrentMonth()}`);
            report.push('='.repeat(70));
            report.push('');
            
            // Statistics
            const total = data.length;
            const completed = data.filter(d => d.status === 'Selesai').length;
            const process = data.filter(d => d.status === 'Proses').length;
            const pending = data.filter(d => d.status === 'Ditunda').length;
            
            report.push('STATISTIK:');
            report.push(`Total Keluhan: ${total}`);
            report.push(`Selesai: ${completed} (${Utils.percentage(completed, total)}%)`);
            report.push(`Proses: ${process}`);
            report.push(`Tertunda: ${pending}`);
            report.push('');
            
            // Details
            report.push('DETAIL KELUHAN:');
            report.push('-'.repeat(70));
            
            data.forEach((item, index) => {
                report.push(`${index + 1}. [${item.id}] ${item.uraian}`);
                report.push(`   Pelapor: ${item.nama} | Kategori: ${item.kategori}`);
                report.push(`   Status: ${item.status} | Prioritas: ${item.prioritas}`);
                report.push(`   PIC: ${item.penanggungjawab || '-'}`);
                report.push('');
            });
            
            report.push('='.repeat(70));
            report.push(`Generated: ${new Date().toLocaleString('id-ID')}`);
            
            return report.join('\n');
        }
    }
};
