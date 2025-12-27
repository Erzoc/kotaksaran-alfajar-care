// Utility Functions
const Utils = {
    // Format date to Indonesian format
    formatDate: function(date) {
        if (!date) return '-';
        const d = new Date(date);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    },

    // Format date to short format (DD/MM/YY)
    formatDateShort: function(date) {
        if (!date) return '-';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = String(d.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    },

    // Get current month name
    getCurrentMonth: function() {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const d = new Date();
        return `${months[d.getMonth()]} ${d.getFullYear()}`;
    },

    // Format currency to Rupiah
    formatCurrency: function(amount) {
        if (!amount || amount === 0) return 'Rp 0';
        return `Rp ${parseInt(amount).toLocaleString('id-ID')}`;
    },

    // Generate unique ID
    generateId: function() {
        return 'BKM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    },

    // Truncate text
    truncate: function(text, length = 50) {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    },

    // Sanitize HTML to prevent XSS
    sanitize: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Check if date is in range
    isDateInRange: function(date, range) {
        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch(range) {
            case 'today':
                const todayStart = new Date(today);
                const todayEnd = new Date(today);
                todayEnd.setHours(23, 59, 59, 999);
                return d >= todayStart && d <= todayEnd;
            
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);
                return d >= weekStart && d <= weekEnd;
            
            case 'month':
                return d.getMonth() === today.getMonth() && 
                       d.getFullYear() === today.getFullYear();
            
            default:
                return true;
        }
    },

    // Debounce function for search
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Download file
    downloadFile: function(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    // Copy to clipboard
    copyToClipboard: function(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            return true;
        }
        return false;
    },

    // Validate form data
    validateForm: function(data) {
        const errors = [];
        
        if (!data.nama || data.nama.trim() === '') {
            errors.push('Nama pelapor harus diisi');
        }
        
        if (!data.kategori) {
            errors.push('Kategori harus dipilih');
        }
        
        if (!data.prioritas) {
            errors.push('Prioritas harus dipilih');
        }
        
        if (!data.uraian || data.uraian.trim() === '') {
            errors.push('Uraian keluhan harus diisi');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Calculate percentage
    percentage: function(part, total) {
        if (total === 0) return 0;
        return Math.round((part / total) * 100);
    },

    // Sort array of objects
    sortBy: function(array, key, order = 'asc') {
        return array.sort((a, b) => {
            const valueA = a[key];
            const valueB = b[key];
            
            if (order === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });
    },

    // Filter array by search term
    filterBySearch: function(array, searchTerm, fields = []) {
        if (!searchTerm) return array;
        
        const term = searchTerm.toLowerCase();
        return array.filter(item => {
            return fields.some(field => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(term);
            });
        });
    }
};
