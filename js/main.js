/* ============================================
   MAIN JAVASCRIPT
============================================= */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initSmoothScroll();
    initScrollAnimations();
    initFAQ();
    initMobileMenu();
    initHeaderScroll();
});


/* ============================================
   NAVIGATION
============================================= */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav__menu a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    const mobileMenu = document.querySelector('.nav__menu');
                    if (mobileMenu.classList.contains('active')) {
                        mobileMenu.classList.remove('active');
                    }
                }
            }
        });
    });
}


/* ============================================
   MOBILE MENU
============================================= */
function initMobileMenu() {
    const burger = document.querySelector('.nav__burger');
    const menu = document.querySelector('.nav__menu');

    if (burger && menu) {
        burger.addEventListener('click', function() {
            menu.classList.toggle('active');
            this.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav') && menu.classList.contains('active')) {
                menu.classList.remove('active');
                burger.classList.remove('active');
            }
        });
    }
}


/* ============================================
   HEADER SCROLL EFFECT
============================================= */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }

        // Hide/show header on scroll
        if (currentScroll > lastScroll && currentScroll > 200) {
            header.classList.add('header--hidden');
        } else {
            header.classList.remove('header--hidden');
        }

        lastScroll = currentScroll;
    });
}


/* ============================================
   SMOOTH SCROLL
============================================= */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}


/* ============================================
   SCROLL ANIMATIONS
============================================= */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));

    // Staggered animations
    const staggeredContainers = document.querySelectorAll('[data-animate-stagger]');

    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                staggerObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    staggeredContainers.forEach(el => staggerObserver.observe(el));
}


/* ============================================
   FAQ ACCORDION
============================================= */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item__question');

    faqItems.forEach(item => {
        item.addEventListener('click', function() {
            const parent = this.parentElement;
            const isActive = parent.classList.contains('active');

            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(faq => {
                faq.classList.remove('active');
            });

            // Toggle current item
            if (!isActive) {
                parent.classList.add('active');
            }

            // Track event
            if (typeof trackEvent === 'function') {
                trackEvent('faq_expand', 'faq', this.textContent.trim().substring(0, 50));
            }
        });
    });
}


/* ============================================
   SCROLL TO FORM
============================================= */
function scrollToForm() {
    const contactSection = document.getElementById('contact');

    if (contactSection) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = contactSection.offsetTop - headerHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}


/* ============================================
   SELECT PACKAGE
============================================= */
function selectPackage(packageName) {
    const hiddenInput = document.getElementById('selected-package');

    if (hiddenInput) {
        hiddenInput.value = packageName;
    }

    // Track event
    if (typeof trackEvent === 'function') {
        trackEvent('package_select', 'pricing', packageName);
    }
}


/* ============================================
   COUNTER ANIMATION
============================================= */
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;

        if (current >= target) {
            element.textContent = formatNumber(target);
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(current));
        }
    }, 16);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
}


/* ============================================
   LAZY LOADING IMAGES
============================================= */
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}


/* ============================================
   UTILITY FUNCTIONS
============================================= */

// Debounce function
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

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Get URL parameter
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Copy to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}


/* ============================================
   TOAST NOTIFICATIONS
============================================= */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;

    // Add styles
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '8px',
        background: type === 'success' ? '#22C55E' : type === 'error' ? '#EF4444' : '#6366F1',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        animation: 'slideInUp 0.3s ease'
    });

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}


/* ============================================
   TRACKING EVENTS
============================================= */
function trackEvent(action, category, label) {
    // Google Analytics
    if (typeof gtag === 'function') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }

    // Yandex Metrika
    if (typeof ym === 'function') {
        ym(window.YM_COUNTER_ID || 0, 'reachGoal', action, {
            category: category,
            label: label
        });
    }

    // Console log for debugging
    console.log('Event tracked:', { action, category, label });
}


/* ============================================
   EXPORT FUNCTIONS FOR GLOBAL USE
============================================= */
window.scrollToForm = scrollToForm;
window.selectPackage = selectPackage;
window.trackEvent = trackEvent;
window.showToast = showToast;
