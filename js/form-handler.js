/* ============================================
   FORM HANDLER
============================================= */

document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
});

function initContactForm() {
    const form = document.getElementById('contact-form');

    if (form) {
        form.addEventListener('submit', handleFormSubmit);

        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    // Validate form
    if (!validateForm(form)) {
        return;
    }

    // Get form data
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        contact: formData.get('contact'),
        task: formData.get('task'),
        package: formData.get('package') || 'not-selected',
        timestamp: new Date().toISOString(),
        source: window.location.href,
        referrer: document.referrer
    };

    // Add loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        // Option 1: Send to Telegram bot (recommended for simple setup)
        await sendToTelegram(data);

        // Option 2: Send to webhook (n8n, Make, etc.)
        // await sendToWebhook(data);

        // Option 3: Send to email service
        // await sendToEmailService(data);

        // Success
        showSuccessMessage(form);
        form.reset();

        // Track conversion
        if (typeof trackEvent === 'function') {
            trackEvent('form_submit', 'contact', data.package);
        }

        // Google Ads conversion (if configured)
        if (typeof gtag === 'function') {
            gtag('event', 'conversion', {
                send_to: 'AW-XXXXXXXXXX/XXXXXXXXXXXXX'
            });
        }

    } catch (error) {
        console.error('Form submission error:', error);
        showErrorMessage(form);
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Send form data to Telegram bot
async function sendToTelegram(data) {
    const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN'; // Replace with your bot token
    const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID';     // Replace with your chat ID

    const message = `
🔔 *Новая заявка с сайта!*

👤 *Имя:* ${escapeMarkdown(data.name)}
📱 *Контакт:* ${escapeMarkdown(data.contact)}
📦 *Пакет:* ${data.package}

💬 *Задача:*
${escapeMarkdown(data.task || 'Не указана')}

---
🔗 Источник: ${data.source}
⏰ Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        })
    });

    if (!response.ok) {
        throw new Error('Telegram API error');
    }

    return response.json();
}

// Send form data to webhook (n8n, Make, Zapier, etc.)
async function sendToWebhook(data) {
    const WEBHOOK_URL = 'YOUR_WEBHOOK_URL'; // Replace with your webhook URL

    const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error('Webhook error');
    }

    return response.json();
}

// Form validation
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });

    return isValid;
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Clear previous error
    clearFieldError({ target: field });

    // Required check
    if (field.hasAttribute('required') && !value) {
        errorMessage = 'Это поле обязательно';
        isValid = false;
    }

    // Email/Telegram validation for contact field
    if (field.name === 'contact' && value) {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const isTelegram = /^@?[a-zA-Z0-9_]{5,}$/.test(value);

        if (!isEmail && !isTelegram) {
            errorMessage = 'Введите корректный email или Telegram';
            isValid = false;
        }
    }

    // Show error if invalid
    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');

    // Create error element
    let errorEl = field.parentElement.querySelector('.field-error');
    if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'field-error';
        errorEl.style.cssText = `
            display: block;
            color: #EF4444;
            font-size: 12px;
            margin-top: 4px;
        `;
        field.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');

    const errorEl = field.parentElement.querySelector('.field-error');
    if (errorEl) {
        errorEl.remove();
    }
}

function showSuccessMessage(form) {
    // Create success message
    const successEl = document.createElement('div');
    successEl.className = 'form-success';
    successEl.innerHTML = `
        <div style="
            background: #22C55E;
            color: white;
            padding: 24px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 16px;
        ">
            <svg width="48" height="48" viewBox="0 0 48 48" style="margin-bottom: 12px;">
                <circle cx="24" cy="24" r="20" fill="rgba(255,255,255,0.2)"/>
                <path d="M16 24L22 30L32 18" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3 style="font-size: 20px; margin-bottom: 8px;">Заявка отправлена!</h3>
            <p style="opacity: 0.9; font-size: 14px;">Отвечу в течение 2 часов в рабочее время</p>
        </div>
    `;

    // Replace form with success message
    form.style.display = 'none';
    form.parentElement.appendChild(successEl);

    // Show toast notification
    if (typeof showToast === 'function') {
        showToast('Спасибо! Скоро свяжусь с вами', 'success');
    }
}

function showErrorMessage(form) {
    if (typeof showToast === 'function') {
        showToast('Ошибка отправки. Попробуйте через Telegram', 'error');
    }
}

// Escape special characters for Telegram Markdown
function escapeMarkdown(text) {
    if (!text) return '';
    return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

// Export for global use
window.handleFormSubmit = handleFormSubmit;
