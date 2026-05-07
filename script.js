/**
 * ============================================================================
 * JOLLY WEBSITE - MAIN JAVASCRIPT
 * ============================================================================
 * This file handles all the interactive functionality of the website.
 * It reads content from content.js and renders it to the page.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', function() {
  initializeSite();
});

function initializeSite() {
  loadContent();
  initNavigation();
  initSmoothScroll();
  initContactForm();
  setCurrentYear();
}

/**
 * Load content from SITE_CONTENT and render to the page
 */
function loadContent() {
  const content = SITE_CONTENT;
  
  loadBrandContent(content.brand);
  loadContactContent(content.contact);
  loadProducts(content.products);
  loadCustomServices(content.customServices);
  loadAboutContent(content.about);
  loadFooterContent(content.footer, content.brand, content.contact);
}

/**
 * Load brand information into hero and nav
 */
function loadBrandContent(brand) {
  const heroLogo = document.getElementById('hero-logo');
  const navLogoImg = document.getElementById('nav-logo-img');
  const navBrandName = document.getElementById('nav-brand-name');
  const heroTagline = document.getElementById('hero-tagline');
  const heroDescription = document.getElementById('hero-description');
  
  if (brand.logo) {
    heroLogo.src = brand.logo;
    heroLogo.alt = brand.name;
    navLogoImg.src = brand.logo;
    navLogoImg.alt = brand.name;
    navLogoImg.style.display = 'block';
    navBrandName.style.display = 'none';
  } else {
    heroLogo.style.display = 'none';
    navLogoImg.style.display = 'none';
    navBrandName.textContent = brand.name;
  }
  
  heroTagline.textContent = brand.tagline;
  heroDescription.textContent = brand.description;
}

/**
 * Load contact information
 */
function loadContactContent(contact) {
  document.getElementById('contact-phone').textContent = contact.phone;
  document.getElementById('contact-email').textContent = contact.email;
  document.getElementById('contact-address').textContent = contact.address;
  document.getElementById('contact-hours').textContent = contact.businessHours;
  
  document.getElementById('social-facebook').href = contact.facebook;
  document.getElementById('social-instagram').href = contact.instagram;
  
  const emailLink = document.getElementById('email-link');
  emailLink.href = 'mailto:' + contact.email;
  emailLink.textContent = contact.email;
}

/**
 * Render product cards
 */
function loadProducts(products) {
  const productsGrid = document.getElementById('products-grid');
  productsGrid.innerHTML = '';
  
  products.forEach((product, index) => {
    if (!product.isActive) return;
    
    const card = createProductCard(product, index);
    productsGrid.appendChild(card);
  });
}

/**
 * Create a single product card
 */
function createProductCard(product, index) {
  const card = document.createElement('div');
  card.className = 'product-card' + (product.name === 'Coming Soon' ? ' coming-soon' : '');
  
  if (product.name === 'Coming Soon') {
    card.innerHTML = `
      <div class="product-placeholder">👕</div>
      <div class="coming-soon-text">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
      </div>
    `;
    return card;
  }
  
  let sizingTableHTML = '';
  if (product.sizes && product.sizes.length > 0) {
    sizingTableHTML = `
      <div class="sizing-table-wrapper">
        <table class="sizing-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Width</th>
              <th>Length</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${product.sizes.map(s => `
              <tr>
                <td>${s.size}</td>
                <td>${s.width}"</td>
                <td>${s.length}"</td>
                <td>₱${s.price.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  card.innerHTML = `
    <img 
      src="${product.image}" 
      alt="${product.name}" 
      class="product-image"
      onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
    >
    <div class="product-placeholder" style="display: none;">👕</div>
    <div class="product-content">
      <h3 class="product-name">${product.name}</h3>
      <p class="product-description">${product.description}</p>
      
      <div class="product-meta">
        <p><strong>Minimum Order:</strong> ${product.minimumOrder}</p>
        <p><strong>Payment Terms:</strong> ${product.paymentTerms}</p>
        ${product.effectivityDate ? `<p><strong>Effectivity:</strong> ${product.effectivityDate}</p>` : ''}
      </div>
      
      ${sizingTableHTML}
      
      <a href="#contact" class="btn btn-primary btn-sm btn-full">Inquire Now</a>
    </div>
  `;
  
  return card;
}

/**
 * Load custom services section
 */
function loadCustomServices(customServices) {
  document.getElementById('custom-title').textContent = customServices.title;
  document.getElementById('custom-description').textContent = customServices.description;
  
  const servicesList = document.getElementById('services-list');
  servicesList.innerHTML = customServices.services.map(service => 
    `<span class="service-tag">${service}</span>`
  ).join('');
  
  const samplesGrid = document.getElementById('samples-grid');
  samplesGrid.innerHTML = customServices.sampleImages.map((img, i) => `
    <img 
      src="${img}" 
      alt="Custom design sample ${i + 1}" 
      class="sample-image"
      onerror="this.style.display='none'; this.insertAdjacentHTML('afterend', '<div class=\\'sample-placeholder\\'>🎨</div>');"
    >
  `).join('');
}

/**
 * Load about section content
 */
function loadAboutContent(about) {
  document.getElementById('about-title').textContent = about.title;
  document.getElementById('about-description').textContent = about.description;
  
  const highlightsGrid = document.getElementById('highlights-grid');
  highlightsGrid.innerHTML = about.highlights.map(highlight => `
    <div class="highlight-card">
      <div class="highlight-icon">${highlight.icon}</div>
      <h3 class="highlight-title">${highlight.title}</h3>
      <p class="highlight-description">${highlight.description}</p>
    </div>
  `).join('');
}

/**
 * Load footer content
 */
function loadFooterContent(footer, brand, contact) {
  const footerLogo = document.getElementById('footer-logo');
  if (brand.logo) {
    footerLogo.src = brand.logo;
    footerLogo.alt = brand.name;
  } else {
    footerLogo.style.display = 'none';
  }
  
  document.getElementById('footer-tagline').textContent = brand.tagline;
  document.getElementById('copyright-text').textContent = footer.copyrightText;
  
  document.getElementById('footer-facebook').href = contact.facebook;
  document.getElementById('footer-instagram').href = contact.instagram;
}

/**
 * Initialize mobile navigation toggle
 */
function initNavigation() {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navbar = document.getElementById('navbar');
  
  navToggle.addEventListener('click', function() {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
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
}

/**
 * Initialize contact form handling
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const email = SITE_CONTENT.contact.email;
  
  const formAction = form.getAttribute('action');
  if (formAction.includes('[YOUR-FORM-ID]')) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = form.querySelector('#name').value;
      const emailVal = form.querySelector('#email').value;
      const phone = form.querySelector('#phone').value;
      const message = form.querySelector('#message').value;
      
      const subject = encodeURIComponent('Inquiry from ' + name);
      const body = encodeURIComponent(
        `Name: ${name}\n` +
        `Email: ${emailVal}\n` +
        `Phone: ${phone || 'Not provided'}\n\n` +
        `Message:\n${message}`
      );
      
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    });
  }
}

/**
 * Set current year in footer
 */
function setCurrentYear() {
  document.getElementById('current-year').textContent = new Date().getFullYear();
}
