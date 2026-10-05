/**
 * BUILDPRO CONSTRUCTIONS - Worker Logic Module
 * Handles worker multi-step registration wizard, worker searching/filtering, worker cards, and profile page.
 */

const WorkerModule = {
  currentStep: 1,
  totalSteps: 7,
  tempWorkerData: {},
  uploadedDocs: [],
  photoDataUrl: null,

  initRegistration() {
    const regForm = document.getElementById("workerRegistrationForm");
    if (!regForm) return;

    this.populateCategoryDropdown("regCategory");
    this.setupMultiStepEvents();
    this.setupCategorySubcategoryLink("regCategory", "regSubcategory");
    this.setupFilePreviewHandlers();
  },

  populateCategoryDropdown(selectId, defaultSelected = "") {
    const selectElem = document.getElementById(selectId);
    if (!selectElem) return;

    const categories = storage.getCategories();
    selectElem.innerHTML = `<option value="">Select Main Category</option>`;
    categories.forEach(cat => {
      const selected = cat.name === defaultSelected ? "selected" : "";
      selectElem.innerHTML += `<option value="${cat.name}" ${selected}>${cat.icon} ${cat.name}</option>`;
    });
  },

  setupCategorySubcategoryLink(catSelectId, subcatSelectId) {
    const catSelect = document.getElementById(catSelectId);
    const subcatSelect = document.getElementById(subcatSelectId);

    if (!catSelect || !subcatSelect) return;

    catSelect.addEventListener("change", (e) => {
      const selectedCat = e.target.value;
      const categories = storage.getCategories();
      const catObj = categories.find(c => c.name === selectedCat);

      subcatSelect.innerHTML = `<option value="">Select Trade / Subcategory</option>`;
      if (catObj && catObj.subcategories) {
        catObj.subcategories.forEach(sub => {
          subcatSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
        });
      }
    });
  },

  setupMultiStepEvents() {
    const nextBtn = document.getElementById("nextStepBtn");
    const prevBtn = document.getElementById("prevStepBtn");
    const submitBtn = document.getElementById("submitWorkerBtn");

    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.nextStep());
    }
    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.prevStep());
    }
    if (submitBtn) {
      submitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.submitRegistration();
      });
    }

    // Step indicators clickable if step visited
    document.querySelectorAll(".step-indicator-item").forEach(item => {
      item.addEventListener("click", () => {
        const stepNum = parseInt(item.getAttribute("data-step"));
        if (stepNum < this.currentStep) {
          this.goToStep(stepNum);
        }
      });
    });
  },

  goToStep(stepNum) {
    const currentContainer = document.getElementById(`stepContainer${this.currentStep}`);
    if (currentContainer) currentContainer.style.display = "none";

    this.currentStep = stepNum;
    const targetContainer = document.getElementById(`stepContainer${this.currentStep}`);
    if (targetContainer) targetContainer.style.display = "block";

    this.updateStepUI();
    if (this.currentStep === 7) {
      this.generateConfirmationSummary();
    }
  },

  nextStep() {
    const currentContainer = document.getElementById(`stepContainer${this.currentStep}`);
    // Validate current step
    const isValid = Validation.validateStep(this.currentStep, currentContainer);
    if (!isValid) {
      App.showToast("Please fill in all required fields correctly before proceeding.", "warning");
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.goToStep(this.currentStep + 1);
    }
  },

  prevStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  },

  updateStepUI() {
    // Update step numbers text
    const stepCounter = document.getElementById("stepProgressText");
    if (stepCounter) {
      stepCounter.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;
    }

    // Update progress bar width
    const progressBar = document.getElementById("stepProgressBarFill");
    if (progressBar) {
      const percentage = (this.currentStep / this.totalSteps) * 100;
      progressBar.style.width = `${percentage}%`;
    }

    // Update step indicator nodes
    document.querySelectorAll(".step-indicator-item").forEach(item => {
      const stepNum = parseInt(item.getAttribute("data-step"));
      item.classList.remove("active", "completed");
      if (stepNum === this.currentStep) {
        item.classList.add("active");
      } else if (stepNum < this.currentStep) {
        item.classList.add("completed");
      }
    });

    // Update button visibility
    const prevBtn = document.getElementById("prevStepBtn");
    const nextBtn = document.getElementById("nextStepBtn");
    const submitBtn = document.getElementById("submitWorkerBtn");

    if (prevBtn) prevBtn.style.display = this.currentStep === 1 ? "none" : "inline-flex";
    if (nextBtn) nextBtn.style.display = this.currentStep === this.totalSteps ? "none" : "inline-flex";
    if (submitBtn) submitBtn.style.display = this.currentStep === this.totalSteps ? "inline-flex" : "none";

    window.scrollTo({ top: 100, behavior: "smooth" });
  },

  setupFilePreviewHandlers() {
    const photoInput = document.getElementById("regPhotoInput");
    const photoPreview = document.getElementById("regPhotoPreview");

    if (photoInput && photoPreview) {
      photoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.photoDataUrl = event.target.result;
            photoPreview.src = this.photoDataUrl;
            photoPreview.style.display = "block";
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Documents upload simulation
    const docInput = document.getElementById("regDocumentInput");
    const docList = document.getElementById("uploadedDocsList");

    if (docInput && docList) {
      docInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);
        const docTypeSelect = document.getElementById("docTypeSelect");
        const docType = docTypeSelect ? docTypeSelect.value : "Other Document";

        files.forEach(file => {
          this.uploadedDocs.push({
            type: docType,
            name: file.name,
            size: (file.size / 1024).toFixed(1) + " KB",
            date: new Date().toISOString().split("T")[0]
          });
        });

        this.renderUploadedDocs();
      });
    }
  },

  renderUploadedDocs() {
    const docList = document.getElementById("uploadedDocsList");
    if (!docList) return;

    if (this.uploadedDocs.length === 0) {
      docList.innerHTML = `<p class="text-muted text-sm">No documents attached yet.</p>`;
      return;
    }

    docList.innerHTML = this.uploadedDocs.map((doc, idx) => `
      <div class="doc-item-preview">
        <span class="doc-icon">📄</span>
        <div class="doc-info">
          <strong>${doc.type}</strong>
          <span class="text-xs text-muted">${doc.name} (${doc.size})</span>
        </div>
        <button type="button" class="btn-remove-doc" onclick="WorkerModule.removeDoc(${idx})">&times;</button>
      </div>
    `).join("");
  },

  removeDoc(idx) {
    this.uploadedDocs.splice(idx, 1);
    this.renderUploadedDocs();
  },

  generateConfirmationSummary() {
    const container = document.getElementById("confirmationSummaryContainer");
    if (!container) return;

    // Collect values from form
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : "";
    };

    const getCheckedArray = (name) => {
      const checkboxes = document.querySelectorAll(`input[name='${name}']:checked`);
      return Array.from(checkboxes).map(c => c.value);
    };

    const fullName = getVal("regFullName");
    const mobile = getVal("regMobile");
    const whatsapp = getVal("regWhatsApp") || mobile;
    const email = getVal("regEmail") || "Not provided";
    const age = getVal("regAge");
    const gender = getVal("regGender");
    const district = getVal("regDistrict");
    const state = getVal("regState");
    const category = getVal("regCategory");
    const subcategory = getVal("regSubcategory");
    const exp = getVal("regExperience");
    const skillLevel = getVal("regSkillLevel");
    const skillsList = getCheckedArray("regSkills");
    const currentLocation = getVal("regCurrentLocation");
    const preferredLocation = getVal("regPreferredLocation");
    const willingToRelocate = document.getElementById("regRelocateYes")?.checked ? "Yes" : "No";
    const availability = getVal("regAvailability");
    const employmentPreference = getVal("regEmploymentPref");
    const expectedWage = getVal("regExpectedWage");
    const expectedMonthly = getVal("regExpectedMonthly");
    const prevCompany = getVal("regPrevCompany");
    const prevProject = getVal("regPrevProject");
    const workDescription = getVal("regWorkDescription");

    container.innerHTML = `
      <div class="summary-card">
        <div class="summary-header">
          <img src="${this.photoDataUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'}" class="summary-photo" alt="Photo" />
          <div>
            <h3 class="summary-name">${fullName || "Worker Name"}</h3>
            <span class="badge badge-warning">${category} • ${subcategory}</span>
            <span class="badge badge-info">${skillLevel}</span>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Contact Details</span>
            <span class="summary-value">📞 ${mobile} | 💬 WhatsApp: ${whatsapp}</span>
            <span class="summary-value">✉️ ${email}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Personal Info</span>
            <span class="summary-value">Age: ${age} Yrs | Gender: ${gender}</span>
            <span class="summary-value">Location: ${district}, ${state}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Experience & Wage</span>
            <span class="summary-value">Experience: ${exp} Years</span>
            <span class="summary-value">Expected Wage: ₹${expectedWage || 'N/A'}/day (${employmentPreference})</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Availability</span>
            <span class="summary-value">Status: ${availability}</span>
            <span class="summary-value">Relocate: ${willingToRelocate} | Preferred: ${preferredLocation || 'Any'}</span>
          </div>
        </div>

        <div class="summary-section">
          <strong>Selected Skills:</strong>
          <div class="tag-cloud mt-1">
            ${skillsList.length > 0 ? skillsList.map(s => `<span class="tag">${s}</span>`).join("") : `<span class="text-muted text-sm">No extra skills checked</span>`}
          </div>
        </div>

        <div class="summary-section">
          <strong>Previous Experience:</strong>
          <p class="text-sm mt-1">${prevCompany ? `${prevCompany} (${prevProject})` : "Not specified"}</p>
          <p class="text-xs text-muted">${workDescription || "No detailed description provided."}</p>
        </div>

        <div class="summary-section">
          <strong>Uploaded Documents Metadata:</strong>
          <p class="text-xs text-muted">${this.uploadedDocs.length > 0 ? `${this.uploadedDocs.length} files attached (${this.uploadedDocs.map(d => d.name).join(", ")})` : "No documents attached."}</p>
        </div>
      </div>
    `;
  },

  submitRegistration() {
    const getVal = (id) => document.getElementById(id)?.value?.trim() || "";
    const getCheckedArray = (name) => Array.from(document.querySelectorAll(`input[name='${name}']:checked`)).map(c => c.value);

    const consentCheck = document.getElementById("regConsentCheck");
    if (consentCheck && !consentCheck.checked) {
      App.showToast("Please accept the terms and privacy consent checkbox to proceed.", "warning");
      return;
    }

    const workerData = {
      fullName: getVal("regFullName"),
      photo: this.photoDataUrl || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80",
      mobile: getVal("regMobile"),
      whatsapp: getVal("regWhatsApp") || getVal("regMobile"),
      email: getVal("regEmail"),
      age: parseInt(getVal("regAge")) || 25,
      gender: getVal("regGender"),
      address: getVal("regAddress"),
      district: getVal("regDistrict"),
      state: getVal("regState"),
      pinCode: getVal("regPinCode"),
      category: getVal("regCategory"),
      subcategory: getVal("regSubcategory"),
      experienceYears: parseInt(getVal("regExperience")) || 1,
      skillLevel: getVal("regSkillLevel"),
      additionalSkills: getCheckedArray("regSkills"),
      currentLocation: getVal("regCurrentLocation"),
      preferredLocation: getVal("regPreferredLocation"),
      willingToRelocate: document.getElementById("regRelocateYes")?.checked ? "Yes" : "No",
      availability: getVal("regAvailability"),
      employmentPreference: getVal("regEmploymentPref"),
      expectedDailyWage: parseInt(getVal("regExpectedWage")) || 800,
      expectedMonthlySalary: parseInt(getVal("regExpectedMonthly")) || 22000,
      negotiable: document.getElementById("regNegotiable")?.checked || false,
      previousCompany: getVal("regPrevCompany"),
      previousProject: getVal("regPrevProject"),
      workDescription: getVal("regWorkDescription"),
      documents: this.uploadedDocs,
      status: "Pending Verification"
    };

    const savedWorker = storage.saveWorker(workerData);

    // Show Registration Success Modal
    const modalContent = document.getElementById("regSuccessModalContent");
    if (modalContent) {
      modalContent.innerHTML = `
        <div class="text-center">
          <div class="success-icon-badge">🎉</div>
          <h2>Registration Successful!</h2>
          <p class="text-muted mt-1">Thank you for registering on BUILDPRO CONSTRUCTIONS recruitment portal.</p>
          
          <div class="worker-id-card">
            <span class="text-xs text-muted">YOUR UNIQUE WORKER ID</span>
            <h1 class="worker-id-display">${savedWorker.id}</h1>
            <p class="text-xs text-muted mt-1">Please save this ID to check application statuses or update your profile.</p>
          </div>

          <div class="modal-action-btns">
            <a href="worker-profile.html?id=${savedWorker.id}" class="btn btn-primary">View Profile</a>
            <a href="jobs.html" class="btn btn-outline">Find Jobs Now</a>
          </div>
        </div>
      `;
    }

    App.openModal("regSuccessModal");
  },

  // --- FIND WORKERS PAGE LOGIC ---
  initFindWorkers() {
    const gridContainer = document.getElementById("workersGridContainer");
    if (!gridContainer) return;

    this.populateCategoryDropdown("filterCategory");
    this.setupCategorySubcategoryLink("filterCategory", "filterSubcategory");
    this.setupFilterEvents();
    
    // Check URL query parameters (e.g. ?category=Masonry)
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get("category");
    if (catParam) {
      const filterCatElem = document.getElementById("filterCategory");
      if (filterCatElem) {
        filterCatElem.value = catParam;
        filterCatElem.dispatchEvent(new Event("change"));
      }
    }

    this.renderWorkersList();
  },

  setupFilterEvents() {
    const applyBtn = document.getElementById("applyFiltersBtn");
    const resetBtn = document.getElementById("resetFiltersBtn");
    const searchInput = document.getElementById("workerSearchInput");
    const sortSelect = document.getElementById("workerSortSelect");

    if (applyBtn) applyBtn.addEventListener("click", () => this.renderWorkersList());
    if (resetBtn) resetBtn.addEventListener("click", () => this.resetFilters());
    if (searchInput) searchInput.addEventListener("input", () => this.renderWorkersList());
    if (sortSelect) sortSelect.addEventListener("change", () => this.renderWorkersList());
  },

  resetFilters() {
    document.querySelectorAll(".filter-input").forEach(input => {
      if (input.type === "checkbox" || input.type === "radio") {
        input.checked = false;
      } else {
        input.value = "";
      }
    });
    this.renderWorkersList();
    App.showToast("Filters reset", "info");
  },

  renderWorkersList() {
    const gridContainer = document.getElementById("workersGridContainer");
    const counterElem = document.getElementById("workersCountDisplay");
    if (!gridContainer) return;

    let workers = storage.getWorkers();

    // Get filter values
    const search = document.getElementById("workerSearchInput")?.value?.toLowerCase() || "";
    const category = document.getElementById("filterCategory")?.value || "";
    const subcategory = document.getElementById("filterSubcategory")?.value || "";
    const experience = document.getElementById("filterExperience")?.value || "";
    const skillLevel = document.getElementById("filterSkillLevel")?.value || "";
    const location = document.getElementById("filterLocation")?.value?.toLowerCase() || "";
    const availability = document.getElementById("filterAvailability")?.value || "";
    const minWage = parseInt(document.getElementById("filterMinWage")?.value) || 0;
    const maxWage = parseInt(document.getElementById("filterMaxWage")?.value) || Infinity;
    const empType = document.getElementById("filterEmpType")?.value || "";

    // Filtering
    workers = workers.filter(w => {
      if (search) {
        const matchesName = w.fullName.toLowerCase().includes(search);
        const matchesTrade = (w.category + " " + w.subcategory).toLowerCase().includes(search);
        const matchesLocation = (w.currentLocation + " " + w.district + " " + w.state).toLowerCase().includes(search);
        const matchesSkills = w.additionalSkills && w.additionalSkills.some(s => s.toLowerCase().includes(search));
        if (!matchesName && !matchesTrade && !matchesLocation && !matchesSkills) return false;
      }

      if (category && w.category !== category) return false;
      if (subcategory && w.subcategory !== subcategory) return false;
      if (skillLevel && w.skillLevel !== skillLevel) return false;
      if (availability && w.availability !== availability) return false;
      if (empType && w.employmentPreference !== empType) return false;

      if (location && !w.currentLocation.toLowerCase().includes(location) && !w.district.toLowerCase().includes(location)) {
        return false;
      }

      if (w.expectedDailyWage < minWage || w.expectedDailyWage > maxWage) return false;

      if (experience) {
        if (experience === "0-1" && w.experienceYears > 1) return false;
        if (experience === "2-5" && (w.experienceYears < 2 || w.experienceYears > 5)) return false;
        if (experience === "5-10" && (w.experienceYears < 5 || w.experienceYears > 10)) return false;
        if (experience === "10+" && w.experienceYears < 10) return false;
      }

      return true;
    });

    // Sorting
    const sortVal = document.getElementById("workerSortSelect")?.value || "newest";
    if (sortVal === "exp-desc") {
      workers.sort((a, b) => b.experienceYears - a.experienceYears);
    } else if (sortVal === "wage-asc") {
      workers.sort((a, b) => a.expectedDailyWage - b.expectedDailyWage);
    } else if (sortVal === "wage-desc") {
      workers.sort((a, b) => b.expectedDailyWage - a.expectedDailyWage);
    } else {
      // Newest default
      workers.sort((a, b) => new Date(b.registeredDate || 0) - new Date(a.registeredDate || 0));
    }

    if (counterElem) {
      counterElem.textContent = `${workers.length} Workers Found`;
    }

    if (workers.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-state-box">
          <span class="empty-icon">👷</span>
          <h3>No Workers Found</h3>
          <p class="text-muted">No construction workers matched your active search filters. Try adjusting or resetting your criteria.</p>
          <button class="btn btn-outline mt-2" onclick="WorkerModule.resetFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = workers.map(w => this.renderWorkerCardHTML(w)).join("");
  },

  renderWorkerCardHTML(worker) {
    const isVerified = worker.status === "Verified";
    const waLink = App.buildWhatsAppLink(worker.whatsapp || worker.mobile, `Hello ${worker.fullName}, we saw your profile on BUILDPRO CONSTRUCTIONS recruitment portal for ${worker.subcategory} and would like to discuss a job opportunity.`);

    return `
      <div class="worker-card">
        <div class="worker-card-header">
          <div class="worker-avatar-wrapper">
            <img src="${worker.photo}" alt="${worker.fullName}" class="worker-avatar" onerror="this.src='https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'" />
            ${isVerified ? `<span class="verified-badge-pill" title="Verified Worker">✓ Verified</span>` : ''}
          </div>
          <div class="worker-title-info">
            <h3 class="worker-name">${worker.fullName}</h3>
            <div class="worker-trade-badge">🔨 ${worker.subcategory || worker.category}</div>
            <span class="badge badge-skill">${worker.skillLevel}</span>
          </div>
        </div>

        <div class="worker-card-body">
          <div class="worker-meta-row">
            <span>⌛ <strong>Exp:</strong> ${worker.experienceYears} Years</span>
            <span>📍 <strong>Loc:</strong> ${worker.district || worker.currentLocation}</span>
          </div>
          <div class="worker-meta-row">
            <span>🟢 <strong>Status:</strong> ${worker.availability}</span>
            <span>💰 <strong>Wage:</strong> ₹${worker.expectedDailyWage}/day</span>
          </div>

          <div class="worker-skills-tags">
            ${(worker.additionalSkills || []).slice(0, 4).map(s => `<span class="skill-tag">${s}</span>`).join("")}
          </div>
        </div>

        <div class="worker-card-footer">
          <a href="${waLink}" target="_blank" class="btn btn-whatsapp btn-sm">💬 WhatsApp</a>
          <button class="btn btn-call btn-sm" onclick="WorkerModule.openContactModal('${worker.id}')">📞 Call</button>
          <a href="worker-profile.html?id=${worker.id}" class="btn btn-outline btn-sm">📄 View Profile</a>
        </div>
      </div>
    `;
  },

  openContactModal(workerId) {
    const worker = storage.getWorkerById(workerId);
    if (!worker) return;

    const modalBody = document.getElementById("contactModalContent");
    if (modalBody) {
      const waLink = App.buildWhatsAppLink(worker.whatsapp || worker.mobile, `Hello ${worker.fullName}, inquiring regarding hiring on BUILDPRO portal.`);
      modalBody.innerHTML = `
        <div class="contact-modal-body text-center">
          <img src="${worker.photo}" class="avatar-lg mb-2" alt="${worker.fullName}" />
          <h2>Contact ${worker.fullName}</h2>
          <span class="badge badge-warning mb-2">${worker.category} • ${worker.subcategory}</span>
          
          <div class="phone-display-box mt-2">
            <span class="text-xs text-muted">DIRECT PHONE NUMBER</span>
            <h3 class="phone-number-large"><a href="tel:${worker.mobile}">+91 ${worker.mobile}</a></h3>
          </div>

          <div class="modal-action-btns mt-3">
            <a href="tel:${worker.mobile}" class="btn btn-call btn-block">📞 Call Now (+91 ${worker.mobile})</a>
            <a href="${waLink}" target="_blank" class="btn btn-whatsapp btn-block">💬 Message on WhatsApp</a>
          </div>

          <p class="privacy-note-sm mt-3">🔒 Your privacy is important. Contact details are used strictly for recruitment communications.</p>
        </div>
      `;
    }
    App.openModal("contactWorkerModal");
  },

  // --- WORKER PROFILE PAGE LOGIC ---
  initWorkerProfilePage() {
    const profileContainer = document.getElementById("workerProfileMainContainer");
    if (!profileContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const workerId = urlParams.get("id");

    if (!workerId) {
      profileContainer.innerHTML = `<div class="empty-state-box"><h3>Worker ID missing</h3><a href="workers.html" class="btn btn-primary mt-2">Find Workers</a></div>`;
      return;
    }

    const worker = storage.getWorkerById(workerId);
    if (!worker) {
      profileContainer.innerHTML = `<div class="empty-state-box"><h3>Worker Not Found</h3><p>No worker matches ID: ${workerId}</p><a href="workers.html" class="btn btn-primary mt-2">Back to Workers</a></div>`;
      return;
    }

    this.renderWorkerProfilePage(worker);
  },

  renderWorkerProfilePage(worker) {
    const profileContainer = document.getElementById("workerProfileMainContainer");
    if (!profileContainer) return;

    const isVerified = worker.status === "Verified";
    const waLink = App.buildWhatsAppLink(worker.whatsapp || worker.mobile, `Hello ${worker.fullName}, contacting you regarding construction hiring for your trade (${worker.subcategory}) from BUILDPRO CONSTRUCTIONS.`);

    // Fetch worker applications history
    const allApps = storage.getApplications().filter(a => a.workerId === worker.id);

    profileContainer.innerHTML = `
      <div class="profile-page-grid">
        <!-- Sidebar Summary Card -->
        <div class="profile-sidebar-card">
          <div class="profile-avatar-container">
            <img src="${worker.photo}" alt="${worker.fullName}" class="profile-avatar-xl" onerror="this.src='https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80'" />
            <div class="mt-2">
              <h2 class="profile-name-title">${worker.fullName}</h2>
              <span class="profile-worker-id">${worker.id}</span>
            </div>
            
            <div class="mt-2">
              ${isVerified ? `<span class="badge badge-success">✓ Verified Worker</span>` : `<span class="badge badge-warning">🟡 ${worker.status}</span>`}
              <span class="badge badge-primary">${worker.skillLevel}</span>
            </div>
          </div>

          <hr class="divider" />

          <div class="profile-contact-actions">
            <a href="${waLink}" target="_blank" class="btn btn-whatsapp btn-block">💬 WhatsApp Message</a>
            <button class="btn btn-call btn-block mt-2" onclick="WorkerModule.openContactModal('${worker.id}')">📞 Direct Call (+91 ${worker.mobile})</button>
          </div>

          <hr class="divider" />

          <div class="profile-quick-stats">
            <div class="quick-stat-item">
              <span class="stat-lbl">Expected Wage</span>
              <span class="stat-val text-primary">₹${worker.expectedDailyWage} / day</span>
            </div>
            <div class="quick-stat-item">
              <span class="stat-lbl">Total Experience</span>
              <span class="stat-val">${worker.experienceYears} Years</span>
            </div>
            <div class="quick-stat-item">
              <span class="stat-lbl">Availability</span>
              <span class="stat-val text-success">${worker.availability}</span>
            </div>
            <div class="quick-stat-item">
              <span class="stat-lbl">Location</span>
              <span class="stat-val">${worker.district}, ${worker.state}</span>
            </div>
          </div>
        </div>

        <!-- Main Details Content -->
        <div class="profile-main-content">
          <div class="profile-section-card">
            <h3 class="section-card-title">🔨 Trade & Skill Details</h3>
            <div class="details-2col-grid mt-2">
              <div><strong>Main Category:</strong> ${worker.category}</div>
              <div><strong>Subcategory / Trade:</strong> ${worker.subcategory}</div>
              <div><strong>Skill Level:</strong> ${worker.skillLevel}</div>
              <div><strong>Employment Preference:</strong> ${worker.employmentPreference}</div>
              <div><strong>Willing to Relocate:</strong> ${worker.willingToRelocate}</div>
              <div><strong>Preferred Work Locations:</strong> ${worker.preferredLocation || 'Any'}</div>
            </div>

            <div class="mt-3">
              <strong>Specific Skills & Expertise:</strong>
              <div class="tag-cloud mt-1">
                ${(worker.additionalSkills || []).map(s => `<span class="tag tag-lg">${s}</span>`).join("")}
              </div>
            </div>
          </div>

          <div class="profile-section-card mt-3">
            <h3 class="section-card-title">💼 Work History & Experience</h3>
            <div class="work-exp-box mt-2">
              <h4>${worker.previousCompany || 'Independent Contractor'}</h4>
              <span class="text-xs text-muted">Project: ${worker.previousProject || 'General Construction'}</span>
              <p class="mt-2 text-sm">${worker.workDescription || 'Experienced construction worker with solid work ethics, safety awareness, and hands-on skill in trade execution.'}</p>
            </div>
          </div>

          <div class="profile-section-card mt-3">
            <h3 class="section-card-title">📑 Verification & Documents Metadata</h3>
            <div class="doc-list-grid mt-2">
              ${(worker.documents && worker.documents.length > 0) ? worker.documents.map(d => `
                <div class="doc-file-card">
                  <span class="doc-file-icon">📄</span>
                  <div>
                    <strong>${d.type || 'Document'}</strong>
                    <span class="text-xs text-muted block">${d.name}</span>
                  </div>
                </div>
              `).join("") : `<p class="text-muted text-sm">Identity & experience documents are verified by admin.</p>`}
            </div>
            <p class="privacy-note-sm mt-3">🔒 Documents are stored securely in backend repository during full verification.</p>
          </div>

          <div class="profile-section-card mt-3">
            <h3 class="section-card-title">📋 Job Applications History (${allApps.length})</h3>
            ${allApps.length > 0 ? `
              <div class="table-responsive mt-2">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Company</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${allApps.map(a => `
                      <tr>
                        <td><strong>${a.jobTitle}</strong></td>
                        <td>${a.companyName}</td>
                        <td>${a.appliedDate}</td>
                        <td><span class="badge badge-app-${a.status.toLowerCase()}">${a.status}</span></td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            ` : `<p class="text-muted text-sm mt-2">No active job applications found for this worker profile yet.</p>`}
          </div>
        </div>
      </div>
    `;
  }
};
