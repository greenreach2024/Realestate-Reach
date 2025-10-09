const stepperDialog = document.getElementById('wishlist-stepper');
const estimatorDialog = document.getElementById('demand-estimator');
const yearSpan = document.getElementById('year');

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

const openDialog = (dialog) => {
  if (!dialog) return;
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
};

document.querySelectorAll('[data-open-stepper]').forEach((button) => {
  button.addEventListener('click', () => openDialog(stepperDialog));
});

document.querySelectorAll('[data-open-estimator]').forEach((button) => {
  button.addEventListener('click', () => openDialog(estimatorDialog));
});

const formStepper = stepperDialog?.querySelector('form');
const nextButton = stepperDialog?.querySelector('[data-next-step]');
const prevButton = stepperDialog?.querySelector('[data-prev-step]');
const steps = stepperDialog ? Array.from(stepperDialog.querySelectorAll('.step')) : [];
const stepIndicators = stepperDialog ? Array.from(stepperDialog.querySelectorAll('.step-indicator li')) : [];
const summary = stepperDialog?.querySelector('.step-summary');
const summaryCopy = stepperDialog?.querySelector('.summary-copy');
let activeStep = 0;

const updateStepper = () => {
  steps.forEach((step, index) => {
    step.hidden = index !== activeStep;
  });
  stepIndicators.forEach((indicator, index) => {
    indicator.classList.toggle('active', index === activeStep);
  });
  if (!nextButton || !prevButton || !summary) return;

  prevButton.disabled = activeStep === 0;
  if (activeStep >= steps.length) {
    steps.forEach((step) => (step.hidden = true));
    summary.hidden = false;
    nextButton.hidden = true;
    prevButton.hidden = true;
  } else {
    summary.hidden = true;
    nextButton.hidden = false;
    prevButton.hidden = false;
    nextButton.textContent = activeStep === steps.length - 1 ? 'Preview' : 'Next';
  }
};

updateStepper();

nextButton?.addEventListener('click', () => {
  const currentStep = steps[activeStep];
  if (!currentStep) return;
  const inputs = Array.from(currentStep.querySelectorAll('input, select'));
  const invalid = inputs.some((input) => input instanceof HTMLInputElement || input instanceof HTMLSelectElement ? !input.checkValidity() : false);
  if (invalid) {
    inputs.forEach((input) => input.reportValidity());
    return;
  }
  if (activeStep === steps.length - 1) {
    if (!formStepper) {
      return;
    }
    const formData = new FormData(formStepper);
    const neighborhoods = formData.get('neighborhoods') || 'your neighborhoods';
    const budget = formData.get('budget') ? `$${Number(formData.get('budget')).toLocaleString()}` : 'your budget';
    const features = formData.get('features') || 'your must-haves';
    const timelineValue = formData.get('timeline');
    const timelineMap = {
      '0-3': '0–3 months',
      '3-6': '3–6 months',
      '6-12': '6–12 months',
    };
    const timeline = timelineValue ? timelineMap[timelineValue] || 'your window' : 'your window';
    if (summaryCopy) {
      summaryCopy.textContent = `Wishlist draft for ${neighborhoods} at ${budget}, focused on ${features}, ready within ${timeline}. Save to compare against matched sellers.`;
    }
    activeStep += 1;
  } else {
    activeStep += 1;
  }
  updateStepper();
});

prevButton?.addEventListener('click', () => {
  if (activeStep > 0) {
    activeStep -= 1;
    updateStepper();
  }
});

stepperDialog?.addEventListener('close', () => {
  activeStep = 0;
  if (summaryCopy) {
    summaryCopy.textContent = '';
  }
  updateStepper();
});

const estimatorForm = estimatorDialog?.querySelector('form');
const estimateButton = estimatorDialog?.querySelector('[data-run-estimate]');
const estimatorResult = estimatorDialog?.querySelector('.estimator-result');

estimateButton?.addEventListener('click', () => {
  const inputs = estimatorDialog ? Array.from(estimatorDialog.querySelectorAll('input, select')) : [];
  const invalid = inputs.some((input) => !input.checkValidity());
  if (invalid) {
    inputs.forEach((input) => input.reportValidity());
    return;
  }
  if (!estimatorForm) {
    return;
  }
  const formData = new FormData(estimatorForm);
  const price = Number(formData.get('price')) || 0;
  const buyers = Math.max(6, Math.round((1500000 - Math.abs(price - 900000)) / 45000));
  const matchScore = Math.min(99, Math.max(45, Math.round(90 - Math.abs(price - 900000) / 30000)));
  const timelineValue = formData.get('sellTimeline');
  const timelineMap = {
    '0-3': '0–3 months',
    '3-6': '3–6 months',
    '6-12': '6–12 months',
  };
  const timeline = timelineValue ? timelineMap[timelineValue] || 'your selected window' : 'your selected window';

  estimatorResult.innerHTML = `
    <div class="estimate-card">
      <p class="estimate-score">Match score: <strong>${matchScore}</strong></p>
      <p>Qualified buyers ready in your window: <strong>${buyers}</strong></p>
      <p>Top wishlists flagged for outreach within <strong>${timeline}</strong>.</p>
      <p class="upgrade-hint">Upgrade to message buyers and unlock intro tracking.</p>
    </div>
  `;
});

estimatorDialog?.addEventListener('close', () => {
  if (estimatorResult) {
    estimatorResult.textContent = '';
  }
});
