/* ============================================
   ROI CALCULATOR
============================================= */

document.addEventListener('DOMContentLoaded', function() {
    initCalculator();
});

// Automation efficiency rates by task type
const AUTOMATION_RATES = {
    email: 0.75,      // 75% of email work can be automated
    crm: 0.80,        // 80% of CRM sync work
    hr: 0.65,         // 65% of HR screening
    support: 0.70,    // 70% of customer support
    analytics: 0.85   // 85% of analytics/reporting
};

// Average implementation costs by task type
const IMPLEMENTATION_COSTS = {
    email: 80000,
    crm: 100000,
    hr: 150000,
    support: 120000,
    analytics: 90000
};

function initCalculator() {
    const calculateBtn = document.getElementById('calculate-btn');
    const hoursInput = document.getElementById('hours-per-week');
    const rateInput = document.getElementById('hourly-rate');
    const taskTypeSelect = document.getElementById('task-type');

    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateROI);
    }

    // Real-time calculation on input change
    [hoursInput, rateInput, taskTypeSelect].forEach(input => {
        if (input) {
            input.addEventListener('input', debounceCalculate);
            input.addEventListener('change', debounceCalculate);
        }
    });
}

// Debounced calculation for real-time updates
const debounceCalculate = debounce(function() {
    const hoursInput = document.getElementById('hours-per-week');
    const rateInput = document.getElementById('hourly-rate');

    if (hoursInput.value && rateInput.value) {
        calculateROI();
    }
}, 300);

function calculateROI() {
    // Get input values
    const hoursPerWeek = parseFloat(document.getElementById('hours-per-week').value) || 0;
    const hourlyRate = parseFloat(document.getElementById('hourly-rate').value) || 0;
    const taskType = document.getElementById('task-type').value;

    // Validate inputs
    if (hoursPerWeek <= 0 || hourlyRate <= 0) {
        showToast('Пожалуйста, заполните все поля', 'error');
        return;
    }

    // Calculate metrics
    const automationRate = AUTOMATION_RATES[taskType] || 0.70;
    const implementationCost = IMPLEMENTATION_COSTS[taskType] || 100000;

    // Hours saved per month (4.33 weeks per month)
    const hoursPerMonth = hoursPerWeek * 4.33;
    const hoursSavedPerMonth = hoursPerMonth * automationRate;

    // Monthly savings in rubles
    const monthlySavings = hoursSavedPerMonth * hourlyRate;

    // Monthly loss (what they're currently spending on manual work)
    const monthlyLoss = hoursPerMonth * hourlyRate;

    // Payback period in weeks
    const weeklyLoss = hoursPerWeek * hourlyRate;
    const paybackWeeks = Math.ceil(implementationCost / (weeklyLoss * automationRate));

    // Annual ROI
    const annualSavings = monthlySavings * 12;
    const roi = ((annualSavings - implementationCost) / implementationCost) * 100;

    // Display results
    displayResults({
        monthlyLoss: monthlyLoss,
        timeSaved: Math.round(hoursSavedPerMonth),
        paybackWeeks: paybackWeeks,
        monthlySavings: monthlySavings,
        annualROI: roi
    });

    // Track event
    if (typeof trackEvent === 'function') {
        trackEvent('calculator_calculate', 'calculator', taskType);
    }
}

function displayResults(data) {
    const resultsContainer = document.getElementById('calculator-results');
    const monthlyLossEl = document.getElementById('monthly-loss');
    const timeSavedEl = document.getElementById('time-saved');
    const paybackWeeksEl = document.getElementById('payback-weeks');

    if (resultsContainer) {
        resultsContainer.style.display = 'block';

        // Animate the reveal
        resultsContainer.classList.add('animate-fadeInUp');

        // Update values with animation
        if (monthlyLossEl) {
            animateValue(monthlyLossEl, 0, data.monthlyLoss, 1000, formatCurrency);
        }

        if (timeSavedEl) {
            animateValue(timeSavedEl, 0, data.timeSaved, 800, (val) => Math.round(val).toString());
        }

        if (paybackWeeksEl) {
            animateValue(paybackWeeksEl, 0, data.paybackWeeks, 600, (val) => Math.round(val).toString());
        }

        // Scroll to results
        setTimeout(() => {
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
}

function animateValue(element, start, end, duration, formatter) {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * easeOut;

        element.textContent = formatter(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function formatCurrency(value) {
    const rounded = Math.round(value);

    if (rounded >= 1000000) {
        return (rounded / 1000000).toFixed(1) + ' млн ₽';
    }

    if (rounded >= 1000) {
        return Math.round(rounded / 1000) + ' тыс. ₽';
    }

    return rounded.toLocaleString('ru-RU') + ' ₽';
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for global use
window.calculateROI = calculateROI;
