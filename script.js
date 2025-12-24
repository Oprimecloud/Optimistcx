// ============================================================
// NAVIGATION FUNCTIONALITY
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navList = document.querySelector('.nav-list');
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    // Hamburger menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        if (navList) navList.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't close for dropdown items
            if (!this.closest('.nav-dropdown') || !this.querySelector('.chevron')) {
                hamburger.classList.remove('active');
                if (navList) navList.classList.remove('active');
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Set active nav link based on scroll position
    updateActiveNav();
    window.addEventListener('scroll', updateActiveNav);

    // Auto-wire service 'Learn More' links to service pages
    document.querySelectorAll('.service-card').forEach(card => {
        const link = card.querySelector('.learn-more');
        if (!link) return;
        const id = card.id ? card.id.toLowerCase() : '';
        let page = '';
        switch (id) {
            case 'web-design': page = 'web-design.html'; break;
            case 'seo': page = 'seo.html'; break;
            case 'ppc': page = 'ppc.html'; break;
            case 'social-media': page = 'social-media.html'; break;
            case 'branding': page = 'branding.html'; break;
            case 'content-marketing': page = 'content-marketing.html'; break;
            default:
                const h = card.querySelector('h3');
                if (h) {
                    const txt = h.textContent.toLowerCase();
                    if (txt.includes('seo')) page = 'seo.html';
                    else if (txt.includes('ppc')) page = 'ppc.html';
                    else if (txt.includes('social')) page = 'social-media.html';
                    else if (txt.includes('brand')) page = 'branding.html';
                    else if (txt.includes('content')) page = 'content-marketing.html';
                    else page = 'web-design.html';
                }
        }
        if (page) link.setAttribute('href', page);
    });
});

function updateActiveNav() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
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

// ============================================================
// SMOOTH SCROLLING FOR INTERNAL LINKS
// ============================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const target = document.querySelector(href);
            const offsetTop = target.offsetTop - 80;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================================
// FORM VALIDATION & SUBMISSION
// ============================================================

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);
        const name = this.querySelector('input[type="text"]').value.trim();
        const email = this.querySelector('input[type="email"]').value.trim();
        const phone = this.querySelector('input[type="tel"]').value.trim();
        const service = this.querySelector('select').value;
        const message = this.querySelector('textarea').value.trim();

        // Validation
        if (!validateForm(name, email, phone, service, message)) {
            showNotification('Please fill in all required fields correctly.', 'error');
            return;
        }

        // Simulate form submission
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Simulate API call (in production, send to actual server)
        setTimeout(() => {
            // Reset form
            this.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            // Show success message
            showNotification('Thank you! We\'ll contact you shortly.', 'success');
        }, 1500);
    });
}

function validateForm(name, email, phone, service, message) {
    // Name validation
    if (name.length < 2) {
        return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return false;
    }

    // Service validation
    if (!service) {
        return false;
    }

    // Message validation
    if (message.length < 10) {
        return false;
    }

    return true;
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideInNotification 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-width: 400px;
    `;

    document.body.appendChild(notification);

    // Remove notification after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutNotification 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// ============================================================
// SCROLL ANIMATIONS
// ============================================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe service cards, portfolio items, and other elements
document.querySelectorAll('.service-card, .portfolio-item, .testimonial-card, .blog-card, .step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ============================================================
// COUNTER ANIMATION
// ============================================================

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/\D/g, ''));
        const increment = target / 50;
        let current = 0;

        const updateCount = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.ceil(current) + '+';
                setTimeout(updateCount, 30);
            } else {
                counter.textContent = counter.textContent; // Keep original format
            }
        };

        updateCount();
    });
}

// Trigger counter animation when stats section is in view
const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            animateCounters();
            entry.target.dataset.animated = 'true';
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// ============================================================
// LAZY LOADING IMAGES
// ============================================================

function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

lazyLoadImages();

// ============================================================
// KEYBOARD NAVIGATION
// ============================================================

// Escape key to close mobile menu
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const hamburger = document.getElementById('hamburger');
        const navList = document.querySelector('.nav-list');
        
        if (hamburger && hamburger.classList.contains('active')) {
            hamburger.classList.remove('active');
            if (navList) navList.classList.remove('active');
        }
    }
});

// ============================================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================================

// Add skip to main content link
const skipLink = document.createElement('a');
skipLink.href = '#main-content';
skipLink.textContent = 'Skip to main content';
skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #2563eb;
    color: white;
    padding: 8px;
    border-radius: 0 0 4px 0;
    z-index: 100;
`;

skipLink.addEventListener('focus', function() {
    this.style.top = '0';
});

skipLink.addEventListener('blur', function() {
    this.style.top = '-40px';
});

document.body.insertBefore(skipLink, document.body.firstChild);

// ============================================================
// PERFORMANCE MONITORING
// ============================================================

// Log page performance metrics
window.addEventListener('load', function() {
    if (window.performance && window.performance.timing) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log('Page load time: ' + pageLoadTime + 'ms');
    }
});

// ============================================================
// SERVICE CARD INTERACTIONS
// ============================================================

document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// ============================================================
// PORTFOLIO FILTER (Optional Enhancement)
// ============================================================

// Example: Add filter functionality if needed
const portfolioFilters = document.querySelectorAll('[data-filter]');

if (portfolioFilters.length > 0) {
    portfolioFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            const filterValue = this.dataset.filter;
            const portfolioItems = document.querySelectorAll('.portfolio-item');

            portfolioFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');

            portfolioItems.forEach(item => {
                if (filterValue === 'all' || item.dataset.category === filterValue) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.3s ease';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// ============================================================
// TESTIMONIAL SLIDER (Optional Enhancement)
// ============================================================

function initTestimonialSlider() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    if (testimonials.length <= 3) return; // Only if more than 3 testimonials

    let currentIndex = 0;

    function showTestimonial(index) {
        testimonials.forEach((testimonial, i) => {
            testimonial.style.display = i === index ? 'block' : 'none';
        });
    }

    // Auto rotate testimonials every 5 seconds
    setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(currentIndex);
    }, 5000);

    showTestimonial(0);
}

// ============================================================
// SOCIAL SHARING
// ============================================================

function shareOnSocial(platform, url) {
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=Check%20out%20this%20amazing%20project`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
        window.open(shareUrls[platform], 'share', 'width=600,height=400');
    }
}

// ============================================================
// ANIMATION DEFINITIONS (for CSS)
// ============================================================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInNotification {
        from {
            opacity: 0;
            transform: translateX(400px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutNotification {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(400px);
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
`;
document.head.appendChild(style);

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

// Debounce function for scroll events
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

// Get element's position relative to viewport
function getElementVisibility(el) {
    const rect = el.getBoundingClientRect();
    return {
        isVisible: rect.top < window.innerHeight && rect.bottom > 0,
        percentVisible: Math.max(0, Math.min(1, (window.innerHeight - rect.top) / rect.height))
    };
}

// ============================================================
// DYNAMIC CONTENT LOADING (Optional)
// ============================================================

async function loadBlogPosts() {
    try {
        // Simulate loading blog posts from API
        const blogCards = document.querySelectorAll('.blog-card');
        
        blogCards.forEach(card => {
            // Add loading animation
            const originalContent = card.innerHTML;
            
            // In production, fetch from API here
            // const response = await fetch('/api/blog-posts');
            // const data = await response.json();
        });
    } catch (error) {
        console.error('Error loading blog posts:', error);
    }
}

// ============================================================
// PRINT STYLES
// ============================================================

window.addEventListener('beforeprint', function() {
    document.body.style.background = 'white';
});

// ============================================================
// INITIALIZATION
// ============================================================

console.log('OptimistCx - Professional Digital Agency');
console.log('Version 1.0.0');
console.log('Ready to transform your business!');

// ============================================================
// BRANDS CAROUSEL
// ============================================================

function initBrandsCarousel() {
    const wrapper = document.querySelector('.brands-carousel-wrapper');
    if (!wrapper) return;

    const track = wrapper.querySelector('.brands-track');
    const slides = Array.from(track.children);
    let index = 0;
    let slideWidth = slides[0].getBoundingClientRect().width + parseInt(getComputedStyle(track).gap || 16);
    let isPaused = false;
    let autoPlayInterval = 3000;
    let timer = null;

    const updateSizes = () => {
        slideWidth = slides[0].getBoundingClientRect().width + parseInt(getComputedStyle(track).gap || 16);
        moveTo(index);
    };

    function moveTo(i) {
        const maxIndex = slides.length - 1;
        if (i < 0) i = maxIndex;
        if (i > maxIndex) i = 0;
        index = i;
        track.style.transform = `translateX(${-index * slideWidth}px)`;
    }

    function next() { moveTo(index + 1); }
    function prev() { moveTo(index - 1); }

    // Controls
    const prevBtn = wrapper.querySelector('.brands-prev');
    const nextBtn = wrapper.querySelector('.brands-next');
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetTimer(); });

    // Autoplay
    function startTimer() {
        if (timer) clearInterval(timer);
        timer = setInterval(() => { if (!isPaused) next(); }, autoPlayInterval);
    }
    function resetTimer() { isPaused = false; startTimer(); }

    wrapper.addEventListener('mouseenter', () => { isPaused = true; });
    wrapper.addEventListener('mouseleave', () => { isPaused = false; });

    // Touch support
    let startX = 0;
    let deltaX = 0;
    wrapper.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; isPaused = true; });
    wrapper.addEventListener('touchmove', (e) => { deltaX = e.touches[0].clientX - startX; });
    wrapper.addEventListener('touchend', () => {
        if (Math.abs(deltaX) > 50) {
            if (deltaX < 0) next(); else prev();
        }
        deltaX = 0; isPaused = false; resetTimer();
    });

    // Resize handling
    window.addEventListener('resize', debounce(updateSizes, 120));

    // Initialize
    updateSizes();
    startTimer();
}

// Auto-init on DOM ready
if (document.readyState !== 'loading') initBrandsCarousel(); else document.addEventListener('DOMContentLoaded', initBrandsCarousel);
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  // Set initial theme
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  themeToggle.textContent = document.documentElement.getAttribute('data-theme') === 'light' ? '🌞' : '🌙';
  themeToggle.addEventListener('click', function() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeToggle.textContent = next === 'light' ? '🌞' : '🌚';
  });
});

document.querySelectorAll(".menu button").forEach(btn => {
  btn.addEventListener("click", () => {
    const service = btn.dataset.value;

    // 1️⃣ Show as user message
    appendUserMessage(service);

    // 2️⃣ Hide menu after selection
    document.getElementById("chat-menu").style.display = "none";

    // 3️⃣ Send to backend
    sendMessage({
      type: "service",
      value: service
    });
  });
});
function appendUserMessage(text) {
  const messages = document.getElementById("gemini-messages");
  const div = document.createElement("div");
  div.classList.add("message", "user-message");
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function sendMessage(payload) {
  fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => appendBotMessage(data.reply));
    if (data.showGoals) {
    document.getElementById("goal-menu").style.display = "grid";
  }
}