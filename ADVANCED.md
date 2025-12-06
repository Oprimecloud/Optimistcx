<!-- Advanced Features & Customization Options for OptimistCx -->

# Advanced Features Guide

## 🎯 Advanced JavaScript Features

### 1. Smooth Scroll Behavior
The site includes smooth scroll-to-anchor functionality. To add a custom smooth scroll:

```javascript
// Already included in script.js
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
```

### 2. Form Validation
The contact form includes comprehensive validation:

```javascript
function validateForm(name, email, phone, service, message) {
    // Name: minimum 2 characters
    if (name.length < 2) return false;

    // Email: valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    // Service: must be selected
    if (!service) return false;

    // Message: minimum 10 characters
    if (message.length < 10) return false;

    return true;
}
```

To add custom validation rules:
```javascript
// Add phone number validation
const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
if (phone && !phoneRegex.test(phone)) {
    return false;
}
```

### 3. Notification System
A custom toast notification system is built-in:

```javascript
showNotification('Your message', 'success');
showNotification('Error message', 'error');
showNotification('Warning message', 'warning');
```

### 4. Intersection Observer API
Used for efficient scroll animations:

```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});
```

### 5. Dynamic Navigation Highlighting
Active navigation links highlight based on scroll position:

```javascript
function updateActiveNav() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}
```

## 🎨 Advanced CSS Features

### 1. CSS Variables for Easy Theming
Add CSS variables for quick theme changes:

```css
:root {
    --primary-color: #2563eb;
    --primary-dark: #1d4ed8;
    --secondary-color: #f59e0b;
    --text-color: #2c3e50;
    --light-bg: #f0f9ff;
    --border-radius: 12px;
    --transition: all 0.3s ease;
}

/* Use variables throughout */
.btn-primary {
    background: var(--primary-color);
    border-radius: var(--border-radius);
    transition: var(--transition);
}
```

### 2. Dark Mode Support
Implement dark mode with CSS:

```css
@media (prefers-color-scheme: dark) {
    :root {
        --primary-color: #60a5fa;
        --text-color: #e0e7ff;
        --light-bg: #1e293b;
    }

    body {
        background: #0f172a;
        color: var(--text-color);
    }
}
```

### 3. Advanced Gradients
Modern gradient techniques:

```css
/* Multi-color gradient */
background: linear-gradient(135deg, 
    #2563eb 0%, 
    #7c3aed 50%, 
    #db2777 100%);

/* Radial gradient for effect */
background: radial-gradient(circle at 20% 50%, 
    rgba(37, 99, 235, 0.2), 
    transparent 50%);
```

### 4. Custom Scrollbar
Style the scrollbar:

```css
::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
    background: #2563eb;
    border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
    background: #1d4ed8;
}
```

## 🔌 Integration Options

### 1. Email Service Integration (FormSubmit.co)
Already set up - no backend needed:

```html
<form action="https://formsubmit.co/your-email@gmail.com" method="POST">
    <input type="text" name="name" required />
    <input type="email" name="email" required />
    <input type="hidden" name="_captcha" value="false" />
    <button type="submit">Send</button>
</form>
```

### 2. Email Service Integration (EmailJS)
```javascript
// Include EmailJS library
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3.11.0/dist/index.min.js"></script>

<script>
    emailjs.init('YOUR_PUBLIC_KEY');
    
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        emailjs.sendForm('service_id', 'template_id', this)
            .then(() => {
                showNotification('Email sent successfully!', 'success');
                this.reset();
            })
            .catch(error => {
                showNotification('Failed to send email', 'error');
            });
    });
</script>
```

### 3. CRM Integration (Pipedrive)
```javascript
// Track form submissions to Pipedrive
function sendToPipedrive(formData) {
    fetch('https://api.pipedrive.com/v1/persons', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            org_id: YOUR_ORG_ID,
            api_token: YOUR_API_TOKEN
        })
    })
    .then(response => response.json())
    .then(data => console.log('Saved to Pipedrive:', data))
    .catch(error => console.error('Error:', error));
}
```

### 4. Google Analytics Enhanced Events
```javascript
// Track specific user interactions
function trackEvent(eventName, eventData) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
}

// Track form submissions
contactForm.addEventListener('submit', function() {
    trackEvent('form_submit', {
        'form_name': 'contact_form',
        'service': this.querySelector('select').value
    });
});

// Track CTA clicks
document.querySelectorAll('.cta-button').forEach(btn => {
    btn.addEventListener('click', function() {
        trackEvent('cta_click', {
            'button_text': this.textContent
        });
    });
});
```

## 🚀 Performance Optimizations

### 1. Lazy Loading Images
```html
<!-- Use native lazy loading -->
<img src="image.jpg" alt="Description" loading="lazy" />

<!-- Or with JavaScript -->
<img src="" data-src="image.jpg" alt="Description" class="lazy" />
```

```javascript
// JavaScript lazy loading
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}
```

### 2. Debounce Scroll Events
```javascript
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

window.addEventListener('scroll', debounce(() => {
    updateActiveNav();
}, 100));
```

### 3. Minimize CSS-in-JS
Keep styles in external CSS files and use classes:

```javascript
// Good - use classes
element.classList.add('active');

// Avoid - inline styles
element.style.color = 'blue';
```

## 🔐 Security Best Practices

### 1. Prevent XSS Attacks
```javascript
// Safe way to set text content
element.textContent = userInput; // Safe

// Avoid
element.innerHTML = userInput; // Unsafe

// If HTML is needed, sanitize it
function sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}
```

### 2. CSRF Token Implementation
```html
<form id="contactForm">
    <input type="hidden" name="_token" value="<?php echo csrf_token(); ?>" />
    <!-- Form fields -->
</form>
```

### 3. Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.example.com; style-src 'self' 'unsafe-inline'" />
```

## 📊 Analytics & Tracking

### 1. Page View Tracking
```javascript
// Automatic with Google Analytics
// Pages are tracked by default

// Custom page tracking
if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
        'page_path': window.location.pathname
    });
}
```

### 2. Engagement Tracking
```javascript
// Track time on page
const startTime = Date.now();

window.addEventListener('beforeunload', () => {
    const timeOnPage = Date.now() - startTime;
    trackEvent('engagement', {
        'time_on_page': Math.round(timeOnPage / 1000) // seconds
    });
});
```

### 3. Conversion Tracking
```javascript
// Track form conversions
function trackConversion(conversionId, value) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
            'send_to': 'AW-' + conversionId,
            'value': value,
            'currency': 'USD'
        });
    }
}
```

## 🎬 Advanced Animations

### 1. Animate on Scroll
```css
@keyframes slideInFromLeft {
    from {
        opacity: 0;
        transform: translateX(-100px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.animate-on-scroll {
    animation: slideInFromLeft 0.6s ease forwards;
}
```

### 2. Parallax Effect
```javascript
window.addEventListener('scroll', () => {
    const elements = document.querySelectorAll('[data-parallax]');
    
    elements.forEach(element => {
        const scrollPosition = window.scrollY;
        const speed = element.getAttribute('data-parallax');
        element.style.transform = `translateY(${scrollPosition * speed}px)`;
    });
});
```

```html
<div data-parallax="0.5">Parallax content</div>
```

### 3. Stagger Animation
```css
.animated-list li {
    opacity: 0;
    animation: slideIn 0.6s ease forwards;
}

.animated-list li:nth-child(1) { animation-delay: 0.1s; }
.animated-list li:nth-child(2) { animation-delay: 0.2s; }
.animated-list li:nth-child(3) { animation-delay: 0.3s; }
```

## 🧪 Testing

### 1. Cross-browser Testing
Test on:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers

### 2. Performance Testing
```javascript
// Check performance
window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log('Page load time: ' + pageLoadTime + 'ms');
});
```

### 3. Accessibility Testing
```javascript
// Simple accessibility check
document.querySelectorAll('a').forEach(link => {
    if (!link.textContent.trim() && !link.getAttribute('aria-label')) {
        console.warn('Link missing accessible text:', link);
    }
});
```

## 📱 Mobile Optimization

### 1. Touch Events
```javascript
let touchStartX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > 50) {
        // Swipe detected
    }
});
```

### 2. Viewport Meta Tag
```html
<!-- Already included -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### 3. Mobile Menu Optimization
```css
@media (max-width: 768px) {
    .nav-menu {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        z-index: 999;
    }
}
```

## 🌍 Internationalization (i18n)

### 1. Multi-language Support
```javascript
const translations = {
    en: {
        'home': 'Home',
        'services': 'Services',
        'contact': 'Contact'
    },
    es: {
        'home': 'Inicio',
        'services': 'Servicios',
        'contact': 'Contacto'
    }
};

function t(key, lang = 'en') {
    return translations[lang]?.[key] || key;
}
```

## 🔄 Auto-Update Features

### 1. Auto-Backup System
```javascript
// Auto-save form data
const formFields = document.querySelectorAll('input, textarea, select');

formFields.forEach(field => {
    field.addEventListener('change', () => {
        localStorage.setItem('form_' + field.name, field.value);
    });
});

// Restore saved data
window.addEventListener('load', () => {
    formFields.forEach(field => {
        const saved = localStorage.getItem('form_' + field.name);
        if (saved) field.value = saved;
    });
});
```

---

These advanced features make OptimistCx a truly professional, feature-rich digital agency website!
