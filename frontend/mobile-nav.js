/* ==========================================================================
   SKILLFORGE AI — MOBILE APP DYNAMIC NAVIGATION & HEADER COMPONENT
   Auto-injects Top Mobile Header, Bottom Navigation Bar, and Mobile Drawer
   ========================================================================== */

(function () {
  'use strict';

  function initMobileNav() {
    // Detect active page based on pathname
    const pathname = window.location.pathname.toLowerCase();
    let activeKey = 'dashboard';

    if (pathname.includes('dashboard') || pathname.endsWith('/')) {
      activeKey = 'dashboard';
    } else if (pathname.includes('profile')) {
      activeKey = 'profile';
    } else if (pathname.includes('verify')) {
      activeKey = 'verify';
    } else if (pathname.includes('project')) {
      activeKey = 'projects';
    } else if (pathname.includes('theoretical-roadmap') || pathname.includes('roadmap')) {
      activeKey = 'home';
    } else if (pathname.includes('jobs')) {
      activeKey = 'jobs';
    }

    // 1. Create or Find Mobile Top Header
    if (!document.querySelector('.mobile-top-header')) {
      const topHeader = document.createElement('header');
      topHeader.className = 'mobile-top-header';
      topHeader.innerHTML = `
        <button class="mobile-header-btn" id="mobileDrawerOpenBtn" aria-label="Open Navigation">
          <i data-lucide="menu" style="width: 22px; height: 22px;"></i>
        </button>
        <a href="dashboard.html" class="mobile-header-logo" title="SkillForge AI">
          <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
            <path d="M8 14L18 6L28 14L18 22L8 14Z" fill="#A855F7"/>
            <path d="M8 20L18 28L28 20" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round"/>
          </svg>
        </a>
      `;
      document.body.prepend(topHeader);
    }

    // 2. Create Mobile Drawer Backdrop
    if (!document.querySelector('.mobile-drawer-backdrop')) {
      const backdrop = document.createElement('div');
      backdrop.className = 'mobile-drawer-backdrop';
      backdrop.id = 'mobileDrawerBackdrop';
      document.body.appendChild(backdrop);
    }

    // Clean up any existing bottom nav if present
    const existingBottomNav = document.querySelector('.mobile-bottom-nav');
    if (existingBottomNav) {
      existingBottomNav.remove();
    }

    // 3. Hook Drawer Interactions
    const openBtn = document.getElementById('mobileDrawerOpenBtn');
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    const sidebar = document.querySelector('.bw-pill-nav');

    function openDrawer() {
      if (sidebar) sidebar.classList.add('mobile-drawer-open');
      if (backdrop) backdrop.classList.add('open');
      if (openBtn) {
        openBtn.innerHTML = '<i data-lucide="x" style="width: 22px; height: 22px;"></i>';
      }
      document.body.style.overflow = 'hidden';
      if (window.lucide) window.lucide.createIcons();
    }

    function closeDrawer() {
      if (sidebar) sidebar.classList.remove('mobile-drawer-open');
      if (backdrop) backdrop.classList.remove('open');
      if (openBtn) {
        openBtn.innerHTML = '<i data-lucide="menu" style="width: 22px; height: 22px;"></i>';
      }
      document.body.style.overflow = '';
      if (window.lucide) window.lucide.createIcons();
    }

    function toggleDrawer() {
      if (sidebar && sidebar.classList.contains('mobile-drawer-open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    }

    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDrawer();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeDrawer);
    }

    // Close drawer on link click
    if (sidebar) {
      sidebar.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            closeDrawer();
          }
        });
      });
    }

    // 5. Sync User Avatar & Profile from Local Storage
    try {
      const stored = localStorage.getItem('skillforge_profile');
      if (stored) {
        const p = JSON.parse(stored);
        const avatarImg = document.getElementById('mobileHeaderAvatarImg');
        if (avatarImg && p.photoURL) {
          avatarImg.src = p.photoURL;
        }
      }
    } catch (e) { }

    // Re-render Lucide Icons for dynamic injection
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
})();
