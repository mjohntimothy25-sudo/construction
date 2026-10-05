/**
 * BUILDPRO CONSTRUCTIONS - Main Application Logic
 * Manages theme, i18n, modals, toast notifications, and global header/mobile navigation.
 */

// Multi-language dictionary
const TRANSLATIONS = {
  en: {
    heroTitle: "Find Skilled Construction Workers Faster",
    heroSub: "Connect with skilled and experienced construction workers based on trade, experience, location and availability.",
    btnRegisterWorker: "Register as Worker",
    btnFindWorkers: "Find Workers",
    btnViewJobs: "View Jobs",
    btnPostRequirement: "Post Labour Requirement",
    statWorkers: "Registered Workers",
    statSkilled: "Skilled Workers",
    statAvailable: "Available Workers",
    statJobs: "Construction Jobs",
    statCategories: "Categories",
    navHome: "Home",
    navWorkers: "Find Workers",
    navJobs: "Available Jobs",
    navPostJob: "Post Requirement",
    navRegister: "Register Worker",
    navAdmin: "Admin Panel"
  },
  hi: {
    heroTitle: "कुशल निर्माण श्रमिकों को तेजी से खोजें",
    heroSub: "ट्रेड, अनुभव, स्थान और उपलब्धता के आधार पर योग्य और अनुभवी निर्माण श्रमिकों से जुड़ें।",
    btnRegisterWorker: "श्रमिक के रूप में पंजीकरण करें",
    btnFindWorkers: "श्रमिक खोजें",
    btnViewJobs: "नौकरियां देखें",
    btnPostRequirement: "श्रमिक आवश्यकता पोस्ट करें",
    statWorkers: "पंजीकृत श्रमिक",
    statSkilled: "कुशल श्रमिक",
    statAvailable: "उपलब्ध श्रमिक",
    statJobs: "निर्माण नौकरियां",
    statCategories: "श्रेणियां",
    navHome: "होम",
    navWorkers: "श्रमिक खोजें",
    navJobs: "उपलब्ध नौकरियां",
    navPostJob: "आवश्यकता पोस्ट करें",
    navRegister: "श्रमिक पंजीकरण",
    navAdmin: "एडमिन पैनल"
  },
  te: {
    heroTitle: "నైపుణ్యం కలిగిన నిర్మాణ కార్మికులను త్వరగా కనుగొనండి",
    heroSub: "వృత్తి, అనుభవం, ప్రాంతం మరియు అందుబాటు ఆధారంగా నైపుణ్యం కలిగిన నిర్మాణ కార్మికులతో అనుసంధానం అవ్వండి.",
    btnRegisterWorker: "కార్మికుడిగా నమోదు చేసుకోండి",
    btnFindWorkers: "కార్మికులను వెతకండి",
    btnViewJobs: "ఉద్యోగాలు చూడండి",
    btnPostRequirement: "కార్మికుల అవసరాన్ని పోస్ట్ చేయండి",
    statWorkers: "నమోదైన కార్మికులు",
    statSkilled: "నైపుణ్యం కలిగిన కార్మికులు",
    statAvailable: "అందుబాటులో ఉన్న కార్మికులు",
    statJobs: "నిర్మాణ ఉద్యోగాలు",
    statCategories: "వర్గాలు",
    navHome: "హోమ్",
    navWorkers: "కార్మికులను వెతకండి",
    navJobs: "అందుబాటులోని ఉద్యోగాలు",
    navPostJob: "అవసరాన్ని పోస్ట్ చేయండి",
    navRegister: "కార్మికుల నమోదు",
    navAdmin: "అడ్మిన్ ప్యానెల్"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

const App = {
  init() {
    this.applyTheme();
    this.applyLanguage();
    this.setupEventListeners();
    this.highlightActiveNav();
    this.animateCounters();
  },

  setupEventListeners() {
    // Theme toggle
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.toggleTheme());
    }

    // Language switcher
    const langSelect = document.getElementById("langSelect");
    if (langSelect) {
      langSelect.value = storage.getLanguage();
      langSelect.addEventListener("change", (e) => {
        storage.setLanguage(e.target.value);
        this.applyLanguage();
      });
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById("mobileMenuToggle");
    const navMenu = document.getElementById("primaryNavMenu");
    if (mobileMenuBtn && navMenu) {
      mobileMenuBtn.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        mobileMenuBtn.classList.toggle("active");
      });
    }

    // Close modal on backdrop click or close button
    document.querySelectorAll(".modal-backdrop, .modal-close-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal-container");
        if (modal) {
          modal.classList.remove("active");
        }
      });
    });
  },

  applyTheme() {
    const theme = storage.getTheme();
    document.documentElement.setAttribute("data-theme", theme);
    const themeIcon = document.getElementById("themeIcon");
    if (themeIcon) {
      themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    }
  },

  toggleTheme() {
    const current = storage.getTheme();
    const next = current === "dark" ? "light" : "dark";
    storage.setTheme(next);
    this.applyTheme();
    App.showToast(`Switched to ${next} mode`, "info");
  },

  applyLanguage() {
    const lang = storage.getLanguage();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    document.querySelectorAll("[data-i18n]").forEach(elem => {
      const key = elem.getAttribute("data-i18n");
      if (dict[key]) {
        elem.textContent = dict[key];
      }
    });
  },

  highlightActiveNav() {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link, .mobile-bottom-link").forEach(link => {
      const href = link.getAttribute("href");
      if (href && (href === currentPath || (currentPath === "" && href === "index.html"))) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  },

  animateCounters() {
    const counters = document.querySelectorAll(".counter-value");
    if (counters.length === 0) return;

    // Calculate actual real counts from storage
    const workers = storage.getWorkers();
    const jobs = storage.getJobs();
    const categories = storage.getCategories();

    const counts = {
      totalWorkers: workers.length,
      skilledWorkers: workers.filter(w => w.skillLevel === "Skilled" || w.skillLevel === "Highly Skilled").length,
      availableWorkers: workers.filter(w => w.availability === "Immediately Available").length,
      totalJobs: jobs.length,
      totalCategories: categories.length
    };

    counters.forEach(counter => {
      const key = counter.getAttribute("data-count-key");
      const target = counts[key] !== undefined ? counts[key] : (parseInt(counter.getAttribute("data-target")) || 0);
      
      let start = 0;
      const duration = 1200;
      const stepTime = 30;
      const steps = duration / stepTime;
      const increment = Math.ceil(target / steps);

      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          counter.textContent = target;
          clearInterval(timer);
        } else {
          counter.textContent = start;
        }
      }, stepTime);
    });
  },

  showToast(message, type = "success", duration = 3500) {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "❌";
    if (type === "warning") icon = "⚠️";

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-msg">${message}</span>
      <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    toast.querySelector(".toast-close").addEventListener("click", () => {
      toast.remove();
    });

    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  },

  buildWhatsAppLink(phone, message) {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    // Ensure country code if missing
    let formatted = cleanPhone;
    if (formatted.length === 10) {
      formatted = "91" + formatted;
    }
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${formatted}?text=${encoded}`;
  }
};
