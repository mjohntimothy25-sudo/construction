/**
 * BUILDPRO CONSTRUCTIONS - Storage Helper
 * LocalStorage database abstraction layer with automatic initial seeding.
 */

const STORAGE_KEYS = {
  WORKERS: "buildpro_workers",
  JOBS: "buildpro_jobs",
  APPLICATIONS: "buildpro_applications",
  CATEGORIES: "buildpro_categories",
  EMPLOYERS: "buildpro_employers",
  ADMIN_SETTINGS: "buildpro_admin_settings",
  LANGUAGE: "buildpro_language",
  THEME: "buildpro_theme"
};

class StorageService {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WORKERS)) {
      localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(INITIAL_WORKERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EMPLOYERS)) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYERS, JSON.stringify(INITIAL_EMPLOYERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify({
        companyName: "BUILDPRO CONSTRUCTIONS",
        tagline: "Building Projects. Connecting People.",
        requireVerification: true,
        contactVisibility: "public",
        allowPublicRegistration: true
      }));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LANGUAGE)) {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, "en");
    }
    if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
      localStorage.setItem(STORAGE_KEYS.THEME, "light");
    }
  }

  // --- WORKERS ---
  getWorkers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKERS)) || [];
    } catch (e) {
      console.error("Error fetching workers:", e);
      return [];
    }
  }

  getWorkerById(id) {
    const workers = this.getWorkers();
    return workers.find(w => w.id === id) || null;
  }

  saveWorker(workerData) {
    const workers = this.getWorkers();
    if (!workerData.id) {
      workerData.id = this.generateWorkerId();
    }
    if (!workerData.registeredDate) {
      workerData.registeredDate = new Date().toISOString().split("T")[0];
    }
    if (!workerData.status) {
      workerData.status = "Pending Verification";
    }
    workers.unshift(workerData);
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
    return workerData;
  }

  updateWorker(id, updates) {
    const workers = this.getWorkers();
    const index = workers.findIndex(w => w.id === id);
    if (index !== -1) {
      workers[index] = { ...workers[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
      return workers[index];
    }
    return null;
  }

  deleteWorker(id) {
    let workers = this.getWorkers();
    workers = workers.filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
    return true;
  }

  generateWorkerId() {
    const workers = this.getWorkers();
    const count = workers.length + 1;
    const pad = String(count).padStart(4, "0");
    return `WRK-2026-${pad}`;
  }

  // --- JOBS ---
  getJobs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS)) || [];
    } catch (e) {
      console.error("Error fetching jobs:", e);
      return [];
    }
  }

  getJobById(id) {
    const jobs = this.getJobs();
    return jobs.find(j => j.id === id) || null;
  }

  saveJob(jobData) {
    const jobs = this.getJobs();
    if (!jobData.id) {
      jobData.id = this.generateJobId();
    }
    if (!jobData.postedDate) {
      jobData.postedDate = new Date().toISOString().split("T")[0];
    }
    if (!jobData.status) {
      jobData.status = "Active";
    }
    jobs.unshift(jobData);
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    return jobData;
  }

  updateJob(id, updates) {
    const jobs = this.getJobs();
    const index = jobs.findIndex(j => j.id === id);
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
      return jobs[index];
    }
    return null;
  }

  deleteJob(id) {
    let jobs = this.getJobs();
    jobs = jobs.filter(j => j.id !== id);
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    return true;
  }

  generateJobId() {
    const jobs = this.getJobs();
    const count = jobs.length + 1;
    const pad = String(count).padStart(4, "0");
    return `JOB-2026-${pad}`;
  }

  // --- APPLICATIONS ---
  getApplications() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) || [];
    } catch (e) {
      console.error("Error fetching applications:", e);
      return [];
    }
  }

  saveApplication(appData) {
    const applications = this.getApplications();
    // Check if already applied
    const exists = applications.find(a => a.jobId === appData.jobId && a.workerId === appData.workerId);
    if (exists) {
      return { success: false, message: "You have already applied for this job.", application: exists };
    }

    if (!appData.id) {
      appData.id = this.generateAppId();
    }
    if (!appData.appliedDate) {
      appData.appliedDate = new Date().toISOString().split("T")[0];
    }
    if (!appData.status) {
      appData.status = "Applied";
    }
    applications.unshift(appData);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
    return { success: true, message: "Application submitted successfully!", application: appData };
  }

  updateApplicationStatus(id, status, notes = "") {
    const apps = this.getApplications();
    const index = apps.findIndex(a => a.id === id);
    if (index !== -1) {
      apps[index].status = status;
      if (notes) apps[index].notes = notes;
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
      return apps[index];
    }
    return null;
  }

  generateAppId() {
    const apps = this.getApplications();
    const count = apps.length + 1;
    const pad = String(count).padStart(4, "0");
    return `APP-2026-${pad}`;
  }

  // --- CATEGORIES ---
  getCategories() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES)) || INITIAL_CATEGORIES;
    } catch (e) {
      return INITIAL_CATEGORIES;
    }
  }

  saveCategory(catData) {
    const categories = this.getCategories();
    if (!catData.id) {
      catData.id = "cat-" + catData.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    }
    categories.push(catData);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return catData;
  }

  addSubcategory(categoryName, subcatName) {
    const categories = this.getCategories();
    const cat = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (cat) {
      if (!cat.subcategories.includes(subcatName)) {
        cat.subcategories.push(subcatName);
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      }
      return cat;
    }
    return null;
  }

  // --- EMPLOYERS ---
  getEmployers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYERS)) || [];
    } catch (e) {
      return [];
    }
  }

  saveEmployer(empData) {
    const employers = this.getEmployers();
    if (!empData.id) {
      empData.id = this.generateEmployerId();
    }
    if (!empData.registeredDate) {
      empData.registeredDate = new Date().toISOString().split("T")[0];
    }
    employers.unshift(empData);
    localStorage.setItem(STORAGE_KEYS.EMPLOYERS, JSON.stringify(employers));
    return empData;
  }

  generateEmployerId() {
    const employers = this.getEmployers();
    const count = employers.length + 1;
    const pad = String(count).padStart(4, "0");
    return `EMP-2026-${pad}`;
  }

  // --- SETTINGS, THEME & LANG ---
  getAdminSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS));
    } catch (e) {
      return {};
    }
  }

  saveAdminSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(settings));
  }

  getLanguage() {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || "en";
  }

  setLanguage(lang) {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }

  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || "light";
  }

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  // --- RESET DB ---
  resetDatabase() {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(INITIAL_WORKERS));
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
    localStorage.setItem(STORAGE_KEYS.EMPLOYERS, JSON.stringify(INITIAL_EMPLOYERS));
    return true;
  }
}

const storage = new StorageService();
