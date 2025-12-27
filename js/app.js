// ========================================
// MAIN APPLICATION - SISTEM KELUHAN MASJID
// ========================================

const App = {
    data: [],
    filteredData: [],
    selectedIds: [],

    // ========== INITIALIZATION ==========
    init: async function() {
        console.log('🚀 Initializing BKM Complaint System v1.0...');
        
        try {
            // Load data
            await this.loadData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initial render
            this.render();
            
            console.log('✅ App initialized successfully');
            console.log(`📊 Loaded ${this.data.length} complaints`);
        } catch (error) {
            console.error('Init error:', error);
            UI.showToast('Gagal memuat aplikasi', 'error');
        }
    },

    // ========== DATA MANAGEMENT ==========
    loadData: async function() {
        try {
            this.data = await Storage.sheets.fetch();
            this.filteredData = [...this.data];
            
            // Sort by date (newest first)
            this.filteredData = Utils.sortBy(this.filteredData, 'tanggal', 'desc');
            
            return this.data;
        } catch (error) {
            console.error('Load data error:', error);
            UI.showToast('Gagal memuat data', 'error');
            return [];
        }
    },

    // ========== EVENT LISTENERS ==========
    setupEventListeners: function() {
        // Search with debounce
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keyup', 
                Utils.debounce(() => this.handleSearch(), 300)
            );
        }

        // Close modal on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    UI.closeModal(activeModal.id);
                }
            }
        });
    },

    // ========== SEARCH & FILTER ==========
    handleSearch: function() {
        const searchTerm = document.getElementById('searchInput').value;
        
        if (!searchTerm) {
            this.filteredData = [...this.data];
        } else {
            this.filteredData = Utils.filterBySearch(
                this.data,
                searchTerm,
                ['nama', 'uraian', 'kategori', 'penanggungjawab', 'id']
            );
        }
        
        this.applyFilters();
    },

    applyFilters: function() {
        let filtered = [...this.data];
        
        // Search filter
        const searchTerm = document.getElementById('searchInput').value;
        if (searchTerm) {
            filtered = Utils.filterBySearch(
                filtered,
                searchTerm,
                ['nama', 'uraian', 'kategori', 'penanggungjawab', 'id']
            );
        }
        
        // Status filter
        const statusFilter = document.getElementById('filterStatus').value;
        if (statusFilter !== 'all') {
            filtered = filtered.filter(item => item.status === statusFilter);
        }
        
        // Priority filter
        const prioritasFilter = document.getElementById('filterPrioritas').value;
        if (prioritasFilter !== 'all') {
            filtered = filtered.filter(item => item.prioritas === prioritasFilter);
        }
        
        // Date range filter
        const periodeFilter = document.getElementById('filterPeriode').value;
        if (periodeFilter !== 'all') {
            filtered = filtered.filter(item => 
                Utils.isDateInRange(item.tanggal, periodeFilter)
            );
        }
        
        this.filteredData = filtered;
        this.render();
    },

    // ========== RENDERING ==========
    render: function() {
        UI.updateStats(this.data);
        UI.renderTable(this.filteredData);
        UI.renderMobileCards(this.filteredData);
        UI.generateReport(this.data);
    },

    refreshData: async function() {
        UI.showToast('Memuat ulang data...', 'info');
        await this.loadData();
        this.applyFilters();
        UI.showToast('Data berhasil dimuat ulang', 'success');
    },

    // ========== CRUD OPERATIONS ==========
    
    // ADD NEW COMPLAINT (FIXED - Match dengan ID field di HTML)
addComplaint: async function(event) {
    event.preventDefault();

    // CEK LOGIN DULU!
    if (!Auth.isLoggedIn()) {
        UI.showToast('⚠️ Silakan login terlebih dahulu', 'warning');
        Auth.showLoginModal();
        return;
    }

    try {
        console.log('📝 Processing form...');
        
        // COBA AMBIL ELEMENT DULU (untuk debug)
        const namaEl = document.getElementById('nama');
        const kategoriEl = document.getElementById('kategori');
        const prioritasEl = document.getElementById('prioritas');
        const uraianEl = document.getElementById('uraian');
        const solusiEl = document.getElementById('solusi');
        const picEl = document.getElementById('penanggungjawab');
        const biayaEl = document.getElementById('biaya');

        // CEK ELEMENT ADA ATAU TIDAK
        if (!namaEl) {
            console.error('❌ Field "nama" tidak ditemukan!');
            UI.showToast('❌ Error: Field nama tidak ditemukan di form', 'error');
            return;
        }
        if (!kategoriEl) {
            console.error('❌ Field "kategori" tidak ditemukan!');
            UI.showToast('❌ Error: Field kategori tidak ditemukan di form', 'error');
            return;
        }
        if (!prioritasEl) {
            console.error('❌ Field "prioritas" tidak ditemukan!');
            UI.showToast('❌ Error: Field prioritas tidak ditemukan di form', 'error');
            return;
        }
        if (!uraianEl) {
            console.error('❌ Field "uraian" tidak ditemukan!');
            UI.showToast('❌ Error: Field uraian tidak ditemukan di form', 'error');
            return;
        }

                    // Get form data
            const formData = {
                id: Utils.generateId(),
                tanggal: new Date().toISOString(),
                nama: document.getElementById('nama').value.trim(), // Nama pelapor (bisa beda dengan user login)
                kategori: document.getElementById('kategori').value,
                prioritas: document.getElementById('prioritas').value,
                uraian: document.getElementById('uraian').value.trim(),
                solusi: document.getElementById('solusi').value.trim(),
                penanggungjawab: document.getElementById('penanggungjawab').value.trim(),
                biaya: document.getElementById('biaya').value || 0,
                status: 'Ditunda',
                tanggalSelesai: null,
                
                // TAMBAHAN PENTING AGAR PIC BISA EDIT PUNYA SENDIRI
                createdBy: Auth.getUserEmail() 
            };


        console.log('📦 Form data:', formData);

        // Validate
        if (!formData.nama || !formData.kategori || !formData.prioritas || !formData.uraian) {
            UI.showToast('❌ Mohon lengkapi semua field yang wajib (*)', 'error');
            return;
        }

        UI.showLoading(true);
        const result = await Storage.sheets.add(formData);
        UI.showLoading(false);

        if (result.status === 'success') {
            this.data.push(formData);
            this.applyFilters();
            UI.closeModal('addModal');
            document.getElementById('addForm').reset();
            UI.showToast('✅ Keluhan berhasil ditambahkan!', 'success');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        UI.showLoading(false);
        console.error('❌ Add complaint error:', error);
        UI.showToast('❌ Gagal menambahkan keluhan: ' + error.message, 'error');
    }
},




    // EDIT COMPLAINT (UPDATED - disable PIC field for non-admin)
editComplaint: function(id) {
    // CEK LOGIN
    if (!Auth.isLoggedIn()) {
        UI.showToast('⚠️ Silakan login terlebih dahulu', 'warning');
        Auth.showLoginModal();
        return;
    }

    const complaint = this.data.find(item => item.id === id);
    if (!complaint) {
        UI.showToast('Keluhan tidak ditemukan', 'error');
        return;
    }

    // CEK PERMISSION
    if (!Auth.canModify(complaint)) {
        UI.showToast('⚠️ Anda tidak memiliki izin untuk mengedit keluhan ini', 'error');
        return;
    }

    // Fill form
    document.getElementById('editId').value = complaint.id;
    document.getElementById('editNama').value = complaint.nama;
    document.getElementById('editKategori').value = complaint.kategori;
    document.getElementById('editStatus').value = complaint.status;
    document.getElementById('editPrioritas').value = complaint.prioritas;
    document.getElementById('editUraian').value = complaint.uraian;
    document.getElementById('editSolusi').value = complaint.solusi || '';
    document.getElementById('editBiaya').value = complaint.biaya || '';
    document.getElementById('editPenanggungjawab').value = complaint.penanggungjawab || '';
    document.getElementById('editTanggalSelesai').value =
        complaint.tanggalSelesai ? complaint.tanggalSelesai.split('T')[0] : '';

    // PIC field ALWAYS readonly (even for admin)
    const picField = document.getElementById('editPenanggungjawab');
    if (picField) {
        picField.readOnly = true;
        picField.style.background = '#f5f5f5';
        picField.style.cursor = 'not-allowed';
    }

    UI.openModal('editModal');
},




    // UPDATE COMPLAINT
    updateComplaint: async function(event) {
        event.preventDefault();
        
        try {
            const id = document.getElementById('editId').value;
            
            const updatedData = {
                nama: document.getElementById('editNama').value.trim(),
                kategori: document.getElementById('editKategori').value,
                status: document.getElementById('editStatus').value,
                prioritas: document.getElementById('editPrioritas').value,
                uraian: document.getElementById('editUraian').value.trim(),
                solusi: document.getElementById('editSolusi').value.trim(),
                biaya: document.getElementById('editBiaya').value || 0,
                penanggungjawab: document.getElementById('editPenanggungjawab').value.trim(),
                tanggalSelesai: document.getElementById('editTanggalSelesai').value || null
            };
            
            // Validate
            const validation = Utils.validateForm(updatedData);
            if (!validation.valid) {
                UI.showToast(validation.errors[0], 'error');
                return;
            }
            
            UI.showLoading(true);
            
            const result = await Storage.sheets.update(id, updatedData);
            
            UI.showLoading(false);
            
            if (result.status === 'success') {
                // Update local data
                const index = this.data.findIndex(item => item.id === id);
                if (index !== -1) {
                    this.data[index] = { ...this.data[index], ...updatedData };
                }
                
                this.applyFilters();
                UI.closeModal('editModal');
                UI.showToast('✅ Keluhan berhasil diperbarui!', 'success');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            UI.showLoading(false);
            console.error('Update complaint error:', error);
            UI.showToast('❌ Gagal memperbarui keluhan', 'error');
        }
    },

    // DELETE COMPLAINT (with permission check)
deleteComplaint: function(id) {
    // CEK LOGIN
    if (!Auth.isLoggedIn()) {
        UI.showToast('⚠️ Silakan login terlebih dahulu', 'warning');
        Auth.showLoginModal();
        return;
    }

    const complaint = this.data.find(item => item.id === id);
    if (!complaint) {
        UI.showToast('Keluhan tidak ditemukan', 'error');
        return;
    }

    // CEK PERMISSION
    if (!Auth.canModify(complaint)) {
        UI.showToast('⚠️ Anda tidak memiliki izin untuk menghapus keluhan ini', 'error');
        return;
    }

    UI.showConfirm(
        '⚠️ Hapus Keluhan?',
        `Yakin ingin menghapus keluhan dari "${complaint.nama}"?\nData yang dihapus tidak dapat dikembalikan.`,
        async () => {
            try {
                UI.showLoading(true);
                const result = await Storage.sheets.delete(id);
                UI.showLoading(false);

                if (result.status === 'success') {
                    this.data = this.data.filter(item => item.id !== id);
                    this.applyFilters();
                    UI.showToast('✅ Keluhan berhasil dihapus', 'success');
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                UI.showLoading(false);
                console.error('Delete complaint error:', error);
                UI.showToast('❌ Gagal menghapus keluhan', 'error');
            }
        }
    );
},



    // ========== BULK ACTIONS ==========
    
    toggleSelectAll: function() {
        const selectAll = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('.row-checkbox');
        
        checkboxes.forEach(cb => {
            cb.checked = selectAll.checked;
        });
        
        this.updateBulkActions();
    },

    updateBulkActions: function() {
        const checkboxes = document.querySelectorAll('.row-checkbox:checked');
        this.selectedIds = Array.from(checkboxes).map(cb => cb.dataset.id);
        
        UI.updateBulkActionsBar(this.selectedIds.length);
        
        // Update select all checkbox
        const selectAll = document.getElementById('selectAll');
        const allCheckboxes = document.querySelectorAll('.row-checkbox');
        if (selectAll && allCheckboxes.length > 0) {
            selectAll.checked = this.selectedIds.length === allCheckboxes.length;
        }
    },

    clearSelection: function() {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        checkboxes.forEach(cb => cb.checked = false);
        
        const selectAll = document.getElementById('selectAll');
        if (selectAll) selectAll.checked = false;
        
        this.updateBulkActions();
    },

    bulkUpdateStatus: function() {
        if (this.selectedIds.length === 0) {
            UI.showToast('Tidak ada keluhan yang dipilih', 'warning');
            return;
        }
        
        const newStatus = prompt('Update status ke:\n1. Ditunda\n2. Proses\n3. Selesai\n\nMasukkan pilihan (1-3):');
        
        const statusMap = {
            '1': 'Ditunda',
            '2': 'Proses',
            '3': 'Selesai'
        };
        
        const status = statusMap[newStatus];
        
        if (!status) {
            UI.showToast('Status tidak valid', 'error');
            return;
        }
        
        UI.showConfirm(
            'Update Status?',
            `Yakin ingin mengubah status ${this.selectedIds.length} keluhan ke "${status}"?`,
            async () => {
                try {
                    UI.showLoading(true);
                    
                    for (const id of this.selectedIds) {
                        await Storage.sheets.update(id, { status });
                        const index = this.data.findIndex(item => item.id === id);
                        if (index !== -1) {
                            this.data[index].status = status;
                        }
                    }
                    
                    UI.showLoading(false);
                    this.clearSelection();
                    this.applyFilters();
                    UI.showToast(`✅ ${this.selectedIds.length} keluhan berhasil diupdate`, 'success');
                } catch (error) {
                    UI.showLoading(false);
                    console.error('Bulk update error:', error);
                    UI.showToast('❌ Gagal update keluhan', 'error');
                }
            }
        );
    },

    bulkDelete: function() {
        if (this.selectedIds.length === 0) {
            UI.showToast('Tidak ada keluhan yang dipilih', 'warning');
            return;
        }
        
        UI.showConfirm(
            '⚠️ Hapus Keluhan?',
            `Yakin ingin menghapus ${this.selectedIds.length} keluhan?\nData yang dihapus tidak dapat dikembalikan.`,
            async () => {
                try {
                    UI.showLoading(true);
                    
                    const result = await Storage.sheets.bulkDelete(this.selectedIds);
                    
                    UI.showLoading(false);
                    
                    if (result.status === 'success') {
                        this.data = this.data.filter(item => !this.selectedIds.includes(item.id));
                        this.clearSelection();
                        this.applyFilters();
                        UI.showToast(`✅ ${this.selectedIds.length} keluhan berhasil dihapus`, 'success');
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error) {
                    UI.showLoading(false);
                    console.error('Bulk delete error:', error);
                    UI.showToast('❌ Gagal menghapus keluhan', 'error');
                }
            }
        );
    },

    // ========== EXPORT PDF (LENGKAP) ==========
    
    exportToPDF: function() {
        try {
            // Check if jsPDF is loaded
            if (typeof window.jspdf === 'undefined') {
                throw new Error('jsPDF library not loaded');
            }
            
            UI.showLoading(true);
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('l', 'mm', 'a4'); // Landscape A4
            
            // === HEADER ===
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('LAPORAN KELUHAN MASJID', 148, 15, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text(CONFIG.MASJID.nama, 148, 22, { align: 'center' });
            doc.text(`Periode: ${Utils.getCurrentMonth()}`, 148, 28, { align: 'center' });
            
            // Line separator
            doc.setLineWidth(0.5);
            doc.line(10, 32, 287, 32);
            
            // === STATISTICS BOX ===
            const stats = {
                total: this.data.length,
                selesai: this.data.filter(d => d.status === 'Selesai').length,
                proses: this.data.filter(d => d.status === 'Proses').length,
                tertunda: this.data.filter(d => d.status === 'Ditunda').length
            };
            
            const completionRate = Utils.percentage(stats.selesai, stats.total);
            
            doc.setFontSize(10);
            doc.setFillColor(232, 245, 233);
            doc.rect(10, 36, 277, 18, 'F');
            
            doc.setFont(undefined, 'bold');
            doc.text('RINGKASAN:', 15, 42);
            doc.setFont(undefined, 'normal');
            doc.text(`Total: ${stats.total}`, 15, 48);
            doc.text(`Selesai: ${stats.selesai} (${completionRate}%)`, 70, 48);
            doc.text(`Proses: ${stats.proses}`, 140, 48);
            doc.text(`Tertunda: ${stats.tertunda}`, 185, 48);
            
            // Total Biaya
            const totalBiaya = this.data.reduce((sum, item) => sum + (parseInt(item.biaya) || 0), 0);
            doc.setFont(undefined, 'bold');
            doc.text(`Total Biaya: ${Utils.formatCurrency(totalBiaya)}`, 235, 48);
            
            // === TABLE DATA ===
            const tableData = this.filteredData.map((item, index) => [
                index + 1,
                Utils.formatDateShort(item.tanggal),
                item.nama,
                item.kategori,
                item.prioritas,
                Utils.truncate(item.uraian, 50),
                item.status,
                item.penanggungjawab || '-',
                Utils.formatCurrency(item.biaya)
            ]);
            
            const tableHeaders = [
                'No',
                'Tanggal',
                'Pelapor',
                'Kategori',
                'Prioritas',
                'Uraian Keluhan',
                'Status',
                'PIC',
                'Biaya'
            ];
            
            // === GENERATE TABLE ===
            doc.autoTable({
                startY: 58,
                head: [tableHeaders],
                body: tableData,
                theme: 'striped',
                headStyles: {
                    fillColor: [45, 134, 89],
                    textColor: 255,
                    fontSize: 9,
                    fontStyle: 'bold',
                    halign: 'center',
                    valign: 'middle'
                },
                bodyStyles: {
                    fontSize: 8,
                    cellPadding: 2
                },
                columnStyles: {
                    0: { cellWidth: 10, halign: 'center' },
                    1: { cellWidth: 22, halign: 'center' },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 22, halign: 'center' },
                    4: { cellWidth: 22, halign: 'center' },
                    5: { cellWidth: 70 },
                    6: { cellWidth: 20, halign: 'center' },
                    7: { cellWidth: 30 },
                    8: { cellWidth: 31, halign: 'right' }
                },
                alternateRowStyles: {
                    fillColor: [245, 247, 250]
                },
                margin: { left: 10, right: 10 },
                didDrawPage: function(data) {
                    // Footer
                    const pageCount = doc.internal.getNumberOfPages();
                    const pageSize = doc.internal.pageSize;
                    const pageHeight = pageSize.height || pageSize.getHeight();
                    
                    doc.setFontSize(8);
                    doc.setTextColor(150);
                    doc.text(
                        `Halaman ${data.pageNumber} dari ${pageCount}`,
                        10,
                        pageHeight - 8
                    );
                    doc.text(
                        `Dicetak: ${new Date().toLocaleString('id-ID')}`,
                        pageSize.width - 70,
                        pageHeight - 8
                    );
                }
            });
            
            // === SAVE PDF ===
            const filename = `Laporan_Keluhan_${Utils.getCurrentMonth().replace(/\s/g, '_')}.pdf`;
            doc.save(filename);
            
            UI.showLoading(false);
            UI.showToast('✅ PDF berhasil diunduh!', 'success');
            
        } catch (error) {
            console.error('Export PDF error:', error);
            UI.showLoading(false);
            UI.showToast('❌ Gagal export PDF: ' + error.message, 'error');
            
            // Fallback to TXT
            setTimeout(() => {
                if (confirm('Export ke TXT saja sebagai backup?')) {
                    const reportText = Storage.export.toReport(this.filteredData);
                    const filename = `Laporan_Keluhan_${Utils.getCurrentMonth().replace(/\s/g, '_')}.txt`;
                    Utils.downloadFile(reportText, filename, 'text/plain');
                    UI.showToast('✅ TXT berhasil diunduh', 'success');
                }
            }, 500);
        }
    }
};

// ========== AUTO-INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});


