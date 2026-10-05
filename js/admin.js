/**
 * BUILDPRO CONSTRUCTIONS - Admin Dashboard Module
 * Manages stats calculation, worker management, verification, job & application status, category manager, and reports.
 */

const AdminModule = {
  initAdminDashboard() {
    const dashboardContainer = document.getElementById("adminDashboardMain");
    if (!dashboardContainer) return;

    this.setupAdminTabs();
    this.renderOverviewTab();
    this.setupWorkerTableEvents();
    this.setupCategoryManagerEvents();
  },

  setupAdminTabs() {
    document.querySelectorAll(".admin-nav-link").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetTab = link.getAttribute("data-tab");

        document.querySelectorAll(".admin-nav-link").forEach(l => l.classList.remove("active"));
        document.querySelectorAll(".admin-tab-content").forEach(t => t.style.display = "none");

        link.classList.add("active");
        const targetElem = document.getElementById(`tab-${targetTab}`);
        if (targetElem) {
          targetElem.style.display = "block";
        }

        // Render tab content dynamically
        if (targetTab === "overview") this.renderOverviewTab();
        if (targetTab === "workers") this.renderWorkersTab();
        if (targetTab === "jobs") this.renderJobsTab();
        if (targetTab === "applications") this.renderApplicationsTab();
        if (targetTab === "categories") this.renderCategoriesTab();
        if (targetTab === "reports") this.renderReportsTab();
        if (targetTab === "settings") this.renderSettingsTab();
      });
    });
  },

  renderOverviewTab() {
    const workers = storage.getWorkers();
    const jobs = storage.getJobs();
    const apps = storage.getApplications();

    const totalWorkers = workers.length;
    const availableWorkers = workers.filter(w => w.availability === "Immediately Available").length;
    const skilledWorkers = workers.filter(w => w.skillLevel === "Skilled" || w.skillLevel === "Highly Skilled").length;
    const totalJobs = jobs.length;
    const activeRequirements = jobs.filter(j => j.status === "Active").length;
    const hiredWorkers = apps.filter(a => a.status === "Selected").length;

    // Update Stat Cards
    const updateElem = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    updateElem("adminTotalWorkersCard", totalWorkers);
    updateElem("adminAvailableWorkersCard", availableWorkers);
    updateElem("adminSkilledWorkersCard", skilledWorkers);
    updateElem("adminTotalJobsCard", totalJobs);
    updateElem("adminActiveReqsCard", activeRequirements);
    updateElem("adminHiredCard", hiredWorkers);

    this.renderCategoryDistributionChart();
  },

  renderCategoryDistributionChart() {
    const chartContainer = document.getElementById("adminCategoryChartContainer");
    if (!chartContainer) return;

    const workers = storage.getWorkers();
    const catMap = {};

    workers.forEach(w => {
      catMap[w.category] = (catMap[w.category] || 0) + 1;
    });

    const categories = Object.keys(catMap);
    const maxCount = Math.max(...Object.values(catMap), 1);

    chartContainer.innerHTML = `
      <div class="css-chart-bar-list">
        ${categories.map(cat => {
          const count = catMap[cat];
          const pct = Math.round((count / maxCount) * 100);
          return `
            <div class="chart-bar-item">
              <div class="chart-bar-label-row">
                <span class="chart-bar-label">${cat}</span>
                <span class="chart-bar-val">${count} Workers</span>
              </div>
              <div class="chart-bar-track">
                <div class="chart-bar-fill" style="width: ${pct}%;"></div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  },

  // --- WORKERS MANAGEMENT TAB ---
  renderWorkersTab() {
    const tableBody = document.getElementById("adminWorkersTableBody");
    if (!tableBody) return;

    WorkerModule.populateCategoryDropdown("adminWorkerCategoryFilter");
    this.filterAndRenderWorkersTable();
  },

  setupWorkerTableEvents() {
    const searchInput = document.getElementById("adminWorkerSearchInput");
    const catFilter = document.getElementById("adminWorkerCategoryFilter");
    const statusFilter = document.getElementById("adminWorkerStatusFilter");

    if (searchInput) searchInput.addEventListener("input", () => this.filterAndRenderWorkersTable());
    if (catFilter) catFilter.addEventListener("change", () => this.filterAndRenderWorkersTable());
    if (statusFilter) statusFilter.addEventListener("change", () => this.filterAndRenderWorkersTable());
  },

  filterAndRenderWorkersTable() {
    const tableBody = document.getElementById("adminWorkersTableBody");
    if (!tableBody) return;

    let workers = storage.getWorkers();
    const search = document.getElementById("adminWorkerSearchInput")?.value?.toLowerCase() || "";
    const category = document.getElementById("adminWorkerCategoryFilter")?.value || "";
    const status = document.getElementById("adminWorkerStatusFilter")?.value || "";

    workers = workers.filter(w => {
      if (search) {
        const matchName = w.fullName.toLowerCase().includes(search);
        const matchId = w.id.toLowerCase().includes(search);
        const matchLoc = (w.currentLocation + " " + w.district).toLowerCase().includes(search);
        if (!matchName && !matchId && !matchLoc) return false;
      }
      if (category && w.category !== category) return false;
      if (status && w.status !== status) return false;
      return true;
    });

    if (workers.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="10" class="text-center py-3 text-muted">No workers found matching table filters.</td></tr>`;
      return;
    }

    tableBody.innerHTML = workers.map(w => `
      <tr>
        <td><strong>${w.id}</strong></td>
        <td>
          <div class="tbl-user-cell">
            <img src="${w.photo}" class="tbl-avatar" alt="${w.fullName}" onerror="this.src='https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80'" />
            <div>
              <strong>${w.fullName}</strong>
              <span class="text-xs text-muted block">${w.mobile}</span>
            </div>
          </div>
        </td>
        <td>${w.category}<br/><span class="text-xs text-muted">${w.subcategory}</span></td>
        <td><span class="badge badge-skill">${w.skillLevel}</span></td>
        <td>${w.experienceYears} Yrs</td>
        <td>${w.district}, ${w.state}</td>
        <td><span class="text-xs text-success">${w.availability}</span></td>
        <td>₹${w.expectedDailyWage}/day</td>
        <td>
          <select class="form-select-sm status-select-${w.status === 'Verified' ? 'verified' : (w.status === 'Rejected' ? 'rejected' : 'pending')}" onchange="AdminModule.updateWorkerVerification('${w.id}', this.value)">
            <option value="Verified" ${w.status === 'Verified' ? 'selected' : ''}>🟢 Verified</option>
            <option value="Pending Verification" ${w.status === 'Pending Verification' ? 'selected' : ''}>🟡 Pending</option>
            <option value="Rejected" ${w.status === 'Rejected' ? 'selected' : ''}>🔴 Rejected</option>
          </select>
        </td>
        <td>
          <div class="action-btn-group">
            <a href="worker-profile.html?id=${w.id}" class="btn-tbl-action" title="View Profile">👁️</a>
            <button class="btn-tbl-action" title="Contact Worker" onclick="WorkerModule.openContactModal('${w.id}')">📞</button>
            <button class="btn-tbl-action text-danger" title="Delete Worker" onclick="AdminModule.deleteWorkerPrompt('${w.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `).join("");
  },

  updateWorkerVerification(workerId, newStatus) {
    const updated = storage.updateWorker(workerId, { status: newStatus });
    if (updated) {
      App.showToast(`Worker ${workerId} verification status updated to "${newStatus}"`, "success");
      this.filterAndRenderWorkersTable();
      this.renderOverviewTab();
    }
  },

  deleteWorkerPrompt(workerId) {
    if (confirm(`Are you sure you want to delete worker profile ${workerId}? This action cannot be undone.`)) {
      storage.deleteWorker(workerId);
      App.showToast(`Worker ${workerId} deleted.`, "info");
      this.filterAndRenderWorkersTable();
      this.renderOverviewTab();
    }
  },

  // --- JOBS MANAGEMENT TAB ---
  renderJobsTab() {
    const tableBody = document.getElementById("adminJobsTableBody");
    if (!tableBody) return;

    const jobs = storage.getJobs();
    if (jobs.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-3 text-muted">No jobs posted yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = jobs.map(j => `
      <tr>
        <td><strong>${j.id}</strong></td>
        <td>
          <strong>${j.jobTitle}</strong>
          <span class="text-xs text-muted block">🏢 ${j.companyName}</span>
        </td>
        <td>${j.category}<br/><span class="text-xs text-muted">${j.subcategory}</span></td>
        <td>${j.projectLocation}</td>
        <td>${j.workersNeeded} Workers</td>
        <td>₹${j.wageOffer} / ${j.wageType === 'Per Month' ? 'mo' : 'day'}</td>
        <td>
          <select class="form-select-sm" onchange="AdminModule.updateJobStatus('${j.id}', this.value)">
            <option value="Active" ${j.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Filled" ${j.status === 'Filled' ? 'selected' : ''}>Filled</option>
            <option value="Closed" ${j.status === 'Closed' ? 'selected' : ''}>Closed</option>
          </select>
        </td>
        <td>
          <div class="action-btn-group">
            <a href="job-details.html?id=${j.id}" class="btn-tbl-action" title="View Job">👁️</a>
            <button class="btn-tbl-action text-danger" title="Delete Job" onclick="AdminModule.deleteJobPrompt('${j.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `).join("");
  },

  updateJobStatus(jobId, newStatus) {
    storage.updateJob(jobId, { status: newStatus });
    App.showToast(`Job ${jobId} status set to "${newStatus}"`, "success");
    this.renderJobsTab();
    this.renderOverviewTab();
  },

  deleteJobPrompt(jobId) {
    if (confirm(`Are you sure you want to delete job posting ${jobId}?`)) {
      storage.deleteJob(jobId);
      App.showToast(`Job ${jobId} deleted.`, "info");
      this.renderJobsTab();
      this.renderOverviewTab();
    }
  },

  // --- APPLICATIONS MANAGEMENT TAB ---
  renderApplicationsTab() {
    const tableBody = document.getElementById("adminAppsTableBody");
    if (!tableBody) return;

    const apps = storage.getApplications();
    if (apps.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-3 text-muted">No job applications recorded yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = apps.map(a => `
      <tr>
        <td><strong>${a.id}</strong></td>
        <td>
          <a href="worker-profile.html?id=${a.workerId}"><strong>${a.workerName}</strong></a>
          <span class="text-xs text-muted block">📱 ${a.workerPhone} (${a.workerId})</span>
        </td>
        <td>
          <a href="job-details.html?id=${a.jobId}"><strong>${a.jobTitle}</strong></a>
          <span class="text-xs text-muted block">🏢 ${a.companyName}</span>
        </td>
        <td>${a.appliedDate}</td>
        <td><span class="text-xs">${a.notes || 'No notes'}</span></td>
        <td>
          <select class="form-select-sm" onchange="AdminModule.updateAppStatus('${a.id}', this.value)">
            <option value="Applied" ${a.status === 'Applied' ? 'selected' : ''}>Applied</option>
            <option value="Shortlisted" ${a.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
            <option value="Interview" ${a.status === 'Interview' ? 'selected' : ''}>Interview</option>
            <option value="Selected" ${a.status === 'Selected' ? 'selected' : ''}>Selected</option>
            <option value="Rejected" ${a.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </td>
        <td>
          <a href="worker-profile.html?id=${a.workerId}" class="btn-tbl-action" title="View Profile">👁️ Worker</a>
        </td>
      </tr>
    `).join("");
  },

  updateAppStatus(appId, newStatus) {
    storage.updateApplicationStatus(appId, newStatus);
    App.showToast(`Application ${appId} status updated to "${newStatus}"`, "success");
    this.renderApplicationsTab();
    this.renderOverviewTab();
  },

  // --- CATEGORIES MANAGEMENT TAB ---
  renderCategoriesTab() {
    const gridContainer = document.getElementById("adminCategoriesGrid");
    if (!gridContainer) return;

    const categories = storage.getCategories();
    gridContainer.innerHTML = categories.map(cat => `
      <div class="admin-cat-card">
        <div class="admin-cat-header">
          <span class="admin-cat-icon">${cat.icon || '🔨'}</span>
          <div>
            <h3>${cat.name}</h3>
            <span class="text-xs text-muted">${(cat.subcategories || []).length} Subcategories / Trades</span>
          </div>
        </div>
        <p class="text-xs text-muted mt-2">${cat.description || 'Construction trade category'}</p>
        
        <div class="admin-subcat-tags mt-2">
          ${(cat.subcategories || []).map(sub => `<span class="tag tag-sm">${sub}</span>`).join("")}
        </div>

        <div class="mt-3">
          <button class="btn btn-outline btn-xs btn-block" onclick="AdminModule.openAddSubcatModal('${cat.name}')">+ Add Subcategory</button>
        </div>
      </div>
    `).join("");
  },

  setupCategoryManagerEvents() {
    const addCatBtn = document.getElementById("addNewCategoryBtn");
    if (addCatBtn) {
      addCatBtn.addEventListener("click", () => {
        App.openModal("addCategoryModal");
      });
    }

    const saveCatBtn = document.getElementById("saveCategoryBtn");
    if (saveCatBtn) {
      saveCatBtn.addEventListener("click", () => {
        const name = document.getElementById("newCatName")?.value?.trim();
        const icon = document.getElementById("newCatIcon")?.value?.trim() || "🔨";
        const desc = document.getElementById("newCatDesc")?.value?.trim() || "";
        const subcatsRaw = document.getElementById("newCatSubcats")?.value?.trim() || "";

        if (!name) {
          App.showToast("Category name is required.", "warning");
          return;
        }

        const subcategories = subcatsRaw ? subcatsRaw.split(",").map(s => s.trim()).filter(Boolean) : [name];

        storage.saveCategory({
          name: name,
          icon: icon,
          description: desc,
          subcategories: subcategories
        });

        App.closeModal("addCategoryModal");
        App.showToast(`Category "${name}" added successfully!`, "success");
        this.renderCategoriesTab();
      });
    }
  },

  openAddSubcatModal(catName) {
    const newSubcat = prompt(`Enter new subcategory / trade name to add under "${catName}":`);
    if (newSubcat && newSubcat.trim()) {
      storage.addSubcategory(catName, newSubcat.trim());
      App.showToast(`Added trade "${newSubcat.trim()}" to ${catName}`, "success");
      this.renderCategoriesTab();
    }
  },

  // --- REPORTS TAB ---
  renderReportsTab() {
    const reportContainer = document.getElementById("adminReportsContainer");
    if (!reportContainer) return;

    const workers = storage.getWorkers();
    const jobs = storage.getJobs();
    const apps = storage.getApplications();

    // Calculate experience distribution
    const expMap = { "0-1 Yrs": 0, "2-5 Yrs": 0, "5-10 Yrs": 0, "10+ Yrs": 0 };
    workers.forEach(w => {
      if (w.experienceYears <= 1) expMap["0-1 Yrs"]++;
      else if (w.experienceYears <= 5) expMap["2-5 Yrs"]++;
      else if (w.experienceYears <= 10) expMap["5-10 Yrs"]++;
      else expMap["10+ Yrs"]++;
    });

    reportContainer.innerHTML = `
      <div class="reports-grid">
        <div class="profile-section-card">
          <h3 class="section-card-title">📊 Experience Level Distribution</h3>
          <div class="css-chart-bar-list mt-3">
            ${Object.keys(expMap).map(k => `
              <div class="chart-bar-item">
                <div class="chart-bar-label-row">
                  <span>${k}</span>
                  <strong>${expMap[k]} Workers</strong>
                </div>
                <div class="chart-bar-track">
                  <div class="chart-bar-fill bg-orange" style="width: ${Math.round((expMap[k]/Math.max(...Object.values(expMap), 1))*100)}%;"></div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="profile-section-card">
          <h3 class="section-card-title">📈 Recruitment Funnel Summary</h3>
          <div class="funnel-stats-list mt-3">
            <div class="funnel-item">
              <span class="funnel-label">Total Registered Workers:</span>
              <strong class="funnel-val">${workers.length}</strong>
            </div>
            <div class="funnel-item">
              <span class="funnel-label">Total Posted Job Requirements:</span>
              <strong class="funnel-val">${jobs.length}</strong>
            </div>
            <div class="funnel-item">
              <span class="funnel-label">Total Applications Submitted:</span>
              <strong class="funnel-val">${apps.length}</strong>
            </div>
            <div class="funnel-item">
              <span class="funnel-label">Shortlisted Candidates:</span>
              <strong class="funnel-val text-warning">${apps.filter(a=>a.status==='Shortlisted').length}</strong>
            </div>
            <div class="funnel-item">
              <span class="funnel-label">Selected / Hired Workers:</span>
              <strong class="funnel-val text-success">${apps.filter(a=>a.status==='Selected').length}</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // --- SETTINGS TAB ---
  renderSettingsTab() {
    const settingsContainer = document.getElementById("adminSettingsContainer");
    if (!settingsContainer) return;

    const settings = storage.getAdminSettings();

    settingsContainer.innerHTML = `
      <div class="profile-section-card max-w-700">
        <h3 class="section-card-title">⚙️ Recruitment Portal Configuration</h3>
        
        <form id="adminSettingsForm" class="mt-3">
          <div class="form-group">
            <label class="form-label">Company Name</label>
            <input type="text" id="cfgCompanyName" class="form-control" value="${settings.companyName || 'BUILDPRO CONSTRUCTIONS'}" />
          </div>

          <div class="form-group">
            <label class="form-label">Company Tagline</label>
            <input type="text" id="cfgTagline" class="form-control" value="${settings.tagline || 'Building Projects. Connecting People.'}" />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="cfgRequireVerif" ${settings.requireVerification !== false ? 'checked' : ''} />
              Require Admin Verification for New Worker Profiles
            </label>
          </div>

          <div class="mt-3">
            <button type="button" class="btn btn-primary" onclick="AdminModule.saveSettings()">Save Settings</button>
          </div>
        </form>

        <hr class="divider my-4" />

        <div class="danger-zone-box">
          <h3 class="text-danger">⚠️ Danger Zone: Reset Database</h3>
          <p class="text-muted text-sm">Resetting the LocalStorage database will restore all workers, jobs, applications, and categories back to default seed data.</p>
          <button class="btn btn-danger mt-2" onclick="AdminModule.resetDatabasePrompt()">🔄 Reset Database to Default Seed Data</button>
        </div>
      </div>
    `;
  },

  saveSettings() {
    const companyName = document.getElementById("cfgCompanyName")?.value?.trim();
    const tagline = document.getElementById("cfgTagline")?.value?.trim();
    const requireVerification = document.getElementById("cfgRequireVerif")?.checked;

    storage.saveAdminSettings({
      companyName: companyName || "BUILDPRO CONSTRUCTIONS",
      tagline: tagline || "Building Projects. Connecting People.",
      requireVerification: requireVerification
    });

    App.showToast("Admin settings updated!", "success");
  },

  resetDatabasePrompt() {
    if (confirm("Are you sure you want to reset the database? All custom added workers, jobs, and applications will be replaced with fresh seed data.")) {
      storage.resetDatabase();
      App.showToast("Database reset to initial sample data!", "success");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }
};
