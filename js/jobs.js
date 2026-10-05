/**
 * BUILDPRO CONSTRUCTIONS - Job Requirement & Application Module
 * Handles job posting, job search/filter/sort, job details view, and application workflow.
 */

const JobModule = {
  initJobPosting() {
    const postForm = document.getElementById("postJobForm");
    if (!postForm) return;

    WorkerModule.populateCategoryDropdown("postJobCategory");
    WorkerModule.setupCategorySubcategoryLink("postJobCategory", "postJobSubcategory");

    postForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submitJobPosting();
    });
  },

  submitJobPosting() {
    const getVal = (id) => document.getElementById(id)?.value?.trim() || "";
    const getCheck = (id) => document.getElementById(id)?.checked || false;

    const container = document.getElementById("postJobForm");
    if (!Validation.validateStep(1, container)) {
      App.showToast("Please fill in all mandatory job posting fields.", "warning");
      return;
    }

    const jobData = {
      jobTitle: getVal("postJobTitle"),
      category: getVal("postJobCategory"),
      subcategory: getVal("postJobSubcategory"),
      workersNeeded: parseInt(getVal("postJobWorkersNeeded")) || 1,
      projectLocation: getVal("postJobLocation"),
      projectType: getVal("postJobProjectType"),
      experienceRequired: getVal("postJobExperience"),
      skillLevel: getVal("postJobSkillLevel"),
      wageOffer: parseInt(getVal("postJobWageOffer")) || 800,
      wageType: getVal("postJobWageType"),
      employmentType: getVal("postJobEmploymentType"),
      joiningDate: getVal("postJobJoiningDate") || "Immediate",
      workingHours: getVal("postJobWorkingHours") || "8 Hours/Day",
      accommodation: getCheck("postJobAccomodation"),
      food: getCheck("postJobFood"),
      transport: getCheck("postJobTransport"),
      jobDescription: getVal("postJobDescription"),
      companyName: getVal("postJobCompanyName"),
      contactPerson: getVal("postJobContactPerson"),
      contactNumber: getVal("postJobContactNumber"),
      status: "Active"
    };

    const savedJob = storage.saveJob(jobData);
    App.showToast(`Job ${savedJob.id} posted successfully!`, "success");

    setTimeout(() => {
      window.location.href = `job-details.html?id=${savedJob.id}`;
    }, 1200);
  },

  // --- FIND JOBS PAGE ---
  initFindJobs() {
    const gridContainer = document.getElementById("jobsGridContainer");
    if (!gridContainer) return;

    WorkerModule.populateCategoryDropdown("filterJobCategory");
    WorkerModule.setupCategorySubcategoryLink("filterJobCategory", "filterJobSubcategory");
    this.setupJobFilterEvents();

    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get("category");
    if (catParam) {
      const filterCat = document.getElementById("filterJobCategory");
      if (filterCat) {
        filterCat.value = catParam;
        filterCat.dispatchEvent(new Event("change"));
      }
    }

    this.renderJobsList();
  },

  setupJobFilterEvents() {
    const applyBtn = document.getElementById("applyJobFiltersBtn");
    const resetBtn = document.getElementById("resetJobFiltersBtn");
    const searchInput = document.getElementById("jobSearchInput");
    const sortSelect = document.getElementById("jobSortSelect");

    if (applyBtn) applyBtn.addEventListener("click", () => this.renderJobsList());
    if (resetBtn) resetBtn.addEventListener("click", () => this.resetJobFilters());
    if (searchInput) searchInput.addEventListener("input", () => this.renderJobsList());
    if (sortSelect) sortSelect.addEventListener("change", () => this.renderJobsList());
  },

  resetJobFilters() {
    document.querySelectorAll(".job-filter-input").forEach(input => {
      if (input.type === "checkbox") {
        input.checked = false;
      } else {
        input.value = "";
      }
    });
    this.renderJobsList();
    App.showToast("Job filters reset", "info");
  },

  renderJobsList() {
    const gridContainer = document.getElementById("jobsGridContainer");
    const countElem = document.getElementById("jobsCountDisplay");
    if (!gridContainer) return;

    let jobs = storage.getJobs();

    const search = document.getElementById("jobSearchInput")?.value?.toLowerCase() || "";
    const category = document.getElementById("filterJobCategory")?.value || "";
    const subcategory = document.getElementById("filterJobSubcategory")?.value || "";
    const location = document.getElementById("filterJobLocation")?.value?.toLowerCase() || "";
    const empType = document.getElementById("filterJobEmpType")?.value || "";
    const accomFilter = document.getElementById("filterJobAccom")?.checked || false;
    const foodFilter = document.getElementById("filterJobFood")?.checked || false;

    jobs = jobs.filter(j => {
      if (search) {
        const matchesTitle = j.jobTitle.toLowerCase().includes(search);
        const matchesCompany = j.companyName.toLowerCase().includes(search);
        const matchesLocation = j.projectLocation.toLowerCase().includes(search);
        const matchesTrade = (j.category + " " + j.subcategory).toLowerCase().includes(search);
        if (!matchesTitle && !matchesCompany && !matchesLocation && !matchesTrade) return false;
      }

      if (category && j.category !== category) return false;
      if (subcategory && j.subcategory !== subcategory) return false;
      if (empType && j.employmentType !== empType) return false;

      if (location && !j.projectLocation.toLowerCase().includes(location)) return false;

      if (accomFilter && !j.accommodation) return false;
      if (foodFilter && !j.food) return false;

      return true;
    });

    // Sorting
    const sortVal = document.getElementById("jobSortSelect")?.value || "newest";
    if (sortVal === "wage-desc") {
      jobs.sort((a, b) => b.wageOffer - a.wageOffer);
    } else if (sortVal === "workers-desc") {
      jobs.sort((a, b) => b.workersNeeded - a.workersNeeded);
    } else {
      jobs.sort((a, b) => new Date(b.postedDate || 0) - new Date(a.postedDate || 0));
    }

    if (countElem) {
      countElem.textContent = `${jobs.length} Active Jobs Found`;
    }

    if (jobs.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-state-box">
          <span class="empty-icon">💼</span>
          <h3>No Jobs Found</h3>
          <p class="text-muted">No construction job requirements match your current search filters.</p>
          <button class="btn btn-outline mt-2" onclick="JobModule.resetJobFilters()">Reset Filters</button>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = jobs.map(j => this.renderJobCardHTML(j)).join("");
  },

  renderJobCardHTML(job) {
    return `
      <div class="job-card">
        <div class="job-card-header">
          <div>
            <span class="badge badge-warning mb-1">${job.category} • ${job.subcategory}</span>
            <h3 class="job-card-title"><a href="job-details.html?id=${job.id}">${job.jobTitle}</a></h3>
            <span class="job-company-name">🏗️ ${job.companyName}</span>
          </div>
          <div class="job-wage-badge">
            <span class="wage-amount">₹${job.wageOffer}</span>
            <span class="wage-unit">/${job.wageType === 'Per Month' ? 'mo' : 'day'}</span>
          </div>
        </div>

        <div class="job-card-body">
          <div class="job-meta-grid">
            <div>📍 <strong>Location:</strong> ${job.projectLocation}</div>
            <div>👥 <strong>Needed:</strong> ${job.workersNeeded} Workers</div>
            <div>⌛ <strong>Min Exp:</strong> ${job.experienceRequired}</div>
            <div>📅 <strong>Joining:</strong> ${job.joiningDate}</div>
          </div>

          <div class="job-perks-row mt-2">
            ${job.accommodation ? `<span class="perk-pill">🏠 Accommodation</span>` : ''}
            ${job.food ? `<span class="perk-pill">🍲 Free Food</span>` : ''}
            ${job.transport ? `<span class="perk-pill">🚌 Transport</span>` : ''}
          </div>
        </div>

        <div class="job-card-footer">
          <span class="text-xs text-muted">Posted: ${job.postedDate}</span>
          <div>
            <a href="job-details.html?id=${job.id}" class="btn btn-outline btn-sm">View Details</a>
            <button class="btn btn-primary btn-sm" onclick="JobModule.openApplyModal('${job.id}')">Apply Now</button>
          </div>
        </div>
      </div>
    `;
  },

  // --- JOB DETAILS PAGE ---
  initJobDetailsPage() {
    const detailsContainer = document.getElementById("jobDetailsMainContainer");
    if (!detailsContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get("id");

    if (!jobId) {
      detailsContainer.innerHTML = `<div class="empty-state-box"><h3>Job ID Missing</h3><a href="jobs.html" class="btn btn-primary mt-2">Browse Jobs</a></div>`;
      return;
    }

    const job = storage.getJobById(jobId);
    if (!job) {
      detailsContainer.innerHTML = `<div class="empty-state-box"><h3>Job Not Found</h3><p>No requirement found for ID: ${jobId}</p><a href="jobs.html" class="btn btn-primary mt-2">Browse Available Jobs</a></div>`;
      return;
    }

    this.renderJobDetailsPage(job);
  },

  renderJobDetailsPage(job) {
    const detailsContainer = document.getElementById("jobDetailsMainContainer");
    if (!detailsContainer) return;

    const waLink = App.buildWhatsAppLink(job.contactNumber, `Hello ${job.contactPerson}, I am interested in applying for your job posting: "${job.jobTitle}" (${job.id}) on BUILDPRO CONSTRUCTIONS portal.`);

    detailsContainer.innerHTML = `
      <div class="job-details-hero-card">
        <div class="hero-left">
          <span class="badge badge-warning mb-2">${job.category} • ${job.subcategory}</span>
          <h1 class="job-hero-title">${job.jobTitle}</h1>
          <p class="company-sub-title">🏢 ${job.companyName} • ${job.projectType}</p>
          <div class="hero-tags mt-2">
            <span>📍 ${job.projectLocation}</span>
            <span>👥 ${job.workersNeeded} Vacancies</span>
            <span>📅 Joining: ${job.joiningDate}</span>
          </div>
        </div>
        <div class="hero-right text-right">
          <div class="wage-hero-box">
            <span class="text-xs text-muted">OFFERED WAGE / SALARY</span>
            <h2 class="wage-hero-amount">₹${job.wageOffer}</h2>
            <span class="wage-hero-unit">${job.wageType} (${job.employmentType})</span>
          </div>
          <button class="btn btn-primary btn-lg mt-3 btn-block" onclick="JobModule.openApplyModal('${job.id}')">⚡ Apply Now</button>
        </div>
      </div>

      <div class="job-details-grid mt-4">
        <div class="job-main-column">
          <div class="profile-section-card">
            <h3 class="section-card-title">📌 Job Description & Site Overview</h3>
            <p class="job-description-text mt-2">${job.jobDescription}</p>
          </div>

          <div class="profile-section-card mt-3">
            <h3 class="section-card-title">✨ Facilities & Contractor Perks</h3>
            <div class="perks-grid mt-2">
              <div class="perk-box ${job.accommodation ? 'active' : ''}">
                <span class="perk-box-icon">🏠</span>
                <div>
                  <strong>Accommodation</strong>
                  <span class="text-xs text-muted block">${job.accommodation ? 'Free bachelor lodging provided at site' : 'Not provided'}</span>
                </div>
              </div>
              <div class="perk-box ${job.food ? 'active' : ''}">
                <span class="perk-box-icon">🍲</span>
                <div>
                  <strong>Mess / Food</strong>
                  <span class="text-xs text-muted block">${job.food ? 'Free site meals or mess allowance' : 'Self arrangement'}</span>
                </div>
              </div>
              <div class="perk-box ${job.transport ? 'active' : ''}">
                <span class="perk-box-icon">🚌</span>
                <div>
                  <strong>Transportation</strong>
                  <span class="text-xs text-muted block">${job.transport ? 'Site pickup / drop transport available' : 'Local transport'}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="profile-section-card mt-3">
            <h3 class="section-card-title">📞 Employer & Site Contact</h3>
            <div class="details-2col-grid mt-2">
              <div><strong>Contact Person:</strong> ${job.contactPerson}</div>
              <div><strong>Company Name:</strong> ${job.companyName}</div>
              <div><strong>Contact Phone:</strong> +91 ${job.contactNumber}</div>
              <div><strong>Job ID:</strong> ${job.id}</div>
            </div>

            <div class="contact-actions-row mt-3">
              <a href="tel:${job.contactNumber}" class="btn btn-call">📞 Call Employer (+91 ${job.contactNumber})</a>
              <a href="${waLink}" target="_blank" class="btn btn-whatsapp">💬 WhatsApp Employer</a>
            </div>
          </div>
        </div>

        <div class="job-sidebar-column">
          <div class="profile-sidebar-card">
            <h3>Job Requirement Summary</h3>
            <hr class="divider" />
            <div class="summary-keyval-list">
              <div class="keyval-item">
                <span>Category:</span> <strong>${job.category}</strong>
              </div>
              <div class="keyval-item">
                <span>Trade / Subcategory:</span> <strong>${job.subcategory}</strong>
              </div>
              <div class="keyval-item">
                <span>Required Skill Level:</span> <strong>${job.skillLevel || 'Skilled'}</strong>
              </div>
              <div class="keyval-item">
                <span>Min Experience:</span> <strong>${job.experienceRequired}</strong>
              </div>
              <div class="keyval-item">
                <span>Working Hours:</span> <strong>${job.workingHours}</strong>
              </div>
              <div class="keyval-item">
                <span>Employment Type:</span> <strong>${job.employmentType}</strong>
              </div>
            </div>
            <button class="btn btn-primary btn-block mt-3" onclick="JobModule.openApplyModal('${job.id}')">Apply for this Job</button>
          </div>
        </div>
      </div>
    `;
  },

  openApplyModal(jobId) {
    const job = storage.getJobById(jobId);
    if (!job) return;

    const modalBody = document.getElementById("applyModalContent");
    const workers = storage.getWorkers();

    if (modalBody) {
      modalBody.innerHTML = `
        <div class="apply-modal-box">
          <h2>Apply for Job</h2>
          <p class="text-muted text-sm">${job.jobTitle} • ${job.companyName}</p>
          
          <div class="form-group mt-3">
            <label class="form-label">Select Registered Worker Profile</label>
            <select id="applyWorkerSelect" class="form-select">
              <option value="">-- Choose Worker --</option>
              ${workers.map(w => `<option value="${w.id}">${w.fullName} (${w.id} - ${w.subcategory})</option>`).join("")}
            </select>
          </div>

          <div class="text-center my-2 text-muted text-xs">-- OR ENTER WORKER ID MANUALLY --</div>

          <div class="form-group">
            <label class="form-label">Worker ID (e.g. WRK-2026-0001)</label>
            <input type="text" id="applyWorkerIdInput" class="form-control" placeholder="WRK-2026-XXXX" />
          </div>

          <div class="form-group">
            <label class="form-label">Optional Message / Note for Contractor</label>
            <textarea id="applyNoteInput" class="form-control" rows="2" placeholder="e.g. Ready to join immediately with 5 years experience"></textarea>
          </div>

          <div class="modal-action-btns mt-3">
            <button type="button" class="btn btn-primary btn-block" onclick="JobModule.submitJobApplication('${job.id}')">Submit Application</button>
            <a href="register-worker.html" class="btn btn-outline btn-block mt-1">Not Registered Yet? Register as Worker</a>
          </div>
        </div>
      `;
    }
    App.openModal("applyJobModal");
  },

  submitJobApplication(jobId) {
    const job = storage.getJobById(jobId);
    if (!job) return;

    const workerSelectVal = document.getElementById("applyWorkerSelect")?.value;
    const workerInputVal = document.getElementById("applyWorkerIdInput")?.value?.trim();
    const noteVal = document.getElementById("applyNoteInput")?.value?.trim();

    const selectedWorkerId = workerSelectVal || workerInputVal;

    if (!selectedWorkerId) {
      App.showToast("Please select or enter your Worker ID to apply.", "warning");
      return;
    }

    const worker = storage.getWorkerById(selectedWorkerId);
    if (!worker) {
      App.showToast(`Worker with ID "${selectedWorkerId}" not found. Please check your ID or register first.`, "error");
      return;
    }

    const applicationData = {
      jobId: job.id,
      workerId: worker.id,
      workerName: worker.fullName,
      workerPhone: worker.mobile,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      notes: noteVal
    };

    const res = storage.saveApplication(applicationData);
    if (res.success) {
      App.closeModal("applyJobModal");
      App.showToast(`Application submitted successfully for ${job.jobTitle}!`, "success");
    } else {
      App.showToast(res.message, "info");
    }
  }
};
