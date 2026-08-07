/* ==========================================================================
   THAAPAT CHAWAKIT (ถาปัตเฉพาะกิจ) - MAIN JAVASCRIPT CONTROLLER
   ========================================================================== */

let currentLang = 'th';
let activeCategory = 'all';
let activeProjectId = null;

document.addEventListener('DOMContentLoaded', () => {
  initLanguageSwitcher();
  initHeroBgSlider();
  initProcessImageSlider();
  renderProjects('all');
  renderTeam();
  initModalEvents();
  initContactForm();
  initScrollAnimations();
  
  // Set default language on load to override hardcoded HTML
  setLanguage(currentLang);
});

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

  function startAutoCycle() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      const nextIndex = (currentStep + 1) % slides.length;
      setActiveStep(nextIndex);
    }, 4000);
  }

  // Hovering on right step card triggers that step image immediately
  cards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
      clearInterval(autoTimer);
      setActiveStep(index);
    });
    card.addEventListener('mouseleave', () => {
      startAutoCycle();
    });
    card.addEventListener('click', () => {
      setActiveStep(index);
    });
  });

  setActiveStep(0);
  startAutoCycle();
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
   PROJECT FEED & FILTERING LOGIC (Using Real Project Renders)
   -------------------------------------------------------------------------- */
function renderProjects(category) {
  activeCategory = category;
  const container = document.getElementById('projects-container');
  if (!container) return;

  const dataset = (typeof realWorksData !== 'undefined' && realWorksData.length > 0) 
    ? realWorksData 
    : projectsData;

  const filtered = category === 'all' 
    ? dataset 
    : dataset.filter(p => p.category === category);

  container.innerHTML = filtered.map(p => {
    const title = p.title[currentLang];
    const desc = p.desc[currentLang];
    const learnText = translations[currentLang].cta_start_project;

    return `
      <article class="project-card">
        <img src="${p.image}" alt="${title}" class="project-img" loading="lazy" />
        <div class="project-overlay-card">
          <h3 class="project-card_title">${title}</h3>
          <p class="project-card_desc">${desc}</p>
          <a href="#contact" class="project-link-btn">
            ${learnText}
          </a>
        </div>
      </article>
    `;
  }).join('');
}

// Global Filter Helper
window.filterProjects = function(category) {
  renderProjects(category);
};

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
function initModalEvents() {
  const backdrop = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeProjectModal);
  }

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeProjectModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
  });
}

window.openProjectModal = function(id) {
  activeProjectId = id;
  const project = projectsData.find(p => p.id === id);
  if (!project) return;

  const modal = document.getElementById('project-modal');
  const content = document.getElementById('modal-content-body');
  const title = project.title[currentLang];
  const details = project.details[currentLang];
  const blueprintTitle = translations[currentLang].modal_blueprint_title;
  const materialsTitle = translations[currentLang].modal_materials_title;

  content.innerHTML = `
    <h2 class="modal-title">${title}</h2>
    <div class="modal-specs">
      ${project.specs.map(s => `<span class="tag-badge">${s}</span>`).join('')}
    </div>
    
    <div class="modal-body-grid">
      <div class="modal-img-box">
        <img src="${project.image}" alt="${title}" />
      </div>
      <div class="modal-info-box">
        <h4>${materialsTitle}</h4>
        <p>${details}</p>
        
        <h4>${blueprintTitle}</h4>
        <div class="modal-img-box">
          <img src="${project.blueprint}" alt="Blueprint" />
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeProjectModal = function() {
  const modal = document.getElementById('project-modal');
  if (modal) modal.classList.remove('open');
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
