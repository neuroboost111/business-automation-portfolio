/**
 * Chat Widget — Бот-квалификатор
 * Собирает информацию от посетителей и отправляет в Telegram
 */

(function() {
    'use strict';

    // Конфигурация
    const CONFIG = {
        telegramBotToken: 'YOUR_BOT_TOKEN', // Заменить на реальный токен
        telegramChatId: 'YOUR_CHAT_ID',     // Заменить на реальный chat_id
        googleSheetUrl: '',                  // URL Google Apps Script для записи в таблицу
        proactiveDelay: 30000,              // Показать prompt через 30 сек
        typingDelay: 1000                   // Задержка "печатает..."
    };

    // Состояние квалификации
    let qualificationData = {
        task_type: null,
        hours_per_week: null,
        timeline: null,
        contact: null,
        timestamp: null,
        page_url: window.location.href,
        utm_source: new URLSearchParams(window.location.search).get('utm_source') || 'direct'
    };

    let currentStep = 0;

    // Вопросы квалификации
    const QUESTIONS = [
        {
            message: 'Какую задачу хотите автоматизировать?',
            options: [
                { value: 'email', label: 'Email и письма' },
                { value: 'crm', label: 'CRM и продажи' },
                { value: 'support', label: 'Клиентский сервис' },
                { value: 'hr', label: 'HR и найм' },
                { value: 'other', label: 'Другое' }
            ],
            field: 'task_type'
        },
        {
            message: 'Сколько часов в неделю уходит на эту задачу?',
            options: [
                { value: '1-5', label: '1-5 часов' },
                { value: '5-10', label: '5-10 часов' },
                { value: '10-20', label: '10-20 часов' },
                { value: '20+', label: 'Более 20 часов' }
            ],
            field: 'hours_per_week'
        },
        {
            message: 'Когда планируете внедрение?',
            options: [
                { value: 'asap', label: 'Как можно скорее' },
                { value: 'month', label: 'В течение месяца' },
                { value: 'quarter', label: 'В этом квартале' },
                { value: 'research', label: 'Пока изучаю' }
            ],
            field: 'timeline'
        }
    ];

    // DOM элементы
    const widget = document.getElementById('chat-widget');
    const trigger = document.getElementById('chat-trigger');
    const chatWindow = document.getElementById('chat-window');
    const messagesContainer = document.getElementById('chat-messages');
    const optionsContainer = document.getElementById('chat-options');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const prompt = document.getElementById('chat-prompt');
    const promptClose = document.getElementById('prompt-close');

    if (!widget || !trigger) return;

    // Инициализация
    function init() {
        // Открытие/закрытие чата
        trigger.addEventListener('click', toggleChat);

        // Закрытие prompt
        if (promptClose) {
            promptClose.addEventListener('click', (e) => {
                e.stopPropagation();
                hidePrompt();
            });
        }

        // Клик по prompt открывает чат
        if (prompt) {
            prompt.addEventListener('click', () => {
                hidePrompt();
                openChat();
            });
        }

        // Отправка сообщения
        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
        }

        // Делегирование для кнопок опций
        if (optionsContainer) {
            optionsContainer.addEventListener('click', handleOptionClick);
        }

        // Показать проактивное сообщение через N секунд
        setTimeout(showPrompt, CONFIG.proactiveDelay);

        // Инициализация первого шага
        renderOptions(QUESTIONS[0].options);
    }

    // Открыть/закрыть чат
    function toggleChat() {
        widget.classList.toggle('active');
        hidePrompt();
    }

    function openChat() {
        widget.classList.add('active');
    }

    function closeChat() {
        widget.classList.remove('active');
    }

    // Показать/скрыть prompt
    function showPrompt() {
        if (!widget.classList.contains('active') && prompt) {
            prompt.classList.add('visible');
        }
    }

    function hidePrompt() {
        if (prompt) {
            prompt.classList.remove('visible');
        }
    }

    // Добавить сообщение в чат
    function addMessage(text, isBot = true) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message chat-message--${isBot ? 'bot' : 'user'}`;
        msgDiv.innerHTML = `<p>${text}</p>`;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Показать "печатает..."
    function showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message chat-message--bot chat-typing';
        typingDiv.innerHTML = '<p>...</p>';
        typingDiv.id = 'typing-indicator';
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideTyping() {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    }

    // Отрисовать опции
    function renderOptions(options) {
        optionsContainer.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chat-option';
            btn.dataset.value = opt.value;
            btn.textContent = opt.label;
            optionsContainer.appendChild(btn);
        });
    }

    // Обработка клика по опции
    function handleOptionClick(e) {
        if (!e.target.classList.contains('chat-option')) return;

        const value = e.target.dataset.value;
        const label = e.target.textContent;

        // Показать выбор пользователя
        addMessage(label, false);

        // Сохранить ответ
        if (currentStep < QUESTIONS.length) {
            qualificationData[QUESTIONS[currentStep].field] = value;
        }

        currentStep++;

        // Следующий шаг
        if (currentStep < QUESTIONS.length) {
            showTyping();
            setTimeout(() => {
                hideTyping();
                addMessage(QUESTIONS[currentStep].message);
                renderOptions(QUESTIONS[currentStep].options);
            }, CONFIG.typingDelay);
        } else {
            // Квалификация завершена
            finishQualification();
        }
    }

    // Завершение квалификации
    function finishQualification() {
        optionsContainer.innerHTML = '';

        showTyping();
        setTimeout(() => {
            hideTyping();

            // Рассчитать потенциальную экономию
            const hoursMap = { '1-5': 3, '5-10': 7.5, '10-20': 15, '20+': 25 };
            const hours = hoursMap[qualificationData.hours_per_week] || 10;
            const savings = Math.round(hours * 4 * 1500 * 0.7); // 70% автоматизация, 1500 ₽/час

            addMessage(`Отлично! По вашим данным, потенциальная экономия — <strong>${savings.toLocaleString('ru-RU')} ₽/мес</strong>`);

            setTimeout(() => {
                addMessage('Оставьте контакт, и я пришлю персональный расчёт с roadmap внедрения:');

                // Показать поле ввода
                chatInput.placeholder = 'Telegram (@username) или телефон';
                chatInput.focus();

                // Пометить что ждём контакт
                qualificationData.waitingContact = true;
            }, CONFIG.typingDelay);

        }, CONFIG.typingDelay);
    }

    // Отправка сообщения
    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, false);
        chatInput.value = '';

        if (qualificationData.waitingContact) {
            qualificationData.contact = text;
            qualificationData.timestamp = new Date().toISOString();
            qualificationData.waitingContact = false;

            // Отправить данные
            sendToTelegram();
            sendToGoogleSheet();

            showTyping();
            setTimeout(() => {
                hideTyping();
                addMessage('Спасибо! Свяжусь с вами в течение 2 часов. А пока можете посмотреть <a href="#cases" style="color: var(--color-accent);">наши кейсы</a>.');
            }, CONFIG.typingDelay);
        } else {
            // Свободный ввод — просто отвечаем
            showTyping();
            setTimeout(() => {
                hideTyping();
                addMessage('Понял! Выберите один из вариантов выше, чтобы я мог точнее рассчитать вашу экономию.');
            }, CONFIG.typingDelay);
        }
    }

    // Отправка в Telegram
    function sendToTelegram() {
        if (!CONFIG.telegramBotToken || CONFIG.telegramBotToken === 'YOUR_BOT_TOKEN') {
            console.log('Telegram: данные для отправки', qualificationData);
            return;
        }

        const taskLabels = {
            email: 'Email и письма',
            crm: 'CRM и продажи',
            support: 'Клиентский сервис',
            hr: 'HR и найм',
            other: 'Другое'
        };

        const timelineLabels = {
            asap: 'Как можно скорее',
            month: 'В течение месяца',
            quarter: 'В этом квартале',
            research: 'Пока изучаю'
        };

        const message = `
🤖 *Новая заявка с чат-бота*

📋 *Задача:* ${taskLabels[qualificationData.task_type] || qualificationData.task_type}
⏱ *Часов в неделю:* ${qualificationData.hours_per_week}
📅 *Сроки:* ${timelineLabels[qualificationData.timeline] || qualificationData.timeline}
📞 *Контакт:* ${qualificationData.contact}

🔗 *Страница:* ${qualificationData.page_url}
📊 *UTM:* ${qualificationData.utm_source}
🕐 *Время:* ${new Date().toLocaleString('ru-RU')}
        `.trim();

        fetch(`https://api.telegram.org/bot${CONFIG.telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CONFIG.telegramChatId,
                text: message,
                parse_mode: 'Markdown'
            })
        }).catch(err => console.error('Telegram error:', err));
    }

    // Отправка в Google Sheets
    function sendToGoogleSheet() {
        if (!CONFIG.googleSheetUrl) {
            console.log('Google Sheets: данные для отправки', qualificationData);
            return;
        }

        fetch(CONFIG.googleSheetUrl, {
            method: 'POST',
            body: JSON.stringify(qualificationData)
        }).catch(err => console.error('Google Sheets error:', err));
    }

    // Запуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
