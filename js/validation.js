/**
 * BUILDPRO CONSTRUCTIONS - Form Validation Utility
 */

const Validation = {
  validatePhone(phone) {
    if (!phone) return false;
    const clean = phone.replace(/[^0-9]/g, "");
    return clean.length >= 10 && clean.length <= 12;
  },

  validateEmail(email) {
    if (!email) return true; // Optional field in some forms
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  },

  validateRequired(val) {
    if (val === null || val === undefined) return false;
    if (typeof val === "string") return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    return true;
  },

  validateNumber(val, min = 0, max = Infinity) {
    const num = Number(val);
    if (isNaN(num)) return false;
    return num >= min && num <= max;
  },

  showFieldError(inputElem, message) {
    if (!inputElem) return;
    inputElem.classList.add("input-error");
    let errorElem = inputElem.parentElement.querySelector(".field-error-msg");
    if (!errorElem) {
      errorElem = document.createElement("span");
      errorElem.className = "field-error-msg";
      inputElem.parentElement.appendChild(errorElem);
    }
    errorElem.textContent = message;
    errorElem.style.display = "block";
  },

  clearFieldError(inputElem) {
    if (!inputElem) return;
    inputElem.classList.remove("input-error");
    const errorElem = inputElem.parentElement.querySelector(".field-error-msg");
    if (errorElem) {
      errorElem.style.display = "none";
      errorElem.textContent = "";
    }
  },

  validateStep(stepNumber, containerElem) {
    let isValid = true;
    if (!containerElem) return true;

    // Clear previous errors in container
    containerElem.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
    containerElem.querySelectorAll(".field-error-msg").forEach(el => el.style.display = "none");

    const requiredFields = containerElem.querySelectorAll("[data-required='true']");
    requiredFields.forEach(field => {
      const val = field.value ? field.value.trim() : "";
      if (!val) {
        isValid = false;
        Validation.showFieldError(field, field.getAttribute("data-error-msg") || "This field is required");
      }
    });

    // Specific phone validations
    const phoneFields = containerElem.querySelectorAll("[type='tel']");
    phoneFields.forEach(field => {
      if (field.value && !Validation.validatePhone(field.value)) {
        isValid = false;
        Validation.showFieldError(field, "Please enter a valid 10-digit mobile number");
      }
    });

    // Specific email validations
    const emailFields = containerElem.querySelectorAll("[type='email']");
    emailFields.forEach(field => {
      if (field.value && !Validation.validateEmail(field.value)) {
        isValid = false;
        Validation.showFieldError(field, "Please enter a valid email address");
      }
    });

    return isValid;
  }
};
