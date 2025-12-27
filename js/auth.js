const Auth = {
  client: null,
  currentUser: null,
  profile: null, // Menyimpan profil lengkap (role, name, department)

  init() {
    if (!window.supabase) {
      console.error("Supabase library belum loaded");
      return;
    }
    this.client = supabase.createClient(CONFIG.AUTH.SUPABASE_URL, CONFIG.AUTH.SUPABASE_KEY);
    this.restoreSession();
    this.updateUI();
  },

  async handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail")?.value?.trim();
    const password = document.getElementById("loginPassword")?.value;

    console.log("Attempting login:", email);
    UI.showToast("⏳ Mencoba masuk...", "info");

    try {
      const { data, error } = await this.client.auth.signInWithPassword({ email, password });

      if (error) {
        console.error("Login error:", error);
        UI.showToast("❌ Login Gagal: " + error.message, "error");
        return;
      }

      // Ambil profil dari CONFIG.AUTH.USERS
      const prof = CONFIG.AUTH.USERS?.[data.user.email];
      if (!prof) {
        await this.client.auth.signOut();
        UI.showToast("⚠️ Akses Ditolak: Email tidak terdaftar di BKM", "error");
        return;
      }

      this.currentUser = data.user;
      this.profile = prof;
      this.saveSession();

      UI.showToast("✅ Berhasil masuk", "success");
      setTimeout(() => this.redirectToDashboard(), 500);

    } catch (err) {
      console.error("Login exception:", err);
      UI.showToast("❌ Error login: " + (err.message || err), "error");
    }
  },

  async logout() {
    UI.showConfirm(
      "Logout",
      "Yakin ingin keluar dari sistem?",
      async () => {
        try {
          await this.client.auth.signOut();
        } finally {
          localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_SESSION);
          this.currentUser = null;
          this.profile = null;
          location.reload();
        }
      }
    );
  },

  // === HELPER FUNCTIONS (YANG HILANG TADI) ===
  
  isLoggedIn() {
    return !!this.currentUser;
  },

  isAdmin() {
    return this.isLoggedIn() && this.profile?.role === "admin";
  },

  // Helper untuk app.js
  getUserName() {
    return this.profile?.name || this.currentUser?.email || "User";
  },

  getUserRole() {
    return this.profile?.role || "user";
  },
  
  getUserEmail() {
    return this.currentUser?.email;
  },

    canModify(item) {
    if (!this.isLoggedIn()) return false;
    
    // Admin boleh edit apa saja
    if (this.isAdmin()) return true; 

    // PIC hanya boleh edit jika dia yang buat
    // Pastikan 'item.createdBy' ada dan cocok dengan email user login
    return item.createdBy === this.currentUser.email;
  },


  saveSession() {
    const payload = { user: this.currentUser, profile: this.profile };
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_SESSION, JSON.stringify(payload));
  },

  restoreSession() {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_SESSION);
    if (!raw) return;
    try {
      const payload = JSON.parse(raw);
      this.currentUser = payload.user || null;
      this.profile = payload.profile || null;
    } catch (e) {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_SESSION);
    }
  },

  updateUI() {
    const loginBtn = document.getElementById("loginBtn");
    const btnTambah = document.getElementById("btnTambahKeluhan");
    const btnExportPDF = document.getElementById("btnExportPDF");
    const userProfile = document.getElementById("userProfile");

    if (this.isLoggedIn()) {
      if (loginBtn) loginBtn.style.display = "none";
      if (btnTambah) btnTambah.style.display = "inline-flex";
      if (btnExportPDF) btnExportPDF.style.display = "inline-flex";

      if (userProfile) {
        userProfile.style.display = "flex";
        const nameEl = userProfile.querySelector(".user-name");
        const roleEl = userProfile.querySelector(".user-role");
        if (nameEl) nameEl.textContent = this.getUserName();
        if (roleEl) roleEl.textContent = this.profile?.department || this.getUserRole().toUpperCase();
      }
    } else {
      if (loginBtn) loginBtn.style.display = "flex";
      if (btnTambah) btnTambah.style.display = "none";
      if (btnExportPDF) btnExportPDF.style.display = "none";
      if (userProfile) userProfile.style.display = "none";
    }

    if (window.App?.render) App.render();
  },

  showLoginModal() {
    document.getElementById("loginModal")?.style && (document.getElementById("loginModal").style.display = "flex");
  },

  hideLoginModal() {
    document.getElementById("loginModal")?.style && (document.getElementById("loginModal").style.display = "none");
  },

  redirectToDashboard() {
    this.hideLoginModal();
    this.updateUI();
  }
};

document.addEventListener("DOMContentLoaded", () => Auth.init());
