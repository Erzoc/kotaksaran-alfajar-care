// UI Manager
const UI = {
    // Show/Hide loading overlay
    showLoading: function (show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    },

    // Show toast notification
    showToast: function (message, type = 'info', duration = CONFIG.UI.TOAST_DURATION) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    },

    // Open modal (UPDATED with auto-fill PIC)
    openModal: function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Auto-fill PIC jika modal tambah keluhan
            if (modalId === 'addModal' && Auth.isLoggedIn()) {
                setTimeout(() => {
                    const picField = document.getElementById('penanggungjawab');
                    if (picField) {
                        picField.value = Auth.getUserName();
                        console.log('✅ PIC auto-filled:', Auth.getUserName());
                    } else {
                        console.error('❌ Field penanggungjawab tidak ditemukan!');
                    }
                }, 100); // Delay 100ms untuk pastikan modal sudah fully rendered
            }
        } else {
            console.error('❌ Modal tidak ditemukan:', modalId);
        }
    },

    // Close modal
    closeModal: function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';

            // Reset form if exists
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
        }
    },

    // Show confirmation dialog (UPDATED - Professional style)
    showConfirm: function (title, message, onConfirm) {
        const modal = document.getElementById('confirmDialog');
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        const confirmBtn = document.getElementById('confirmBtn');

        // Add logout class if title contains "Logout"
        if (title.includes('Logout')) {
            modal.classList.add('logout-modal');
        } else {
            modal.classList.remove('logout-modal');
        }

        titleEl.textContent = title;
        messageEl.textContent = message;
        messageEl.style.whiteSpace = 'pre-line'; // Support line breaks
        messageEl.style.textAlign = 'center';
        messageEl.style.lineHeight = '1.6';

        // Remove old event listeners
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

        // Add new event listener
        newBtn.addEventListener('click', () => {
            onConfirm();
            this.closeModal('confirmDialog');
        });

        this.openModal('confirmDialog');
    },


    // Close confirmation dialog
    closeConfirm: function () {
        this.closeModal('confirmDialog');
    },
    // Review/View Complaint Details (untuk public & logged in users)
    // Review/View Complaint Details
reviewComplaint: function(id) {
    const complaint = App.data.find(item => item.id === id);
    if (!complaint) {
        this.showToast('Keluhan tidak ditemukan', 'error');
        return;
    }

    // Build detail HTML
    const detailHTML = `
        <div class="complaint-detail">
            <div class="detail-header">
                <div class="detail-id">#${complaint.id}</div>
                <div class="detail-badges">
                    <span class="badge badge-${complaint.prioritas.toLowerCase()}">${complaint.prioritas}</span>
                    <span class="badge badge-${complaint.status.toLowerCase().replace(/\s/g, '-')}">${complaint.status}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <div class="detail-label"><i class="fas fa-calendar"></i> Tanggal Lapor</div>
                <div class="detail-value">${Utils.formatDate(complaint.tanggal)}</div>
            </div>
            
            <div class="detail-section">
                <div class="detail-label"><i class="fas fa-user"></i> Pelapor</div>
                <div class="detail-value">${complaint.nama}</div>
            </div>
            
            <div class="detail-section">
                <div class="detail-label"><i class="fas fa-tag"></i> Kategori</div>
                <div class="detail-value">${complaint.kategori}</div>
            </div>
            
            <div class="detail-section">
                <div class="detail-label"><i class="fas fa-file-alt"></i> Uraian Keluhan</div>
                <div class="detail-value">${complaint.uraian}</div>
            </div>
            
            ${complaint.solusi ? `
                <div class="detail-section">
                    <div class="detail-label"><i class="fas fa-lightbulb"></i> Solusi/Tindakan</div>
                    <div class="detail-value">${complaint.solusi}</div>
                </div>
            ` : ''}
            
            <div class="detail-section">
                <div class="detail-label"><i class="fas fa-user-tie"></i> Penanggungjawab</div>
                <div class="detail-value">${complaint.penanggungjawab || '-'}</div>
            </div>
            
            ${complaint.biaya ? `
                <div class="detail-section">
                    <div class="detail-label"><i class="fas fa-money-bill-wave"></i> Estimasi Biaya</div>
                    <div class="detail-value">${Utils.formatCurrency(complaint.biaya)}</div>
                </div>
            ` : ''}
            
            ${complaint.tanggalSelesai ? `
                <div class="detail-section">
                    <div class="detail-label"><i class="fas fa-check-circle"></i> Tanggal Selesai</div>
                    <div class="detail-value">${Utils.formatDate(complaint.tanggalSelesai)}</div>
                </div>
            ` : ''}
        </div>
    `;

    // Create modal if not exists
    let modal = document.getElementById('reviewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'reviewModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-eye"></i> Detail Keluhan</h2>
                    <button class="close" onclick="UI.closeModal('reviewModal')">&times;</button>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="UI.closeModal('reviewModal')">
                        <i class="fas fa-times"></i> Tutup
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Inject content and show
    modal.querySelector('.modal-body').innerHTML = detailHTML;
    this.openModal('reviewModal');
},


    // Update statistics cards
    updateStats: function (data) {
        const total = data.length;
        const urgent = data.filter(d => d.prioritas === 'Urgent').length;
        const process = data.filter(d => d.status === 'Proses').length;
        const completed = data.filter(d => d.status === 'Selesai').length;

        document.getElementById('totalCount').textContent = total;
        document.getElementById('urgentCount').textContent = urgent;
        document.getElementById('processCount').textContent = process;
        document.getElementById('completedCount').textContent = completed;
    },

    // Render table (desktop) - UPDATED with Eye button
renderTable: function(data) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (data.length === 0) {
        this.showEmptyState(true);
        return;
    }

    this.showEmptyState(false);

    // Toggle public view class on body
    if (!Auth.isLoggedIn()) {
        document.body.classList.add('public-view');
    } else {
        document.body.classList.remove('public-view');
    }

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // === CONDITIONAL CHECKBOX (Admin only) ===
        let checkboxCell = '';
        if (Auth.isLoggedIn() && Auth.isAdmin()) {
            checkboxCell = `<td><input type="checkbox" class="row-checkbox" data-id="${item.id}" onchange="App.updateBulkActions()"></td>`;
        }

        // === ACTION BUTTONS dengan TOMBOL MATA ===
        let actionButtons = '';
        
        // Tombol MATA (untuk semua user, termasuk public)
        actionButtons = `
            <button onclick="UI.reviewComplaint('${item.id}')" class="btn-icon btn-view" title="Lihat Detail">
                <i class="fas fa-eye"></i>
            </button>
        `;
        
        // Tombol Edit & Hapus (hanya untuk logged in user yang punya permission)
        if (Auth.isLoggedIn()) {
            if (Auth.canModify(item)) {
                actionButtons += `
                    <button onclick="App.editComplaint('${item.id}')" class="btn-icon btn-edit" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="App.deleteComplaint('${item.id}')" class="btn-icon btn-delete" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
            } else {
                actionButtons += '<span class="text-muted" style="font-size: 11px; margin-left: 8px;"><i class="fas fa-lock"></i> Terkunci</span>';
            }
        }

        // Build row
        row.innerHTML = `
            ${checkboxCell}
            <td>${index + 1}</td>
            <td>${Utils.formatDate(item.tanggal)}</td>
            <td>${item.nama}</td>
            <td><span class="badge badge-category">${item.kategori}</span></td>
            <td><span class="badge badge-${item.prioritas.toLowerCase()}">${item.prioritas}</span></td>
            <td class="text-left">${Utils.truncate(item.uraian, 50)}</td>
            <td><span class="badge badge-${item.status.toLowerCase().replace(/\s/g, '-')}">${item.status}</span></td>
            <td>${item.penanggungjawab || '-'}</td>
            <td class="actions">${actionButtons}</td>
        `;
        
        tbody.appendChild(row);
    });
},

    // Render mobile cards - UPDATED with Eye button (Mobile-First!)
renderMobileCards: function(data) {
    const container = document.getElementById('mobileList');
    if (!container) return;
    
    container.innerHTML = '';

    if (data.length === 0) {
        this.showEmptyState(true);
        return;
    }

    this.showEmptyState(false);

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'complaint-card';
        
        // === ACTION BUTTONS untuk Mobile ===
        let actionButtons = '';
        
        // Tombol MATA (untuk semua user, termasuk public)
        actionButtons = `
            <button onclick="UI.reviewComplaint('${item.id}')" class="btn-icon btn-view" title="Lihat Detail">
                <i class="fas fa-eye"></i> Detail
            </button>
        `;
        
        // Tombol Edit & Hapus (hanya untuk logged in user)
        if (Auth.isLoggedIn()) {
            if (Auth.canModify(item)) {
                actionButtons += `
                    <button onclick="App.editComplaint('${item.id}')" class="btn-icon btn-edit" title="Edit">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="App.deleteComplaint('${item.id}')" class="btn-icon btn-delete" title="Hapus">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                `;
            } else {
                actionButtons += '<div class="card-lock"><i class="fas fa-lock"></i> Terkunci</div>';
            }
        }
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-id">#${item.id.substring(0, 12)}...</div>
                <div class="card-badges">
                    <span class="badge badge-${item.prioritas.toLowerCase()}">${item.prioritas}</span>
                    <span class="badge badge-${item.status.toLowerCase().replace(/\s/g, '-')}">${item.status}</span>
                </div>
            </div>
            <div class="card-body">
                <div class="card-title">${item.nama}</div>
                <div class="card-category"><i class="fas fa-tag"></i> ${item.kategori}</div>
                <div class="card-description">${Utils.truncate(item.uraian, 100)}</div>
                <div class="card-meta">
                    <div class="card-date"><i class="fas fa-calendar"></i> ${Utils.formatDate(item.tanggal)}</div>
                    <div class="card-pic"><i class="fas fa-user"></i> ${item.penanggungjawab || '-'}</div>
                </div>
            </div>
            <div class="card-footer">
                ${actionButtons}
            </div>
        `;
        
        container.appendChild(card);
    });
},


    // Show/hide empty state (FIXED - hide button if not logged in)
    showEmptyState: function (show) {
        const emptyState = document.getElementById('emptyState');
        const table = document.getElementById('complaintsTable');

        if (show) {
            if (emptyState) emptyState.style.display = 'block';
            if (table) table.style.display = 'none';

            // Update button di empty state
            const emptyBtn = emptyState.querySelector('button');
            if (emptyBtn) {
                if (Auth.isLoggedIn()) {
                    emptyBtn.style.display = 'inline-flex';
                    emptyBtn.onclick = () => this.openModal('addModal');
                    emptyBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Tambah Keluhan Pertama';
                } else {
                    emptyBtn.style.display = 'inline-flex';
                    emptyBtn.onclick = () => Auth.showLoginModal();
                    emptyBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login untuk Tambah Keluhan';
                }
            }
        } else {
            if (emptyState) emptyState.style.display = 'none';
            if (table) table.style.display = 'table';
        }
    },


    // Generate monthly report
    generateReport: function (data) {
        const reportContainer = document.getElementById('monthlyReport');
        const currentMonth = document.getElementById('currentMonth');

        currentMonth.textContent = Utils.getCurrentMonth();

        const total = data.length;
        const completed = data.filter(d => d.status === 'Selesai').length;
        const process = data.filter(d => d.status === 'Proses').length;
        const pending = data.filter(d => d.status === 'Ditunda').length;
        const completionRate = Utils.percentage(completed, total);

        const categories = {
            'Pelayanan': data.filter(d => d.kategori === 'Pelayanan').length,
            'Sarana': data.filter(d => d.kategori === 'Sarana').length,
            'Prasarana': data.filter(d => d.kategori === 'Prasarana').length
        };

        const totalCost = data.reduce((sum, item) => sum + (parseInt(item.biaya) || 0), 0);

        reportContainer.innerHTML = `
            <div class="report-stats">
                <div class="report-stat-item">
                    <p>📋 Total</p>
                    <h3 style="color: #667eea;">${total}</h3>
                </div>
                <div class="report-stat-item">
                    <p>✅ Selesai</p>
                    <h3 style="color: #43e97b;">${completed} (${completionRate}%)</h3>
                </div>
                <div class="report-stat-item">
                    <p>⏳ Proses</p>
                    <h3 style="color: #4facfe;">${process}</h3>
                </div>
                <div class="report-stat-item">
                    <p>🔴 Tertunda</p>
                    <h3 style="color: #f5576c;">${pending}</h3>
                </div>
            </div>
            
            <div class="report-detail">
                <h4>📊 Breakdown per Kategori</h4>
                <ul>
                    <li>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#2d8659">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Pelayanan: ${categories.Pelayanan} keluhan
                    </li>
                    <li>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#2d8659">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Sarana: ${categories.Sarana} keluhan
                    </li>
                    <li>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#2d8659">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Prasarana: ${categories.Prasarana} keluhan
                    </li>
                </ul>
            </div>
            
            <div class="report-detail">
                <h4>💰 Estimasi Biaya Total</h4>
                <p style="font-size: 20px; font-weight: 700; color: #f39c12; margin: 8px 0 0 0;">
                    ${Utils.formatCurrency(totalCost)}
                </p>
            </div>
        `;
    },

    // Update checkbox listeners
    updateCheckboxListeners: function () {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => App.updateBulkActions());
        });
    },

    // Update bulk actions visibility
    updateBulkActionsBar: function (count) {
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');

        if (count > 0) {
            bulkActions.style.display = 'flex';
            selectedCount.textContent = count;
        } else {
            bulkActions.style.display = 'none';
        }
    }
};

// Close modal when clicking outside
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
};
