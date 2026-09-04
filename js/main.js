/* ==========================================================================
   THAAPAT CHAWAKIT (ถาปัตเฉพาะกิจ) - MAIN JAVASCRIPT CONTROLLER
   ========================================================================== */

let currentLang = 'th';
let activeCategory = 'all';
let activeProjectId = null;

document.addEventListener('DOMContentLoaded', () => {
  // Preloader Logic
  const preloader = document.getElementById('preloader');
  if (preloader) {
    // Wait for minimum time to show animation, plus page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => { preloader.style.display = 'none'; }, 800);
      }, 500);
    });
  }

  // Scroll Reveal Logic (Intersection Observer)
  window.revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  });

  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (revealElements.length > 0) {
    revealElements.forEach(el => window.revealObserver.observe(el));
  }


  initLanguageSwitcher();
  initMobileMenu();
  initHeroBgSlider();
  initProcessImageSlider();
  renderProjects('all');
  initProjectSwipe();
  renderTeam();
  initModalEvents();
  initContactForm();
  initScrollAnimations();
  
  if (typeof gsap !== 'undefined') {
    initCreativeAnimations();
  }
  
  // Set default language on load to override hardcoded HTML
  setLanguage(currentLang);
});

/* --------------------------------------------------------------------------
   MOBILE HAMBURGER MENU
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const menuWrapper = document.querySelector('.nav-menu-wrapper');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (toggleBtn && menuWrapper) {
    toggleBtn.addEventListener('click', () => {
      menuWrapper.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuWrapper.classList.remove('active');
      });
    });
  }
}

/* --------------------------------------------------------------------------
   HERO FULL BACKGROUND PHOTO SLIDER (Dynamic Crossfade Transition)
   -------------------------------------------------------------------------- */
function initHeroBgSlider() {
  const slides = document.querySelectorAll('.hero-bg-slider .bg-slide');
  if (!slides || slides.length === 0) return;

  let currentIndex = 0;
  setInterval(() => {
    slides[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].classList.add('active');
  }, 4200);
}

/* --------------------------------------------------------------------------
   WORK PROCESS 6-IMAGE AUTO FADE & HOVER SYNC SLIDER
   -------------------------------------------------------------------------- */
function initProcessImageSlider() {
  const slides = document.querySelectorAll('.process-step-slide');
  const cards = document.querySelectorAll('.process-step-card');
  if (!slides || slides.length === 0) return;

  let currentStep = 0;
  let autoTimer = null;

  function setActiveStep(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    cards.forEach((card, i) => {
      card.classList.toggle('active-step', i === index);
    });
    currentStep = index;
  }

  // Removed auto-cycle to prevent layout jumping
  // User must click or hover to change steps

  cards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
      setActiveStep(index);
    });
    // No mouseleave event to restart auto-cycle
    card.addEventListener('click', () => {
      setActiveStep(index);
    });
  });

  setActiveStep(0);
}

/* --------------------------------------------------------------------------
   LANGUAGE SWITCHER LOGIC (TH | EN)
   -------------------------------------------------------------------------- */
function initLanguageSwitcher() {
  const btnTh = document.getElementById('lang-th');
  const btnEn = document.getElementById('lang-en');

  if (btnTh) btnTh.addEventListener('click', () => setLanguage('th'));
  if (btnEn) btnEn.addEventListener('click', () => setLanguage('en'));
}

function setLanguage(lang) {
  currentLang = lang;
  
  // Update Active Class on Buttons
  document.getElementById('lang-th').classList.toggle('active', lang === 'th');
  document.getElementById('lang-en').classList.toggle('active', lang === 'en');
  
  // Update elements with data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });

  // Update form input placeholders with data-i18n-placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang] && translations[lang][key]) {
      el.setAttribute('placeholder', translations[lang][key]);
    }
  });

  // Re-render Dynamic Content
  renderProjects(activeCategory);
  renderTeam();

  // If a modal is open, re-render it in the new language
  const modal = document.getElementById('project-modal');
  if (modal && modal.classList.contains('open') && activeProjectId) {
    openProjectModal(activeProjectId);
  }
}

/* --------------------------------------------------------------------------
   PROJECT FEED & PAGINATION LOGIC (2 Projects Per Page Showcase)
   -------------------------------------------------------------------------- */
let currentProjectsPage = 1;
const PROJECTS_PER_PAGE = 2;

function renderProjects(category, page = currentProjectsPage) {
  activeCategory = category;
  currentProjectsPage = page;
  
  const container = document.getElementById('projects-container');
  const paginationContainer = document.getElementById('projects-pagination');
  if (!container) return;

  const dataset = (typeof realWorksData !== 'undefined' && realWorksData.length > 0) 
    ? realWorksData 
    : projectsData;

  const filtered = category === 'all' 
    ? dataset 
    : dataset.filter(p => p.category === category);

  const totalPages = Math.ceil(filtered.length / PROJECTS_PER_PAGE) || 1;
  if (currentProjectsPage > totalPages) currentProjectsPage = totalPages;
  if (currentProjectsPage < 1) currentProjectsPage = 1;

  const startIndex = (currentProjectsPage - 1) * PROJECTS_PER_PAGE;
  const pageItems = filtered.slice(startIndex, startIndex + PROJECTS_PER_PAGE);

  // Render Project Items (2 per page)
  container.innerHTML = pageItems.map(p => {
    const title = p.title[currentLang];
    const desc = p.desc[currentLang];

    return `
      <article class="project-list-item reveal-on-scroll is-visible" onclick="openProjectModal('${p.id}')">
        <div class="project-list-info">
          <h3 class="project-list-title">${title}</h3>
          <div class="project-list-meta">
            <span class="meta-label">STYLE</span>
            <span class="meta-value">${p.specs && p.specs[1] ? p.specs[1] : 'Architecture'}</span>
            <span class="meta-label">LOCATION</span>
            <span class="meta-value">${p.specs && p.specs[2] ? p.specs[2] : 'Thailand'}</span>
          </div>
          <span class="project-list-link">VIEW DETAILS ↗</span>
        </div>
        <div class="project-list-desc">
          <p>${desc}</p>
        </div>
        <div class="project-list-images">
          <img src="${p.gallery && p.gallery.length > 0 ? encodeURI(p.gallery[0]) : encodeURI(p.image)}" alt="${title}" loading="lazy" />
        </div>
      </article>
    `;
  }).join('');

  // Re-observe dynamically added reveal elements
  if (window.revealObserver) {
    container.querySelectorAll('.reveal-on-scroll').forEach(el => window.revealObserver.observe(el));
  }

  // Render Minimalist Pagination Controls
  if (paginationContainer) {
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      paginationContainer.style.display = 'none';
    } else {
      paginationContainer.style.display = 'flex';
      const t = translations[currentLang] || {};
      const prevText = t.projects_prev || 'PREV';
      const nextText = t.projects_next || 'NEXT';

      let numbersHtml = '';
      for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentProjectsPage ? 'active' : '';
        const numStr = String(i).padStart(2, '0');
        numbersHtml += `
          <button class="proj-page-num ${activeClass}" aria-label="Page ${i}" onclick="changeProjectPage(${i})">
            ${numStr}
          </button>
        `;
      }

      const curStr = String(currentProjectsPage).padStart(2, '0');
      const totStr = String(totalPages).padStart(2, '0');

      paginationContainer.innerHTML = `
        <button class="proj-page-btn prev-btn" ${currentProjectsPage === 1 ? 'disabled' : ''} onclick="changeProjectPage(${currentProjectsPage - 1})" aria-label="Previous Page">
          <span class="btn-arrow">←</span>
          <span class="btn-label">${prevText}</span>
        </button>

        <div class="proj-page-center">
          <div class="proj-page-numbers">
            ${numbersHtml}
          </div>
        </div>

        <button class="proj-page-btn next-btn" ${currentProjectsPage === totalPages ? 'disabled' : ''} onclick="changeProjectPage(${currentProjectsPage + 1})" aria-label="Next Page">
          <span class="btn-label">${nextText}</span>
          <span class="btn-arrow">→</span>
        </button>
      `;
    }
  }
}

// Global Page Navigation Function with smooth animation
window.changeProjectPage = function(newPage) {
  const container = document.getElementById('projects-container');
  if (!container || newPage === currentProjectsPage) return;

  container.classList.add('page-transitioning-out');

  setTimeout(() => {
    renderProjects(activeCategory, newPage);
    container.classList.remove('page-transitioning-out');
    container.classList.add('page-transitioning-in');

    // Smooth scroll back to #projects header if user scrolled past
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      const rect = projectsSection.getBoundingClientRect();
      if (rect.top < -50) {
        projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    setTimeout(() => {
      container.classList.remove('page-transitioning-in');
    }, 350);
  }, 200);
};

// Global Filter Helper
window.filterProjects = function(category) {
  currentProjectsPage = 1;
  renderProjects(category, 1);
};

// Mobile Touch Swipe Gesture Support
function initProjectSwipe() {
  const section = document.getElementById('projects');
  if (!section) return;

  let touchStartX = 0;
  let touchEndX = 0;

  section.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  section.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    const dataset = (typeof realWorksData !== 'undefined' && realWorksData.length > 0) 
      ? realWorksData 
      : projectsData;
    const totalPages = Math.ceil(dataset.length / PROJECTS_PER_PAGE) || 1;

    if (diff > 50 && currentProjectsPage < totalPages) {
      // Swiped Left -> Next Page
      changeProjectPage(currentProjectsPage + 1);
    } else if (diff < -50 && currentProjectsPage > 1) {
      // Swiped Right -> Prev Page
      changeProjectPage(currentProjectsPage - 1);
    }
  }
}

/* --------------------------------------------------------------------------
   ARCHITECT TEAM RENDER (Split 2-Column Layout matching User Diagram)
   -------------------------------------------------------------------------- */
function renderTeam() {
  const container = document.getElementById('team-container');
  if (!container) return;

  const leftMember = teamData.find(m => m.id === 'tonkla') || teamData[0];
  const centerMember = teamData.find(m => m.id === 'bom') || teamData[1];
  const rightMember = teamData.find(m => m.id === 'ta') || teamData[2];

  const t = translations[currentLang];

  container.innerHTML = `
    <div class="team-section-wrapper">
      
      <!-- TOP: 2-Column Split Team Photo & Origin Story -->
      <div class="team-split-grid">
        <div class="team-photo-column">
          <div class="team-photo-container" style="position: relative;">
            <img src="assets/architects_team.jpg" alt="Thapat Chaphokit Architects" class="team-full-img" />
            
            <!-- Hotspot 1: Tonkla (Left) -->
            <div class="architect-hotspot pos-left" data-id="tonkla">
              <div class="hotspot-pin"><div class="hotspot-pin-pulse"></div></div>
              <div class="architect-popup-card">
                <h4 class="popup-name">${leftMember.name[currentLang]}</h4>
                <span class="popup-role">${leftMember.role[currentLang]}</span>
                <p class="popup-desc">${leftMember.exp[currentLang]}</p>
              </div>
            </div>
            
            <!-- Hotspot 2: Bom (Center) -->
            <div class="architect-hotspot pos-center" data-id="bom">
              <div class="hotspot-pin"><div class="hotspot-pin-pulse"></div></div>
              <div class="architect-popup-card">
                <h4 class="popup-name">${centerMember.name[currentLang]}</h4>
                <span class="popup-role">${centerMember.role[currentLang]}</span>
                <p class="popup-desc">${centerMember.exp[currentLang]}</p>
              </div>
            </div>
            
            <!-- Hotspot 3: Ta (Right) -->
            <div class="architect-hotspot pos-right" data-id="ta">
              <div class="hotspot-pin"><div class="hotspot-pin-pulse"></div></div>
              <div class="architect-popup-card">
                <h4 class="popup-name">${rightMember.name[currentLang]}</h4>
                <span class="popup-role">${rightMember.role[currentLang]}</span>
                <p class="popup-desc">${rightMember.exp[currentLang]}</p>
              </div>
            </div>
            
          </div>
        </div>

        <div class="team-story-column">
          <span class="story-tag">${t.team_story_tag}</span>
          <h3 class="story-title">${t.team_story_title}</h3>
          <h4 class="story-subtitle">${t.team_story_sub}</h4>

          <div class="story-body">
            <p>${t.team_story_p1}</p>
            <p>${t.team_story_p2}</p>
          </div>

          <div class="story-values">
            <div class="value-item">
              <span class="value-num">01</span>
              <div>
                <h5 class="value-head">${t.val_1_title}</h5>
                <p class="value-desc">${t.val_1_desc}</p>
              </div>
            </div>

            <div class="value-item">
              <span class="value-num">02</span>
              <div>
                <h5 class="value-head">${t.val_2_title}</h5>
                <p class="value-desc">${t.val_2_desc}</p>
              </div>
            </div>
            
            <div class="value-item">
              <span class="value-num">03</span>
              <div>
                <h5 class="value-head">${t.val_3_title}</h5>
                <p class="value-desc">${t.val_3_desc}</p>
              </div>
            </div>

            <div class="value-item">
              <span class="value-num">04</span>
              <div>
                <h5 class="value-head">${t.val_4_title}</h5>
                <p class="value-desc">${t.val_4_desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  // Add click logic for hotspots (Mobile support & tap-to-show)
  const hotspots = container.querySelectorAll('.architect-hotspot');
  hotspots.forEach(spot => {
    spot.addEventListener('click', (e) => {
      // If clicking already active spot, toggle it off
      const isActive = spot.classList.contains('active');
      
      // Remove active from all
      hotspots.forEach(s => s.classList.remove('active'));
      
      // If it wasn't active before, make it active now
      if (!isActive) {
        spot.classList.add('active');
      }
    });
  });
}

window.toggleHotspot = function(element) {
  document.querySelectorAll('.architect-hotspot').forEach(el => {
    if (el !== element) el.classList.remove('active');
  });
  element.classList.toggle('active');
};

/* --------------------------------------------------------------------------
   INTERACTIVE PROJECT MODAL (Blueprint & Specs View)
   -------------------------------------------------------------------------- */
let currentGallery = [];
let currentGalleryIndex = 0;

function initModalEvents() {
  const backdrop = document.getElementById('project-modal');
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
    if (e.key === 'ArrowRight') nextGalleryImage();
    if (e.key === 'ArrowLeft') prevGalleryImage();
  });
}

window.openProjectModal = function(id) {
  activeProjectId = id;
  let project = null;
  // It could be in realWorksData if it's the main feed
  if (typeof realWorksData !== 'undefined') {
    project = realWorksData.find(p => p.id === id);
  }
  // Fallback to projectsData
  if (!project && typeof projectsData !== 'undefined') {
    project = projectsData.find(p => p.id === id);
  }
  if (!project) return;

  const modal = document.getElementById('project-modal');
  
  // Set up gallery array
  if (project.gallery && project.gallery.length > 0) {
    currentGallery = project.gallery.map(url => encodeURI(url));
  } else {
    currentGallery = [encodeURI(project.image)];
  }
  currentGalleryIndex = 0;
  
  // Cleanup any lingering images from previous animations
  const container = document.getElementById('fs-gallery-container');
  container.querySelectorAll('.fs-image').forEach((img, idx) => {
    if (idx > 0) img.remove();
  });
  
  const currentImg = container.querySelector('.fs-image');
  if (currentImg) {
    currentImg.id = 'fs-current-image';
    currentImg.src = currentGallery[currentGalleryIndex];
    currentImg.style.transform = 'translateX(0)';
    currentImg.classList.remove('sliding');
  }
  document.getElementById('fs-project-title').textContent = project.title[currentLang];
  
  let subtitle = "2026";
  if (project.specs && project.specs.length > 0) {
    subtitle = project.specs[0];
  }
  document.getElementById('fs-project-year').textContent = subtitle;
  
  let desc = project.details ? project.details[currentLang] : (project.desc ? project.desc[currentLang] : "");
  document.getElementById('fs-project-desc').textContent = desc;

  modal.style.display = 'flex';
  // Small delay to allow CSS transition if any
  setTimeout(() => { modal.style.opacity = 1; }, 50);
  document.body.style.overflow = 'hidden';
};

window.nextGalleryImage = function() {
  if (currentGallery.length <= 1) return;
  currentGalleryIndex = (currentGalleryIndex + 1) % currentGallery.length;
  slideGalleryImage('next');
};

window.prevGalleryImage = function() {
  if (currentGallery.length <= 1) return;
  currentGalleryIndex = (currentGalleryIndex - 1 + currentGallery.length) % currentGallery.length;
  slideGalleryImage('prev');
};

function slideGalleryImage(direction) {
  const container = document.getElementById('fs-gallery-container');
  const oldImg = document.getElementById('fs-current-image');
  
  if (oldImg.classList.contains('sliding')) return; // Prevent rapid clicking
  oldImg.classList.add('sliding');
  
  const newImg = document.createElement('img');
  newImg.className = 'fs-image';
  newImg.src = currentGallery[currentGalleryIndex];
  newImg.alt = "Project View";
  
  // Initial position off-screen
  if (direction === 'next') {
    newImg.style.transform = 'translateX(100%)';
  } else {
    newImg.style.transform = 'translateX(-100%)';
  }
  
  container.insertBefore(newImg, container.querySelector('.fs-overlay-gradient'));
  
  // Force reflow
  void newImg.offsetWidth;
  
  // Animate
  oldImg.style.transform = direction === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
  newImg.style.transform = 'translateX(0)';
  
  setTimeout(() => {
    oldImg.remove();
    newImg.id = 'fs-current-image';
  }, 600); // matches CSS transition duration
}

window.closeProjectModal = function() {
  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.style.display = 'none';
  }
  document.body.style.overflow = 'auto';
  activeProjectId = null;
};

/* --------------------------------------------------------------------------
   CONTACT FORM SUBMISSION LOGIC
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('inquiry-form');
  if (!form) return;

  // Let FormSubmit handle the actual submission to email
  // We don't preventDefault() here anymore so it can post to the action URL.
  form.addEventListener('submit', (e) => {
    // FormSubmit handles the success page and redirection
    // We just let the form submit normally
  });
}

/* --------------------------------------------------------------------------
   SCROLL REVEAL ANIMATIONS
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.project-card, .team-card, .dark-feature-section').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
  });
}

/* --------------------------------------------------------------------------
   FLOATING CONTACT MENU
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const floatingBtn = document.getElementById('floating-btn');
  const floatingWrapper = document.querySelector('.floating-contact-wrapper');
  
  if (floatingBtn && floatingWrapper) {
    floatingBtn.addEventListener('click', () => {
      floatingWrapper.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!floatingWrapper.contains(e.target)) {
        floatingWrapper.classList.remove('active');
      }
    });
  }
});

/* --------------------------------------------------------------------------
   CREATIVE GSAP ANIMATIONS (Shapes, Parallax, Mask Reveals)
   -------------------------------------------------------------------------- */
function initCreativeAnimations() {
  // 1. Continuous Floating (Sine Wave) for Shapes
  const shapes = document.querySelectorAll('.shape-element, .deco-element');
  shapes.forEach(shape => {
    // Randomize duration and y-distance for organic feel
    const randomDuration = 3 + Math.random() * 2;
    const randomY = 15 + Math.random() * 15;
    
    gsap.to(shape, {
      y: `+=${randomY}`,
      duration: randomDuration,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });
  });

  // 2. Scroll Parallax for Shapes
  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);
  
  shapes.forEach(shape => {
    const speed = shape.classList.contains('circle') ? -50 : 50; // Some move up, some move down
    
    gsap.to(shape, {
      yPercent: speed,
      ease: "none",
      scrollTrigger: {
        trigger: shape,
        start: "top bottom", 
        end: "bottom top",
        scrub: true
      }
    });
  });

  // 3. Text Mask Reveals (Rising Text)
  const titles = document.querySelectorAll('.hero-title-main, .hero-title-sub, .section-title, .story-title');
  titles.forEach(title => {
    // Initial state: hidden via clip-path
    gsap.set(title, { 
      clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
      y: 40
    });

    gsap.to(title, {
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      y: 0,
      duration: 1.2,
      ease: "power4.out",
      scrollTrigger: {
        trigger: title,
        start: "top 85%",
      }
    });
  });

  // 4. Upgrade #process Interactions
  const processCards = document.querySelectorAll('.process-step-card');
  const processImages = document.querySelectorAll('.process-step-slide');
  const processDeco = document.querySelector('.section-process .deco-element');

  processCards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
      // Scale down image slightly for depth
      const activeImg = processImages[index];
      if (activeImg) {
        gsap.fromTo(activeImg, 
          { scale: 1.05 }, 
          { scale: 1, duration: 0.8, ease: "power2.out" }
        );
      }
      
      // Pop the deco shape
      if (processDeco) {
        gsap.fromTo(processDeco,
          { scale: 0.8, rotation: -10 },
          { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)" }
        );
      }
    });
  });

  // 5. Custom Interactive Cursor (Desktop Only)
  if (window.innerWidth > 768) {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };
    const speed = 0.2;

    const xSet = gsap.quickSetter(cursor, "x", "px");
    const ySet = gsap.quickSetter(cursor, "y", "px");

    window.addEventListener("pointermove", e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    gsap.ticker.add(() => {
      // Lerp for smooth following
      const dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio());
      pos.x += (mouse.x - pos.x) * dt;
      pos.y += (mouse.y - pos.y) * dt;
      xSet(pos.x);
      ySet(pos.y);
    });

    // Cursor Hover States
    const interactables = document.querySelectorAll('a, button, .project-list-item, .architect-hotspot');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
    
    // Magnetic Buttons
    const magnets = document.querySelectorAll('.floating-contact-btn, .lang-btn');
    magnets.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const h = rect.width / 2;
        const x = e.clientX - rect.left - h;
        const y = e.clientY - rect.top - h;
        gsap.to(btn, {
          x: x * 0.4,
          y: y * 0.4,
          duration: 0.4,
          ease: "power2.out"
        });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.3)"
        });
      });
    });
  }
}
