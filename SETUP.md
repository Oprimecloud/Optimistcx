# Quick Setup Guide - OptimistCx

## Step 1: Customize Basic Information

### Update Company Name & Logo
In `index-professional.html`, find the logo section:

```html
<!-- Line ~50 -->
<div class="logo">
    <span class="logo-text">OptimistCx</span>
</div>
```

Change to your company name:
```html
<div class="logo">
    <span class="logo-text">Your Company Name</span>
</div>
```

### Update Hero Section
Find and update the hero title, subtitle, and CTA text:

```html
<!-- Lines ~120-130 -->
<h1 class="hero-title">Transform Your Business with <span class="highlight">Digital Excellence</span></h1>
<p class="hero-subtitle">Award-winning digital agency...</p>
```

## Step 2: Customize Services

Edit the 6 service cards in the services section. Each card includes:

```html
<div class="service-card">
    <div class="service-icon">
        <!-- SVG icon -->
    </div>
    <h3>Service Title</h3>
    <p>Service description...</p>
    <ul class="features-list">
        <li>✓ Feature 1</li>
        <!-- More features -->
    </ul>
    <a href="#" class="learn-more">Learn More →</a>
</div>
```

## Step 3: Add Portfolio/Case Studies

Replace example portfolio items with your real projects:

```html
<div class="portfolio-item">
    <div class="portfolio-image">
        <img src="your-image.jpg" alt="Project Name" />
    </div>
    <div class="portfolio-content">
        <h3>Project Name</h3>
        <p class="client-name">Client Name</p>
        <div class="portfolio-metrics">
            <div class="metric">
                <span class="metric-value">250%</span>
                <span class="metric-label">Growth</span>
            </div>
            <!-- More metrics -->
        </div>
        <p class="portfolio-description">Project description...</p>
    </div>
</div>
```

## Step 4: Update Testimonials

Replace testimonial cards with real client feedback:

```html
<div class="testimonial-card">
    <div class="stars">★★★★★</div>
    <p class="testimonial-text">"Your testimonial text here..."</p>
    <div class="testimonial-author">
        <div class="author-avatar">JD</div>
        <div class="author-info">
            <h4>John Doe</h4>
            <p>CEO, Company Name</p>
        </div>
    </div>
</div>
```

## Step 5: Update Contact Information

Find the contact section and update:

```html
<!-- Phone -->
<p><a href="tel:+2348145903277">+234 814 590 3277</a></p>

<!-- Email -->
<p><a href="mailto:info@optimistcx.com">info@optimistcx.com</a></p>

<!-- Address -->
<p>8 Merciful Avenue<br />Alimosho, Ikeja<br />Lagos, Nigeria</p>

<!-- Hours -->
<p>Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM<br />Sunday: Closed</p>
```

## Step 6: Add Social Media Links

Update the social links in the contact section:

```html
<div class="social-links">
    <a href="https://facebook.com/yourpage" title="Facebook">f</a>
    <a href="https://twitter.com/yourhandle" title="Twitter">𝕏</a>
    <a href="https://linkedin.com/company/yours" title="LinkedIn">in</a>
    <a href="https://instagram.com/yourpage" title="Instagram">◉</a>
</div>
```

## Step 7: Color Customization

### Primary Color
The main brand color (#2563eb - Blue) is used throughout. To change it:

1. Open `styles.css`
2. Find all instances of `#2563eb` and `#1d4ed8`
3. Replace with your brand colors

Example:
```css
/* Original */
background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);

/* Updated */
background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
```

### Secondary Colors
- Success/Green: `#10b981`
- Warning/Orange: `#f59e0b`
- Error/Red: `#ef4444`

## Step 8: Blog Content

Add your blog articles:

```html
<article class="blog-card">
    <div class="blog-image">
        <img src="article-image.jpg" alt="Article Title" />
    </div>
    <div class="blog-content">
        <span class="blog-date">December 4, 2024</span>
        <h3>Your Article Title</h3>
        <p>Article preview text...</p>
        <a href="/blog/article-slug" class="read-more">Read Article →</a>
    </div>
</article>
```

## Step 9: Images

### Recommended Image Sizes
- Hero image: 1200x900px
- Service card images: 600x400px
- Portfolio images: 600x400px
- Blog images: 800x500px
- Team photos: 400x400px

### Image Optimization
```html
<!-- Use optimized images -->
<img src="image.jpg" alt="Descriptive text" 
     loading="lazy" 
     width="600" 
     height="400" />
```

## Step 10: Form Setup

To connect the contact form to email:

### Option 1: Using FormSubmit.co (Free)
```javascript
// In the form tag, add:
<form action="https://formsubmit.co/your-email@gmail.com" method="POST">
    <!-- Your form fields -->
</form>
```

### Option 2: Using EmailJS
```javascript
// Add to script.js
emailjs.init('YOUR_PUBLIC_KEY');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    emailjs.sendForm('service_id', 'template_id', this)
        .then(() => showNotification('Email sent!', 'success'))
        .catch(() => showNotification('Error sending email', 'error'));
});
```

### Option 3: Backend API
```javascript
// Update in script.js
fetch('your-api-endpoint', {
    method: 'POST',
    body: new FormData(this)
})
.then(response => response.json())
.then(data => showNotification('Success!', 'success'))
.catch(error => showNotification('Error', 'error'));
```

## Step 11: Analytics Setup

Add Google Analytics:

```html
<!-- Add before closing </head> tag -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Step 12: SEO Setup

### Update Meta Tags
In the HTML `<head>`:

```html
<meta name="description" content="Your company description for SEO" />
<meta name="keywords" content="keyword1, keyword2, keyword3" />
<meta property="og:title" content="Your Site Title" />
<meta property="og:description" content="Description for social sharing" />
```

### Add Schema Markup
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "OptimistCx",
  "url": "https://yourwebsite.com",
  "logo": "https://yourwebsite.com/logo.png",
  "email": "info@yourcompany.com",
  "telephone": "+234814590327"
}
</script>
```

## Step 13: Testing Checklist

Before going live, test:

- [ ] All links work correctly
- [ ] Forms submit properly
- [ ] Mobile responsiveness (test on real devices)
- [ ] Images load correctly
- [ ] Navigation works smoothly
- [ ] Animations display properly
- [ ] Forms validate correctly
- [ ] Contact information is accurate
- [ ] Social media links are correct
- [ ] Page load time is acceptable
- [ ] No console errors in browser dev tools
- [ ] Accessibility (use WAVE tool)
- [ ] SEO (use Lighthouse audit)

## Step 14: Deployment

### Option 1: Netlify (Recommended)
1. Create Netlify account
2. Connect GitHub repository
3. Deploy button will appear
4. Custom domain setup

### Option 2: Vercel
1. Create Vercel account
2. Import project
3. Auto-deploys on git push
4. Easy custom domain

### Option 3: Traditional Hosting
1. FTP files to server
2. Set up custom domain
3. Configure SSL/HTTPS

## Quick Customization Checklist

Use this checklist for your setup:

```
Setup Tasks:
- [ ] Update company name and logo
- [ ] Update hero section content
- [ ] Update services (6 cards)
- [ ] Add portfolio items (3 minimum)
- [ ] Update testimonials
- [ ] Update contact information
- [ ] Add social media links
- [ ] Update color scheme (if needed)
- [ ] Compress and optimize images
- [ ] Setup form handling
- [ ] Add analytics
- [ ] Update meta/SEO tags
- [ ] Test responsiveness
- [ ] Deploy to live server
```

## Common Customizations

### Change Primary Color
Find this in `styles.css`:
```css
/* All gradient references use these colors */
linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)
```

Replace `#2563eb` with your primary color (6-digit hex code).

### Add More Services
Duplicate a service card and update the content:
```html
<div class="service-card">
    <!-- Copy and modify -->
</div>
```

### Change Font
In HTML head, replace the Google Fonts link:
```html
<!-- Current -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

<!-- New font -->
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@400;600;700&display=swap" rel="stylesheet" />
```

### Disable Animations
In `styles.css`, find animation sections and set duration to 0:
```css
animation-duration: 0s; /* Instead of 0.6s */
```

## Support & Troubleshooting

### Images Not Loading
- Check image paths are correct
- Ensure images are in the right directory
- Use absolute paths if relative paths don't work

### Form Not Working
- Check browser console for errors
- Verify form action URL
- Test with simple email service first

### Styling Issues
- Clear browser cache (Ctrl+Shift+Delete)
- Check CSS file is linked correctly
- Look for CSS conflicts in browser dev tools

### Navigation Not Working
- Check anchor links match section IDs
- Verify no typos in href attributes
- Test in different browser

## Resources

- [Google Fonts](https://fonts.google.com)
- [Color Picker](https://htmlcolorcodes.com)
- [Image Compressor](https://tinypng.com)
- [Lighthouse Audit](https://developers.google.com/web/tools/lighthouse)
- [WAVE Accessibility](https://wave.webaim.org)

---

Need help? Check the main README.md or contact support!
