/* ============================================
   A/B TESTING MODULE
============================================= */

// A/B Test Configuration
const AB_TESTS = {
    // Test 1: Hero headline variants
    'hero-headline': {
        variants: ['control', 'outcome', 'pain'],
        weights: [0.34, 0.33, 0.33],
        elements: {
            'control': '.hero__variant-a',
            'outcome': '.hero__variant-b',
            'pain': '.hero__variant-c'
        }
    },

    // Test 2: CTA button text
    'cta-text': {
        variants: ['roi-calc', 'free-audit', 'get-started', 'save-time', 'automate-now'],
        weights: [0.2, 0.2, 0.2, 0.2, 0.2],
        texts: {
            'roi-calc': 'Получить ROI-расчёт',
            'free-audit': 'Бесплатный аудит',
            'get-started': 'Начать автоматизацию',
            'save-time': 'Экономить 15+ часов',
            'automate-now': 'Автоматизировать сейчас'
        }
    },

    // Test 3: Form fields count
    'form-fields': {
        variants: ['minimal', 'standard', 'detailed'],
        weights: [0.34, 0.33, 0.33],
        // minimal: name + contact only
        // standard: name + contact + task
        // detailed: name + contact + task + company + budget
    },

    // Test 4: Social proof placement
    'social-proof': {
        variants: ['hero-position', 'after-problems', 'with-metrics'],
        weights: [0.34, 0.33, 0.33]
    },

    // Test 5: Calculator presence
    'calculator': {
        variants: ['with-calculator', 'without-calculator'],
        weights: [0.7, 0.3]
    },

    // Test 6: Pricing visibility
    'pricing': {
        variants: ['with-prices', 'request-quote', 'starting-from'],
        weights: [0.5, 0.25, 0.25]
    },

    // Test 7: Case study format
    'case-format': {
        variants: ['text', 'video'],
        weights: [0.5, 0.5]
    },

    // Test 8: Exit intent popup
    'exit-intent': {
        variants: ['no-popup', 'discount-popup', 'lead-magnet-popup'],
        weights: [0.34, 0.33, 0.33]
    },

    // Test 9: FAQ presence
    'faq': {
        variants: ['with-faq', 'without-faq'],
        weights: [0.7, 0.3]
    },

    // Test 10: Guarantees section
    'guarantees': {
        variants: ['with-guarantees', 'without-guarantees'],
        weights: [0.6, 0.4]
    },

    // Test 11: Chat widget
    'chat-widget': {
        variants: ['no-chat', 'telegram-widget', 'intercom-style'],
        weights: [0.34, 0.33, 0.33]
    }
};

// Storage key for user's test assignments
const STORAGE_KEY = 'ab_test_assignments';

// Initialize A/B testing
document.addEventListener('DOMContentLoaded', function() {
    initABTesting();
});

function initABTesting() {
    const assignments = getOrCreateAssignments();

    // Apply each test variant
    Object.keys(assignments).forEach(testName => {
        const variant = assignments[testName];
        applyVariant(testName, variant);
    });

    // Track test assignments
    trackAssignments(assignments);

    // Initialize exit intent if assigned
    if (assignments['exit-intent'] !== 'no-popup') {
        initExitIntent(assignments['exit-intent']);
    }

    // Initialize chat widget if assigned
    if (assignments['chat-widget'] !== 'no-chat') {
        initChatWidget(assignments['chat-widget']);
    }
}

// Get existing assignments or create new ones
function getOrCreateAssignments() {
    let assignments = localStorage.getItem(STORAGE_KEY);

    if (assignments) {
        return JSON.parse(assignments);
    }

    // Create new assignments
    assignments = {};
    Object.keys(AB_TESTS).forEach(testName => {
        assignments[testName] = selectVariant(AB_TESTS[testName]);
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    return assignments;
}

// Select variant based on weights
function selectVariant(test) {
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < test.variants.length; i++) {
        cumulative += test.weights[i];
        if (random < cumulative) {
            return test.variants[i];
        }
    }

    return test.variants[test.variants.length - 1];
}

// Apply variant to the page
function applyVariant(testName, variant) {
    const test = AB_TESTS[testName];

    switch (testName) {
        case 'hero-headline':
            applyHeroVariant(variant, test);
            break;

        case 'cta-text':
            applyCTAVariant(variant, test);
            break;

        case 'form-fields':
            applyFormFieldsVariant(variant);
            break;

        case 'social-proof':
            applySocialProofVariant(variant);
            break;

        case 'calculator':
            applyCalculatorVariant(variant);
            break;

        case 'pricing':
            applyPricingVariant(variant);
            break;

        case 'case-format':
            applyCaseFormatVariant(variant);
            break;

        case 'faq':
            applyFAQVariant(variant);
            break;

        case 'guarantees':
            applyGuaranteesVariant(variant);
            break;
    }

    // Add data attribute for tracking
    document.body.setAttribute(`data-ab-${testName}`, variant);
}

// Hero headline variant
function applyHeroVariant(variant, test) {
    if (test.elements) {
        Object.keys(test.elements).forEach(v => {
            const el = document.querySelector(test.elements[v]);
            if (el) {
                el.style.display = v === variant ? 'block' : 'none';
            }
        });
    }
}

// CTA text variant
function applyCTAVariant(variant, test) {
    const ctaButtons = document.querySelectorAll('[data-ab-test="cta-text"]');
    const text = test.texts[variant];

    ctaButtons.forEach(btn => {
        if (text) {
            btn.textContent = text;
        }
    });
}

// Form fields variant
function applyFormFieldsVariant(variant) {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const taskField = form.querySelector('.form-group:has(#task)');

    switch (variant) {
        case 'minimal':
            if (taskField) taskField.style.display = 'none';
            break;

        case 'detailed':
            // Add company and budget fields
            const budgetGroup = document.createElement('div');
            budgetGroup.className = 'form-group';
            budgetGroup.innerHTML = `
                <label for="budget">Примерный бюджет</label>
                <select id="budget" name="budget">
                    <option value="">Выберите диапазон</option>
                    <option value="80-150">80-150 тыс. ₽</option>
                    <option value="150-300">150-300 тыс. ₽</option>
                    <option value="300+">300+ тыс. ₽</option>
                </select>
            `;
            if (taskField) {
                taskField.after(budgetGroup);
            }
            break;
    }
}

// Social proof placement
function applySocialProofVariant(variant) {
    const socialProofElements = document.querySelectorAll('[data-variant]');
    socialProofElements.forEach(el => {
        const elVariant = el.getAttribute('data-variant');
        if (el.closest('.hero__social-proof') || el.closest('.social-proof')) {
            el.style.display = elVariant === variant ? 'block' : 'none';
        }
    });
}

// Calculator presence
function applyCalculatorVariant(variant) {
    const calculator = document.getElementById('calculator');
    if (calculator && variant === 'without-calculator') {
        calculator.style.display = 'none';
    }
}

// Pricing variant
function applyPricingVariant(variant) {
    const pricing = document.getElementById('pricing');
    if (!pricing) return;

    if (variant === 'request-quote') {
        const priceValues = pricing.querySelectorAll('.pricing-card__price-value');
        priceValues.forEach(el => {
            el.textContent = 'По запросу';
        });
    } else if (variant === 'starting-from') {
        const priceValues = pricing.querySelectorAll('.pricing-card__price-value');
        priceValues.forEach((el, i) => {
            if (i === 0) el.textContent = 'от 80 тыс. ₽';
            if (i === 1) el.textContent = 'от 180 тыс. ₽';
        });
    }
}

// Case format variant
function applyCaseFormatVariant(variant) {
    const textCases = document.querySelectorAll('.case__text');
    const videoCases = document.querySelectorAll('.case__video-wrapper');

    textCases.forEach(el => {
        el.style.display = variant === 'text' ? 'block' : 'none';
    });

    videoCases.forEach(el => {
        el.style.display = variant === 'video' ? 'block' : 'none';
    });
}

// FAQ variant
function applyFAQVariant(variant) {
    const faq = document.getElementById('faq');
    if (faq && variant === 'without-faq') {
        faq.style.display = 'none';
    }
}

// Guarantees variant
function applyGuaranteesVariant(variant) {
    const guarantees = document.getElementById('guarantees');
    if (guarantees && variant === 'without-guarantees') {
        guarantees.style.display = 'none';
    }
}

// Exit intent popup
function initExitIntent(variant) {
    let shown = false;

    document.addEventListener('mouseout', function(e) {
        if (shown) return;
        if (e.clientY < 10 && e.relatedTarget === null) {
            shown = true;
            showExitPopup(variant);
        }
    });

    // Also trigger on mobile after 30 seconds of inactivity
    let inactivityTimer;
    const resetTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            if (!shown && window.innerWidth < 768) {
                shown = true;
                showExitPopup(variant);
            }
        }, 30000);
    };

    ['mousemove', 'touchstart', 'scroll'].forEach(event => {
        document.addEventListener(event, resetTimer);
    });
    resetTimer();
}

function showExitPopup(variant) {
    const popup = document.createElement('div');
    popup.className = 'exit-popup';
    popup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

    let content = '';
    if (variant === 'discount-popup') {
        content = `
            <div style="background: white; padding: 40px; border-radius: 16px; max-width: 500px; text-align: center;">
                <h2 style="margin-bottom: 16px; font-size: 24px;">Подождите! 🎁</h2>
                <p style="margin-bottom: 24px; color: #6B7280;">Получите скидку 10% на первый проект</p>
                <input type="email" placeholder="Ваш email" style="width: 100%; padding: 12px; margin-bottom: 16px; border: 1px solid #E5E7EB; border-radius: 8px;">
                <button class="btn btn--primary btn--full" onclick="this.closest('.exit-popup').remove()">Получить скидку</button>
                <p style="margin-top: 16px; font-size: 12px; color: #9CA3AF; cursor: pointer;" onclick="this.closest('.exit-popup').remove()">Нет, спасибо</p>
            </div>
        `;
    } else if (variant === 'lead-magnet-popup') {
        content = `
            <div style="background: white; padding: 40px; border-radius: 16px; max-width: 500px; text-align: center;">
                <h2 style="margin-bottom: 16px; font-size: 24px;">Бесплатный чек-лист 📋</h2>
                <p style="margin-bottom: 24px; color: #6B7280;">15 процессов, которые можно автоматизировать уже сегодня</p>
                <input type="email" placeholder="Ваш email" style="width: 100%; padding: 12px; margin-bottom: 16px; border: 1px solid #E5E7EB; border-radius: 8px;">
                <button class="btn btn--primary btn--full" onclick="this.closest('.exit-popup').remove()">Скачать бесплатно</button>
                <p style="margin-top: 16px; font-size: 12px; color: #9CA3AF; cursor: pointer;" onclick="this.closest('.exit-popup').remove()">Закрыть</p>
            </div>
        `;
    }

    popup.innerHTML = content;
    document.body.appendChild(popup);

    // Track popup shown
    if (typeof trackEvent === 'function') {
        trackEvent('exit_popup_shown', 'ab_test', variant);
    }
}

// Chat widget
function initChatWidget(variant) {
    if (variant === 'telegram-widget') {
        const widget = document.createElement('a');
        widget.href = 'https://t.me/pavellipin';
        widget.target = '_blank';
        widget.className = 'chat-widget';
        widget.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.98-1.73 6.64-2.87 7.97-3.43 3.79-1.58 4.58-1.85 5.09-1.86.11 0 .37.03.53.17.14.12.18.28.2.45-.01.07.01.24 0 .37z"/>
            </svg>
        `;
        widget.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 56px;
            height: 56px;
            background: #0088cc;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 136, 204, 0.4);
            z-index: 1000;
            transition: transform 0.3s ease;
        `;
        widget.onmouseover = () => widget.style.transform = 'scale(1.1)';
        widget.onmouseout = () => widget.style.transform = 'scale(1)';

        document.body.appendChild(widget);
    } else if (variant === 'intercom-style') {
        const widget = document.createElement('div');
        widget.className = 'chat-widget-intercom';
        widget.innerHTML = `
            <button style="
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 56px;
                height: 56px;
                background: #6366F1;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
                z-index: 1000;
                transition: transform 0.3s ease;
            " onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
                </svg>
            </button>
            <div style="
                display: none;
                position: fixed;
                bottom: 96px;
                right: 24px;
                width: 320px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                z-index: 1001;
                overflow: hidden;
            ">
                <div style="background: #6366F1; color: white; padding: 20px;">
                    <h4 style="margin: 0;">Привет! 👋</h4>
                    <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Как могу помочь?</p>
                </div>
                <div style="padding: 20px;">
                    <a href="https://t.me/pavellipin" target="_blank" style="display: block; padding: 12px; background: #F3F4F6; border-radius: 8px; text-decoration: none; color: #1F2937; margin-bottom: 8px;">
                        💬 Написать в Telegram
                    </a>
                    <a href="#contact" style="display: block; padding: 12px; background: #F3F4F6; border-radius: 8px; text-decoration: none; color: #1F2937;" onclick="this.closest('.chat-widget-intercom').querySelector('button').click()">
                        📝 Оставить заявку
                    </a>
                </div>
            </div>
        `;
        document.body.appendChild(widget);
    }
}

// Track assignments to analytics
function trackAssignments(assignments) {
    // Google Analytics
    if (typeof gtag === 'function') {
        Object.keys(assignments).forEach(testName => {
            gtag('event', 'ab_test_assignment', {
                test_name: testName,
                variant: assignments[testName]
            });
        });
    }

    // Yandex Metrika
    if (typeof ym === 'function') {
        ym(window.YM_COUNTER_ID || 0, 'params', {
            ab_tests: assignments
        });
    }

    console.log('A/B Test Assignments:', assignments);
}

// Manual override for testing (call from console)
window.setABVariant = function(testName, variant) {
    const assignments = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    assignments[testName] = variant;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    location.reload();
};

// Reset all assignments (call from console)
window.resetABTests = function() {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
};

// Get current assignments (call from console)
window.getABAssignments = function() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
};
