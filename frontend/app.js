/* ==========================================================================
   SkillForge AI — Interactive Node-and-Edge Graph & Workspace Logic
   ========================================================================== */

function refreshLucideIcons() {
  if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }
}
refreshLucideIcons();
document.addEventListener('DOMContentLoaded', refreshLucideIcons);
window.addEventListener('load', refreshLucideIcons);

if (typeof Lenis !== 'undefined') {
  const lenis = new Lenis({
    lerp: 0.04, // Ultra smooth inertia interpolation
    smoothWheel: true,
    wheelMultiplier: 0.8, // Slightly softer wheel
  });
  window.lenis = lenis;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
}

function toggleFaq(el) {
  const wasOpen = el.classList.contains('open');

  document.querySelectorAll('.faq-card-box').forEach(card => {
    card.classList.remove('open');
    const sign = card.querySelector('.faq-icon-sign');
    if (sign) sign.textContent = '+';
  });

  if (!wasOpen) {
    el.classList.add('open');
    const sign = el.querySelector('.faq-icon-sign');
    if (sign) sign.textContent = '✕';
  }
}

// Global Node State for Graph Animation
window.completedNodes = new Set();
window.activeHoverNode = null;

function initLandingPage() {
  // ================================================================
  // 1. GSAP BIDIRECTIONAL SCROLL REVEAL ENGINE (SCROLL DOWN & UP)
  // ================================================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach((el) => {
      let xOffset = 0;
      let yOffset = 40;
      let scaleVal = 1;

      if (el.classList.contains('reveal-fade-left')) {
        xOffset = -45;
        yOffset = 0;
      } else if (el.classList.contains('reveal-fade-right')) {
        xOffset = 45;
        yOffset = 0;
      } else if (el.classList.contains('reveal-zoom-in')) {
        scaleVal = 0.94;
        yOffset = 25;
      }

      let delay = 0;
      if (el.classList.contains('stagger-1')) delay = 0.08;
      else if (el.classList.contains('stagger-2')) delay = 0.16;
      else if (el.classList.contains('stagger-3')) delay = 0.24;
      else if (el.classList.contains('stagger-4')) delay = 0.32;

      gsap.fromTo(el,
        {
          opacity: 0,
          x: xOffset,
          y: yOffset,
          scale: scaleVal
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.85,
          delay: delay,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            end: "bottom 10%",
            toggleActions: "play reverse play reverse",
            invalidateOnRefresh: true
          }
        }
      );
    });

    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
    setTimeout(() => ScrollTrigger.refresh(), 300);
  }

  // ================================================================
  // 2. STICKY NAV & SCROLL-TO-TOP DYNAMIC SCROLL LISTENER
  // ================================================================
  const stickyNav = document.getElementById('stickyNav');
  const scrollTopBtn = document.getElementById('scrollToTopBtn');

  function handleScrollState() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    
    // Sticky Nav
    if (stickyNav) {
      if (scrollY > 320) {
        stickyNav.classList.add('visible');
      } else {
        stickyNav.classList.remove('visible');
      }
    }

    // Scroll to Top Button
    if (scrollTopBtn) {
      if (scrollY > 400) {
        scrollTopBtn.classList.add('visible');
        scrollTopBtn.style.opacity = '1';
        scrollTopBtn.style.pointerEvents = 'auto';
        scrollTopBtn.style.transform = 'translateY(0)';
      } else {
        scrollTopBtn.classList.remove('visible');
        scrollTopBtn.style.opacity = '0';
        scrollTopBtn.style.pointerEvents = 'none';
        scrollTopBtn.style.transform = 'translateY(12px)';
      }
    }
  }

  window.addEventListener('scroll', handleScrollState, { passive: true });
  handleScrollState();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      if (window.lenis) {
        window.lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // ==========================================
  // 3. Dynamic Login/Dashboard Button Logic
  // ==========================================
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const userName = user.name || user.displayName || 'Profile';
      const userPhoto = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=7C3AED&color=ffffff&bold=true&rounded=true`;

      const stickyBtn = document.getElementById('stickyLoginBtn');
      const heroBtn = document.getElementById('heroLoginBtn');

      const profileHtml = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="${userPhoto}" referrerpolicy="no-referrer" crossorigin="anonymous" alt="${userName}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1.5px solid #FFF;" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=7C3AED&color=ffffff&bold=true&rounded=true';">
          <span style="font-weight: 700;">${userName.split(' ')[0]}</span>
        </div>
      `;

      if (stickyBtn) {
        stickyBtn.href = "dashboard.html";
        stickyBtn.innerHTML = profileHtml;
      }

      if (heroBtn) {
        heroBtn.href = "dashboard.html";
        heroBtn.innerHTML = profileHtml;
      }

      // Redirect all other auth buttons to Dashboard
      const authLinks = document.querySelectorAll('a[href="login.html"], a[href="register.html"]');
      authLinks.forEach(link => {
        link.href = "dashboard.html";
        const text = link.textContent.trim().toLowerCase();
        if (text === 'login' || text === 'sign in' || text === 'sign up') {
          link.textContent = "Dashboard";
        }
      });
    } catch (e) {
      console.error("Error parsing stored user:", e);
    }
  }

  const genForm = document.getElementById('dashboardGenForm');
  const workspace = document.getElementById('dashboardWorkspace');

  if (genForm && workspace) {
    genForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const skillsInput = document.getElementById('dashSkillsInput');
      const roleInput = document.getElementById('dashRoleInput');

      const currentSkills = skillsInput ? skillsInput.value.trim() : '';
      const targetRole = roleInput ? roleInput.value.trim() : '';

      if (!targetRole) {
        alert('Please select a target career role from the dropdown menu!');
        return;
      }

      workspace.innerHTML = `
        <div style="background: rgba(24, 24, 29, 0.9); border: 1px solid rgba(139,92,246,0.3); border-radius: 24px; padding: 60px 20px; text-align: center;">
          <h3 style="color: #FFF; font-size: 1.4rem; margin-bottom: 8px;">Architecting ${targetRole} Node Graph...</h3>
          <p style="color: rgba(255,255,255,0.7); font-size: 0.95rem;">Building interactive SVG topology and metacognitive audit engine.</p>
        </div>
      `;

      try {
        const roadmapApiUrl = (window.SKILLFORGE_CONFIG && window.SKILLFORGE_CONFIG.ROADMAP_API) 
          ? `${window.SKILLFORGE_CONFIG.ROADMAP_API}/generate` 
          : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
              ? 'http://localhost:5000/api/roadmaps/generate' 
              : 'https://skillforge-ai-backend-bbho.onrender.com/api/roadmaps/generate');
        const response = await fetch(roadmapApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentSkills, targetRole })
        });

        const resData = await response.json();
        
        if (resData && resData.success) {
          renderNodeEdgeWorkspace(resData.data, resData.source);
        } else {
          renderFallbackRoadmap(targetRole, currentSkills);
        }
      } catch (err) {
        console.error("Roadmap generation error:", err);
        renderFallbackRoadmap(targetRole, currentSkills);
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLandingPage);
} else {
  initLandingPage();
}

// FEATURE 2.1: INTERACTIVE NODE-AND-EDGE GRAPH ROADMAP RENDERER
function renderNodeEdgeWorkspace(data, source) {
  const workspace = document.getElementById('dashboardWorkspace');
  if (!workspace) return;

  window.roadmapNodesData = data.milestones;

  workspace.innerHTML = `
    <div style="background: rgba(24, 24, 29, 0.95); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 24px; padding: 36px 32px;">
      
      <!-- HEADER SUMMARY -->
      <div style="margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.12);">
        <div style="font-size: 0.8rem; color: var(--purple-glow); font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">
          ${source || 'SkillForge Metacognitive AI Engine'}
        </div>
        <h2 style="font-size: 2rem; color: #FFF; font-family: var(--font-heading); margin-bottom: 8px;">${data.title}</h2>
        <p style="color: rgba(255,255,255,0.75); font-size: 1rem;">${data.summary}</p>
      </div>

      <!-- FEATURE 2.1: VISUAL NODE & EDGE INTERACTIVE SVG GRAPH -->
      <div style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 1.35rem; color: #FFF; font-family: var(--font-heading); margin: 0;">
          Interactive Node Topology (Hover/Tap Node for Overview)
        </h3>
        <span style="font-size: 0.8rem; background: rgba(139,92,246,0.25); color: #C4B5FD; padding: 4px 14px; border-radius: 999px; font-weight: 700;">
          FEATURE 2.1 VISUAL GRAPH
        </span>
      </div>

      <div class="roadmap-graph-container" id="graphContainer">
        <!-- FLOATING TOPIC OVERVIEW TOOLTIP CARD -->
        <div class="node-overview-card" id="nodeOverviewTooltip">
          <div id="tooltipContent">Hover or click any node to see topic overview</div>
        </div>

        <svg class="graph-svg-canvas" viewBox="0 0 900 240" preserveAspectRatio="xMidYMid meet">
          <!-- CONNECTING EDGE LINES -->
          <path id="edge-1-2" class="graph-edge-line" d="M 160 120 L 450 120" />
          <path id="edge-2-3" class="graph-edge-line" d="M 450 120 L 740 120" />

          <!-- NODE 1 -->
          <g class="node-group" id="node-group-1" onmouseenter="showNodeOverview(1, event)" onmouseleave="hideNodeOverview()" onclick="toggleNodeComplete(1)">
            <circle class="node-circle" id="circle-1" cx="160" cy="120" r="42" />
            <text x="160" y="115" text-anchor="middle" fill="#FFFFFF" font-weight="800" font-size="14">NODE 1</text>
            <text x="160" y="135" text-anchor="middle" fill="#C4B5FD" font-size="11">Foundation</text>
          </g>

          <!-- NODE 2 -->
          <g class="node-group" id="node-group-2" onmouseenter="showNodeOverview(2, event)" onmouseleave="hideNodeOverview()" onclick="toggleNodeComplete(2)">
            <circle class="node-circle" id="circle-2" cx="450" cy="120" r="42" />
            <text x="450" y="115" text-anchor="middle" fill="#FFFFFF" font-weight="800" font-size="14">NODE 2</text>
            <text x="450" y="135" text-anchor="middle" fill="#C4B5FD" font-size="11">Architecture</text>
          </g>

          <!-- NODE 3 -->
          <g class="node-group" id="node-group-3" onmouseenter="showNodeOverview(3, event)" onmouseleave="hideNodeOverview()" onclick="toggleNodeComplete(3)">
            <circle class="node-circle" id="circle-3" cx="740" cy="120" r="42" />
            <text x="740" y="115" text-anchor="middle" fill="#FFFFFF" font-weight="800" font-size="14">NODE 3</text>
            <text x="740" y="135" text-anchor="middle" fill="#C4B5FD" font-size="11">Capstone</text>
          </g>
        </svg>

        <div style="text-align: center; font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <svg style="width: 15px; height: 15px; color: #A78BFA;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          <span>Click any node circle above to trigger animated completion & unlock the connecting edge path!</span>
        </div>
      </div>

      <!-- DETAILED MILESTONE CARDS WITH INTERACTIVE COMPLETION BUTTON -->
      ${data.milestones.map(m => `
        <div id="milestone-card-${m.step}" style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 18px; padding: 24px; margin-bottom: 20px; transition: all 0.4s ease;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <h4 style="font-size: 1.2rem; color: #FFF; font-family: var(--font-heading);">Step ${m.step}: ${m.title}</h4>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="background: var(--purple-primary); color: #FFF; font-size: 0.8rem; font-weight: 700; padding: 4px 14px; border-radius: 9999px;">${m.duration}</span>
              <button onclick="toggleNodeComplete(${m.step})" class="btn-pill btn-purple" style="padding: 6px 14px; font-size: 0.78rem;">
                Mark Node ${m.step} Complete
              </button>
            </div>
          </div>
          <p style="font-size: 0.95rem; color: rgba(255,255,255,0.75); margin-bottom: 14px;">${m.description}</p>
          
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${(m.topics || ['Architecture Fundamentals', 'Git Workflows']).map(t => `<span class="node-topic-badge">${t}</span>`).join('')}
          </div>
        </div>
      `).join('')}

      <!-- FEATURE #2 METACOGNITIVE AUDIT SUITE -->
      <div style="background: rgba(124, 58, 237, 0.08); border: 1px solid rgba(124, 58, 237, 0.35); border-radius: 24px; padding: 32px; margin-top: 36px;">
        <div style="font-size: 0.75rem; background: rgba(139,92,246,0.3); color: var(--purple-glow); padding: 4px 12px; border-radius: 999px; font-weight: 700; display: inline-block; margin-bottom: 10px;">
          FEATURE #2 ACTIVE AUDIT
        </div>
        <h3 style="font-size: 1.4rem; color: #FFF; font-family: var(--font-heading); margin-bottom: 20px;">Metacognitive Skill Gap & Confidence-Calibration Audit</h3>
        
        ${data.diagnosticQuiz ? data.diagnosticQuiz.map(q => `
          <div style="background: rgba(20, 16, 36, 0.7); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px; padding: 24px; margin-bottom: 24px;">
            <div style="font-size: 0.8rem; color: var(--purple-glow); font-weight: 700; margin-bottom: 6px;">Topic: ${q.topic || 'Core Concept'}</div>
            <p style="font-size: 1.05rem; color: #FFF; font-weight: 600; margin-bottom: 16px;">Q${q.id}. ${q.question}</p>
            
            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
              ${q.options.map((opt, idx) => `
                <div style="text-align: left; padding: 12px 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #FFF;">
                  ${String.fromCharCode(65 + idx)}. ${opt}
                </div>
              `).join('')}
            </div>

            <div style="background: rgba(0,0,0,0.3); padding: 14px; border-radius: 12px; color: rgba(255,255,255,0.85); font-size: 0.9rem;">
              <strong>Gemini AI Misconception Diagnosis:</strong> ${q.explanation}
            </div>
          </div>
        `).join('') : ''}
      </div>
    </div>
  `;

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// NODE HOVER & CLICK TOPIC OVERVIEW TOOLTIP
window.showNodeOverview = function(nodeId, event) {
  const tooltip = document.getElementById('nodeOverviewTooltip');
  const content = document.getElementById('tooltipContent');
  if (!tooltip || !content) return;

  const nodeData = window.roadmapNodesData ? window.roadmapNodesData[nodeId - 1] : null;
  if (!nodeData) return;

  content.innerHTML = `
    <h5>Node ${nodeId}: ${nodeData.title}</h5>
    <p>${nodeData.description}</p>
    <div style="font-weight: 700; font-size: 0.8rem; color: var(--purple-glow); margin-bottom: 6px;">Topic Overview:</div>
    <div>${(nodeData.topics || ['Core Engineering', 'System Design']).map(t => `<span class="node-topic-badge">${t}</span>`).join('')}</div>
    <div style="margin-top: 10px; font-size: 0.78rem; color: #10B981; font-weight: 700;">Project: ${nodeData.project || 'Capstone Build'}</div>
  `;

  tooltip.classList.add('active');
};

window.hideNodeOverview = function() {
  const tooltip = document.getElementById('nodeOverviewTooltip');
  if (tooltip) tooltip.classList.remove('active');
};

// ANIMATED NODE COMPLETION & EDGE PATH UNLOCKING
window.toggleNodeComplete = function(nodeId) {
  const nodeGroup = document.getElementById(`node-group-${nodeId}`);
  const milestoneCard = document.getElementById(`milestone-card-${nodeId}`);

  if (window.completedNodes.has(nodeId)) {
    window.completedNodes.delete(nodeId);
    if (nodeGroup) nodeGroup.classList.remove('completed');
    if (milestoneCard) milestoneCard.style.borderColor = 'rgba(255, 255, 255, 0.12)';
  } else {
    window.completedNodes.add(nodeId);
    if (nodeGroup) nodeGroup.classList.add('completed');
    if (milestoneCard) milestoneCard.style.borderColor = '#10B981';
  }

  // Animate Connecting Edge Lines
  const edge12 = document.getElementById('edge-1-2');
  const edge23 = document.getElementById('edge-2-3');

  if (window.completedNodes.has(1) && edge12) {
    edge12.classList.add('completed');
  } else if (edge12) {
    edge12.classList.remove('completed');
  }

  if (window.completedNodes.has(2) && edge23) {
    edge23.classList.add('completed');
  } else if (edge23) {
    edge23.classList.remove('completed');
  }
};

function renderFallbackRoadmap(targetRole, currentSkills) {
  renderNodeEdgeWorkspace({
    title: `Autonomous ${targetRole} Roadmap`,
    summary: `AI-engineered career trajectory bridging your current skills (${currentSkills || 'Basics'}) to industry mastery in ${targetRole}.`,
    milestones: [
      { step: 1, title: `Core ${targetRole} Fundamentals`, duration: "3 Weeks", description: "Consolidate existing skills and eliminate core gaps.", topics: ["Architecture Basics", "Git Flow", "Environment Setup"], project: "Baseline Prototype" },
      { step: 2, title: "Advanced System Architecture", duration: "5 Weeks", description: "Build scalable dynamic application modules.", topics: ["API Pipelines", "State Logic", "Automated Tests"], project: "Full Dynamic App" },
      { step: 3, title: "Production Deployment Capstone", duration: "4 Weeks", description: "Master security, performance tuning, and CI/CD pipelines.", topics: ["Performance Tuning", "Security Auth", "CI/CD Deployment"], project: "Capstone Cloud Build" }
    ],
    diagnosticQuiz: [
      { id: 1, topic: "Async Cleanup", question: `What triggers a memory leak in ${targetRole} development if a component unmounts during fetch?`, options: ["Missing dependency array", "Missing AbortController.abort() cleanup", "Declaring state inside effect"], correctIndex: 1, explanation: "Unmounted fetch callbacks leak memory unless cancelled with AbortController in cleanup." }
    ]
  }, "SkillForge Metacognitive AI Engine (PERN)");
}
