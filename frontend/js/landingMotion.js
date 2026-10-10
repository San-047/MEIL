/**
 * MEIL Corporate Megaprojects Landing Page
 * Executive Enterprise Motion & Cinematic Interaction Engine
 * =========================================================================
 * 1. Cinematic Multi-Slide Ken Burns Hero Megaproject Reel & HUD Controller
 * 2. 60fps Ambient Golden Kinetic Mesh & Energy Trail Stream Canvas
 * 3. Staggered IntersectionObserver Scroll-Reveal Motion
 * 4. 3D Interactive Card Parallax Tilt & Dynamic Golden Glare Highlights
 * 5. Executive Sticky Header & Dynamic Blur Controller with ScrollSpy
 * 6. Animated Ease-Out KPI Metric Counters
 * 7. Interactive Sector Megaprojects Filter Hub
 * 8. Fullscreen 4K Cinematic Megaprojects Film Reel Modal Player
 * 9. Engineering Blueprint Technical Specification Inspector Modal
 * 10. Executive ESG & Decarbonization Period Switcher (FY23 - FY25 - 2030)
 * 11. Conglomerate Heritage Milestone Timeline Switcher
 * 12. Quick Role Gateways Drawer & Circular Back-to-Top Progress
 */

(function () {
  "use strict";

  // ===================== 0. LENIS MOMENTUM SMOOTH SCROLL ENGINE =====================
  let lenisInstance = null;

  function initLenisSmoothScroll() {
    if (typeof Lenis === "undefined") return;

    try {
      lenisInstance = new Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Luxurious exponential easeOut
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.4,
        infinite: false,
      });

      window.lenis = lenisInstance;

      // Synchronize immediately with initial scroll position to eliminate jump on refresh
      const initialScroll = window.scrollY || window.pageYOffset || 0;
      if (initialScroll > 0) {
        lenisInstance.scrollTo(initialScroll, { immediate: true });
      }

      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Connect Lenis to header and scroll progress for 120fps sync
      const header = document.getElementById("executiveHeader");
      const topBtn = document.getElementById("backToTopBtn");
      const progressCircle = document.getElementById("scrollProgressCircle");

      lenisInstance.on("scroll", ({ scroll, limit }) => {
        if (header) {
          header.classList.toggle("is-scrolled", scroll > 30);
        }
        if (topBtn) {
          topBtn.classList.toggle("visible", scroll > 400);
        }
        if (progressCircle && limit > 0) {
          const scrollPercent = (scroll / limit) * 100;
          const circumference = 125.66;
          const offset = circumference - (scrollPercent / 100) * circumference;
          progressCircle.style.strokeDashoffset = offset;
        }
      });
    } catch (err) {
      console.warn("Lenis initialization skipped:", err);
    }
  }


  // ===================== 1. CINEMATIC HERO MEGAPROJECT REEL & HUD =====================
  function initHeroCinematicReel() {
    const slides = document.querySelectorAll(".hero-slide-item");
    const captionEl = document.getElementById("heroSlideCaption");
    const indexEl = document.getElementById("heroSlideIndex");
    const progressFill = document.getElementById("heroSlideProgress");
    const prevBtn = document.getElementById("heroSlidePrev");
    const nextBtn = document.getElementById("heroSlideNext");
    const playPauseBtn = document.getElementById("heroSlidePlayPause");
    const playPauseIcon = document.getElementById("heroPlayPauseIcon");

    if (!slides.length) return;

    let currentIdx = 0;
    let isPlaying = true;
    let timerId = null;
    const slideDuration = 8000; // 8 seconds per slide for majestic documentary feel

    function setSlide(idx) {
      slides.forEach((s, i) => {
        s.classList.toggle("active", i === idx);
      });

      currentIdx = idx;
      const currentSlide = slides[idx];
      const caption = currentSlide.getAttribute("data-caption") || "National Infrastructure Megaprojects";

      if (captionEl) captionEl.textContent = caption;
      if (indexEl) indexEl.textContent = `0${idx + 1} / 0${slides.length}`;

      if (progressFill) {
        progressFill.style.transition = "none";
        progressFill.style.width = "0%";
        if (isPlaying) {
          requestAnimationFrame(() => {
            setTimeout(() => {
              progressFill.style.transition = `width ${slideDuration}ms linear`;
              progressFill.style.width = "100%";
            }, 40);
          });
        }
      }
    }

    function nextSlide() {
      const next = (currentIdx + 1) % slides.length;
      setSlide(next);
    }

    function prevSlide() {
      const prev = (currentIdx - 1 + slides.length) % slides.length;
      setSlide(prev);
    }

    function startAutoplay() {
      stopAutoplay();
      isPlaying = true;
      if (playPauseIcon) {
        playPauseIcon.innerHTML = '<polygon points="6 4 10 4 10 20 6 20"/><polygon points="14 4 18 4 18 20 14 20"/>';
      }
      setSlide(currentIdx);
      timerId = setInterval(nextSlide, slideDuration);
    }

    function stopAutoplay() {
      if (timerId) clearInterval(timerId);
      timerId = null;
      isPlaying = false;
      if (playPauseIcon) {
        playPauseIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
      }
      if (progressFill) {
        const computed = window.getComputedStyle(progressFill).width;
        progressFill.style.transition = "none";
        progressFill.style.width = computed;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        prevSlide();
        if (isPlaying) startAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        nextSlide();
        if (isPlaying) startAutoplay();
      });
    }

    if (playPauseBtn) {
      playPauseBtn.addEventListener("click", () => {
        if (isPlaying) stopAutoplay();
        else startAutoplay();
      });
    }

    // Auto-pause when hero is scrolled out of viewport
    const heroSection = document.getElementById("about");
    if (heroSection && "IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting && isPlaying) {
            if (timerId) clearInterval(timerId);
          } else if (entry.isIntersecting && isPlaying) {
            if (!timerId) timerId = setInterval(nextSlide, slideDuration);
          }
        });
      }, { threshold: 0.1 });
      heroObserver.observe(heroSection);
    }

    startAutoplay();
  }

  // ===================== 2. AMBIENT GOLDEN KINETIC MESH CANVAS =====================
  function initHeroAmbientCanvas() {
    const canvas = document.getElementById("heroCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width, height;
    let animId = null;
    let isCanvasActive = true;
    const mouse = { x: -9999, y: -9999, active: false };

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Floating Golden Stardust Particles
    const PARTICLE_COUNT = 30;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * (width || window.innerWidth),
      y: Math.random() * (height || 800),
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.35,
      radius: 1.0 + Math.random() * 2.0,
      alpha: 0.18 + Math.random() * 0.55,
      pulseSpeed: 0.02 + Math.random() * 0.03,
      pulseVal: Math.random() * Math.PI
    }));

    // Golden Transit High-Speed Light Trails
    const STREAK_COUNT = 4;
    const streaks = Array.from({ length: STREAK_COUNT }, () => ({
      x: Math.random() * (width || window.innerWidth),
      y: (height || 800) * (0.35 + Math.random() * 0.55),
      speed: 1.5 + Math.random() * 2.2,
      length: 60 + Math.random() * 120,
      alpha: 0.25 + Math.random() * 0.45
    }));

    const heroSection = document.getElementById("about");
    if (heroSection) {
      heroSection.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
      }, { passive: true });

      heroSection.addEventListener("mouseleave", () => {
        mouse.active = false;
        mouse.x = -9999;
        mouse.y = -9999;
      });

      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            isCanvasActive = entry.isIntersecting;
            if (isCanvasActive && !animId) loop();
          });
        }, { threshold: 0.05 });
        observer.observe(heroSection);
      }
    }

    function loop() {
      if (!isCanvasActive) {
        animId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Golden Light Streaks (Horizontal Transit Corridors)
      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i];
        s.x += s.speed;
        if (s.x - s.length > width) {
          s.x = -s.length;
          s.y = height * (0.35 + Math.random() * 0.55);
          s.speed = 1.5 + Math.random() * 2.2;
        }

        const grad = ctx.createLinearGradient(s.x - s.length, s.y, s.x, s.y);
        grad.addColorStop(0, "rgba(212, 163, 64, 0)");
        grad.addColorStop(0.7, `rgba(212, 163, 64, ${s.alpha * 0.6})`);
        grad.addColorStop(1, `rgba(252, 231, 148, ${s.alpha})`);

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.moveTo(s.x - s.length, s.y);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = `rgba(252, 231, 148, ${s.alpha * 1.2})`;
        ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw Particles & Proximity Lines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.pulseVal += p.pulseSpeed;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120 && dist > 0) {
            const force = (120 - dist) / 120 * 0.6;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        const dynamicAlpha = p.alpha * (0.8 + 0.2 * Math.sin(p.pulseVal));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 163, 64, ${dynamicAlpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 95) {
            const lineAlpha = (1 - dist / 95) * 0.2;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(212, 163, 64, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.35;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(252, 231, 148, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(loop);
    }

    loop();
  }

  // ===================== 3. STAGGERED SCROLL REVEAL MOTION =====================
  function initScrollReveal() {
    const revealElements = document.querySelectorAll(".reveal-on-scroll");
    if (!revealElements.length) return;

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach(el => el.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -30px 0px"
    });

    const windowH = window.innerHeight || 800;

    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < windowH + 40) {
        el.classList.add("is-revealed");
        el.style.transition = "none";
        requestAnimationFrame(() => {
          el.style.transition = "";
        });
      } else {
        const parent = el.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(c => c.classList.contains("reveal-on-scroll"));
          const siblingIdx = siblings.indexOf(el);
          if (siblingIdx >= 0) {
            el.style.transitionDelay = `${(siblingIdx % 4) * 0.08}s`;
          }
        }
        observer.observe(el);
      }
    });
  }

  // ===================== 4. 3D CARD PARALLAX TILT & GOLDEN GLARE =====================
  function init3DCardParallax() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const cards = document.querySelectorAll(".tilt-card-active");
    if (!cards.length) return;

    cards.forEach(card => {
      let bounds = null;

      function handleMouseEnter() {
        bounds = card.getBoundingClientRect();
      }

      function handleMouseMove(e) {
        if (!bounds) bounds = card.getBoundingClientRect();
        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;

        const normX = (mouseX / bounds.width) * 2 - 1;
        const normY = (mouseY / bounds.height) * 2 - 1;

        const tiltX = (normY * -4).toFixed(2);
        const tiltY = (normX * 4).toFixed(2);

        card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
        card.style.setProperty("--glare-x", `${((mouseX / bounds.width) * 100).toFixed(1)}%`);
        card.style.setProperty("--glare-y", `${((mouseY / bounds.height) * 100).toFixed(1)}%`);
      }

      function handleMouseLeave() {
        card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)";
        bounds = null;
      }

      card.addEventListener("mouseenter", handleMouseEnter, { passive: true });
      card.addEventListener("mousemove", handleMouseMove, { passive: true });
      card.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    });
  }

  // ===================== 5. EXECUTIVE STICKY HEADER & SCROLLSPY =====================
  function initHeaderAndScrollSpy() {
    const header = document.getElementById("executiveHeader");
    const navLinks = document.querySelectorAll(".nav-link-item");
    const mobileToggle = document.getElementById("navMobileToggle");
    const mobileDrawer = document.getElementById("navMobileDrawer");
    const closeDrawer = document.getElementById("closeMobileDrawer");
    const mobLinks = document.querySelectorAll(".mob-nav-link");

    if (header) {
      window.addEventListener("scroll", () => {
        header.classList.toggle("is-scrolled", window.scrollY > 30);
      }, { passive: true });
    }

    const sectionIds = ["about", "pillars", "sectors", "action-engine", "esg-scorecard", "heritage", "governance"];
    const sections = sectionIds.map(id => ({ id, el: document.getElementById(id) })).filter(s => s.el !== null);

    function updateActiveNav() {
      const scrollPos = window.scrollY + 160;
      let activeId = "about";
      for (const s of sections) {
        if (s.el.offsetTop <= scrollPos) {
          activeId = s.id;
        }
      }
      navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === `#${activeId}`) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
    }

    if (sections.length > 0) {
      window.addEventListener("scroll", updateActiveNav, { passive: true });
      updateActiveNav();
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId && targetId.length > 1) {
          const target = document.querySelector(targetId);
          if (target) {
            e.preventDefault();
            if (lenisInstance) {
              lenisInstance.scrollTo(target, { offset: -90, duration: 1.2 });
            } else {
              const headerOffset = 90;
              const elementPosition = target.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
              window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }
          }
        }
      });
    });

    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener("click", () => {
        mobileDrawer.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    }
    if (closeDrawer && mobileDrawer) {
      closeDrawer.addEventListener("click", () => {
        mobileDrawer.classList.remove("open");
        document.body.style.overflow = "";
      });
    }
    mobLinks.forEach(link => {
      link.addEventListener("click", () => {
        if (mobileDrawer) {
          mobileDrawer.classList.remove("open");
          document.body.style.overflow = "";
        }
      });
    });
  }

  // ===================== 6. ANIMATED KPI STAT COUNTERS =====================
  function initStatCounters() {
    const counters = document.querySelectorAll("[data-counter-target]");
    if (!counters.length) return;

    let hasRun = false;

    function runCounters() {
      counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute("data-counter-target"));
        const prefix = counter.getAttribute("data-counter-prefix") || "";
        const suffix = counter.getAttribute("data-counter-suffix") || "";
        const isDecimal = String(target).includes(".");
        const duration = 1800;
        const startTime = performance.now();

        function update(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          const current = target * ease;

          counter.textContent = prefix + (isDecimal ? current.toFixed(2) : Math.round(current).toLocaleString("en-IN")) + suffix;

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            counter.textContent = prefix + (isDecimal ? target.toFixed(2) : target.toLocaleString("en-IN")) + suffix;
          }
        }

        requestAnimationFrame(update);
      });
    }

    if (!("IntersectionObserver" in window)) {
      runCounters();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasRun) {
          hasRun = true;
          runCounters();
        }
      });
    }, { threshold: 0.25 });

    const firstCounter = counters[0];
    if (firstCounter && firstCounter.closest("section")) {
      observer.observe(firstCounter.closest("section"));
    }
  }

  // ===================== 7. SECTOR MEGAPROJECTS FILTER HUB =====================
  function initSectorFilterHub() {
    const filterBtns = document.querySelectorAll(".sector-filter-btn");
    const tiles = document.querySelectorAll(".sector-tile");
    if (!filterBtns.length || !tiles.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const cat = btn.getAttribute("data-filter-category");
        tiles.forEach(tile => {
          const tileCat = tile.getAttribute("data-sector-cat");
          if (cat === "all" || tileCat === cat) {
            tile.style.display = "flex";
            tile.style.animation = "fadeInCard 0.35s ease forwards";
          } else {
            tile.style.display = "none";
          }
        });
      });
    });
  }

  // ===================== 8. 4K CINEMATIC FILM REEL MODAL PLAYER =====================
  const REEL_CHAPTERS = [
    {
      id: 0,
      title: "Electric Mobility & Robotic OEM Platform",
      subtitle: "Subsidiary Olectra Greentech · 10,000+ Pure Electric Commercial Buses Contracted Across India",
      image: "img/olectra-ev.jpg",
      badge: "CLEAN TRANSIT REVOLUTION",
      desc: "Operating automated robotic vehicle assembly in Hyderabad displacing 1.2M MT CO2e annually with lithium-iron battery packs."
    },
    {
      id: 1,
      title: "Kaleshwaram Multi-Stage Lift Irrigation System",
      subtitle: "World's Largest Multi-Stage Lift Irrigation Project · 140 TMC Lifting Capacity across 538 km Canals",
      image: "img/water-infra.jpg",
      badge: "CIVIL ENGINEERING WORLD RECORD",
      desc: "Water pumped through 203 km underground tunnels and massive pumping caverns to irrigate 45 lakh agrarian acres."
    },
    {
      id: 2,
      title: "2,500+ MW Utility-Scale Clean Energy Portfolio",
      subtitle: "Utility Solar Parks, High-Voltage Transmission & Dedicated 33kV Substations on Net Zero 2045 Path",
      image: "img/solar-clean.jpg",
      badge: "RENEWABLE ENERGY & POWER GRID",
      desc: "35.5% captive clean power adoption, 38.5% on-site water circularity, and verified ISAE 3000 assurance standards."
    },
    {
      id: 3,
      title: "Zojila Himalayan Alpine Pass (14.15 km Tunnel)",
      subtitle: "Strategic High-Altitude Mountain Corridor Connecting Srinagar and Ladakh at 11,578 ft MSL",
      image: "img/tunnel-rail.jpg",
      badge: "STRATEGIC NATIONAL INFRASTRUCTURE",
      desc: "All-weather underground highway engineered through sub-zero Himalayan ranges maintaining a 0.12 zero-harm LTIFR safety score."
    }
  ];

  let currentChapterIdx = 0;
  let reelTimer = null;
  let isReelPlaying = true;

  function renderChapter(idx) {
    currentChapterIdx = idx;
    const ch = REEL_CHAPTERS[idx];
    const imgEl = document.getElementById("reelImg");
    const titleEl = document.getElementById("reelTitle");
    const subEl = document.getElementById("reelSub");
    const badgeEl = document.getElementById("reelBadge");
    const descEl = document.getElementById("reelDesc");
    const numEl = document.getElementById("reelSceneNum");

    if (imgEl) {
      imgEl.style.opacity = "0";
      setTimeout(() => {
        imgEl.src = ch.image;
        imgEl.style.opacity = "1";
      }, 200);
    }
    if (titleEl) titleEl.textContent = ch.title;
    if (subEl) subEl.textContent = ch.subtitle;
    if (badgeEl) badgeEl.textContent = ch.badge;
    if (descEl) descEl.textContent = ch.desc;
    if (numEl) numEl.textContent = `0${idx + 1} / 04`;

    document.querySelectorAll(".reel-thumb-btn").forEach((btn, i) => {
      btn.classList.toggle("active", i === idx);
    });

    const fills = document.querySelectorAll(".reel-progress-fill");
    fills.forEach((fill, i) => {
      fill.style.transition = "none";
      if (i < idx) fill.style.width = "100%";
      else if (i > idx) fill.style.width = "0%";
      else {
        fill.style.width = "0%";
        setTimeout(() => {
          fill.style.transition = "width 6.5s linear";
          fill.style.width = "100%";
        }, 30);
      }
    });
  }

  function nextChapter() {
    renderChapter((currentChapterIdx + 1) % REEL_CHAPTERS.length);
  }

  function startReelTimer() {
    stopReelTimer();
    reelTimer = setInterval(nextChapter, 6500);
    isReelPlaying = true;
    const playBtn = document.getElementById("reelPlayPause");
    if (playBtn) playBtn.textContent = "Pause";
  }

  function stopReelTimer() {
    if (reelTimer) clearInterval(reelTimer);
    reelTimer = null;
    isReelPlaying = false;
    const playBtn = document.getElementById("reelPlayPause");
    if (playBtn) playBtn.textContent = "Play";
  }

  function initCinemaReel() {
    const openBtns = [document.getElementById("openVideoReelBtn"), document.getElementById("openVideoReelBtn2")];
    const modal = document.getElementById("cinemaModal");
    const closeBtn = document.getElementById("closeCinemaModal");
    if (!modal) return;

    openBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener("click", () => {
          modal.classList.add("active");
          if (lenisInstance) lenisInstance.stop();
          renderChapter(0);
          startReelTimer();
          document.body.style.overflow = "hidden";
        });
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
        if (lenisInstance) lenisInstance.start();
        stopReelTimer();
        document.body.style.overflow = "";
      });
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
        stopReelTimer();
        document.body.style.overflow = "";
      }
    });

    const playPauseBtn = document.getElementById("reelPlayPause");
    if (playPauseBtn) {
      playPauseBtn.addEventListener("click", () => {
        if (isReelPlaying) stopReelTimer();
        else startReelTimer();
      });
    }

    const prevBtn = document.getElementById("reelPrevBtn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const prev = (currentChapterIdx - 1 + REEL_CHAPTERS.length) % REEL_CHAPTERS.length;
        renderChapter(prev);
        if (isReelPlaying) startReelTimer();
      });
    }

    const nextBtn = document.getElementById("reelNextBtn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        nextChapter();
        if (isReelPlaying) startReelTimer();
      });
    }

    document.querySelectorAll(".reel-thumb-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-chapter-idx"), 10);
        renderChapter(idx);
        if (isReelPlaying) startReelTimer();
      });
    });

    document.addEventListener("keydown", (e) => {
      if (modal.classList.contains("active")) {
        if (e.key === "Escape") closeBtn && closeBtn.click();
        if (e.key === "ArrowRight") nextBtn && nextBtn.click();
        if (e.key === "ArrowLeft") prevBtn && prevBtn.click();
      }
    });
  }

  // ===================== 9. ENGINEERING BLUEPRINT INSPECT MODAL =====================
  const BLUEPRINT_DATA = {
    ev: {
      category: "Clean Transport Infrastructure · Tier-1 OEM",
      title: "Olectra Greentech Electric Commercial Bus Platform",
      capacity: "10,000+ Pure Electric Buses Contracted",
      client: "BEST Mumbai, PMPML Pune, TSRTC, KSRTC",
      investment: "₹2,450 Cr Capital Investment",
      specs: [
        { label: "Powertrain Architecture", val: "Permanent Magnet Synchronous Motor (240 kW Peak)" },
        { label: "Battery Chemistry", val: "Lithium Iron Phosphate (LFP) with Liquid Thermal Mgmt" },
        { label: "Single-Charge Operating Range", val: "250 km - 300 km with Regenerative Braking" },
        { label: "Avoided Carbon Emissions", val: "1.2 Million Metric Tonnes CO2e Avoided Annually" },
        { label: "Manufacturing Facility", val: "150-Acre Robotic Assembly Line, Hyderabad, Telangana" },
        { label: "Statutory Certification", val: "ARAI Certified · AIS 052 & AIS 153 Safety Compliant" }
      ]
    },
    water: {
      category: "Civil Engineering Megaproject · Lift Irrigation",
      title: "Kaleshwaram Multi-Stage Lift Irrigation Barrage Network",
      capacity: "140 TMC Water Lifting Volume / Year",
      client: "Irrigation & CAD Dept, Govt of Telangana",
      investment: "₹80,500 Cr Multi-Stage Infrastructure",
      specs: [
        { label: "Water Lift Height", val: "Total Vertical Lift of 538 Meters in 7 Stages" },
        { label: "Underground Pumping Cavern", val: "Package 8: 7 × 139 MW Giant Vertical Turbines" },
        { label: "Canal & Tunnel Network", val: "538 km Gravity Feeder Canals · 203 km Tunnels" },
        { label: "Irrigation Command Area", val: "45 Lakh Acres across 13 Agro-Climatic Districts" },
        { label: "Execution Timeline", val: "Executed in Record 36 Months with Multi-Package Concurrency" },
        { label: "Ecological Compliance", val: "Central Water Commission (CWC) & MOEFCC Cleared" }
      ]
    },
    solar: {
      category: "Renewable Energy Grid · Decarbonization",
      title: "2,500+ MW Utility-Scale Clean Energy Solar Parks",
      capacity: "2,500+ MW Capacity Active Grid Sync",
      client: "Solar Energy Corp of India (SECI) & NTPC",
      investment: "₹9,800 Cr Renewable Capital Base",
      specs: [
        { label: "Photovoltaic Technology", val: "Bifacial Monocrystalline with Single-Axis Trackers" },
        { label: "Grid Evacuation Voltage", val: "Dedicated 33kV Substations Stepped up to 400kV PGCIL" },
        { label: "Inverter Station Uptime", val: "99.82% Operational Synchronous Availability" },
        { label: "Captive Clean Share", val: "35.5% Captive Clean Power across Group Facilities" },
        { label: "Water Circularity", val: "38.5% STP Industrial Water Recycling Ratio (ZLD)" },
        { label: "GHG Reduction Vector", val: "Displaces 2.85 Million Metric Tonnes Grid Carbon/yr" }
      ]
    },
    tunnel: {
      category: "Strategic Defense & Transport Infrastructure",
      title: "Zojila Himalayan Alpine Pass (14.15 km Highway Tunnel)",
      capacity: "14.15 km Bi-Directional All-Weather Corridor",
      client: "Ministry of Road Transport & Highways (MoRTH) / NHIDCL",
      investment: "₹6,800 Cr Strategic National Project",
      specs: [
        { label: "Geographical Elevation", val: "11,578 Feet Above MSL in Extreme Alpine Permafrost" },
        { label: "Tunnel Geometry", val: "Single-Tube Bi-Directional with 2-Lane Carriage (9.5m Width)" },
        { label: "Travel Time Reduction", val: "Reduces 3.5-Hour Snowy Pass Crossing to 15 Minutes" },
        { label: "Safety Lost-Time Index", val: "0.12 LTIFR (50% Safer than National Infrastructure Median)" },
        { label: "Ventilation SCADA", val: "Transverse Ventilation with Automated Toxic Gas Extraction" },
        { label: "Defense Significance", val: "Guarantees 365-Day Strategic Access to Ladakh Region" }
      ]
    }
  };

  function initBlueprintModal() {
    const modal = document.getElementById("blueprintModal");
    const closeBtn = document.getElementById("closeBlueprintModal");
    const inspectBtns = document.querySelectorAll("[data-inspect-project]");
    if (!modal) return;

    inspectBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-inspect-project");
        const data = BLUEPRINT_DATA[key];
        if (!data) return;

        document.getElementById("bpCategory").textContent = data.category;
        document.getElementById("bpTitle").textContent = data.title;
        document.getElementById("bpCapacity").textContent = data.capacity;
        document.getElementById("bpClient").textContent = data.client;
        document.getElementById("bpInvestment").textContent = data.investment;

        const specsGrid = document.getElementById("bpSpecsGrid");
        specsGrid.innerHTML = data.specs.map(s => `
          <div class="bp-spec-row">
            <span class="bp-spec-key">${s.label}</span>
            <span class="bp-spec-val">${s.val}</span>
          </div>
        `).join("");

        modal.classList.add("active");
        if (lenisInstance) lenisInstance.stop();
        document.body.style.overflow = "hidden";
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
        if (lenisInstance) lenisInstance.start();
        document.body.style.overflow = "";
      });
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }

  // ===================== 10. EXECUTIVE ESG PERIOD SWITCHER =====================
  const ESG_PERIOD_DATA = {
    fy23: {
      scope1: "44,780 tCO2e",
      scope2: "52,650 tCO2e",
      intensity: "48.9 tCO2e/Cr",
      renewable: "28.4%",
      water: "31.2%",
      safety: "0.18 LTIFR",
      assurance: "Limited Review (FY23 Complete)"
    },
    fy24: {
      scope1: "41,200 tCO2e",
      scope2: "49,120 tCO2e",
      intensity: "45.1 tCO2e/Cr",
      renewable: "32.0%",
      water: "35.0%",
      safety: "0.14 LTIFR",
      assurance: "Limited Review (FY24 Complete)"
    },
    fy25: {
      scope1: "38,410 tCO2e",
      scope2: "46,973 tCO2e",
      intensity: "42.8 tCO2e/Cr",
      renewable: "35.5%",
      water: "38.5%",
      safety: "0.12 LTIFR",
      assurance: "ISAE 3000 Clean Opinion (BSR & Co. LLP)"
    },
    t2030: {
      scope1: "21,500 tCO2e",
      scope2: "18,200 tCO2e",
      intensity: "22.0 tCO2e/Cr",
      renewable: "50.0%",
      water: "60.0%",
      safety: "0.05 Zero-Harm",
      assurance: "Reasonable Assurance Trajectory"
    }
  };

  function initEsgPeriodSwitcher() {
    const btns = document.querySelectorAll(".esg-period-btn");
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.addEventListener("click", () => {
        btns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const period = btn.getAttribute("data-period");
        const data = ESG_PERIOD_DATA[period];
        if (!data) return;

        const updateVal = (id, val) => {
          const el = document.getElementById(id);
          if (el) {
            el.style.opacity = "0";
            setTimeout(() => {
              el.textContent = val;
              el.style.opacity = "1";
            }, 120);
          }
        };

        updateVal("esgScope1", data.scope1);
        updateVal("esgScope2", data.scope2);
        updateVal("esgIntensity", data.intensity);
        updateVal("esgRenewable", data.renewable);
        updateVal("esgWater", data.water);
        updateVal("esgSafety", data.safety);
        updateVal("esgAssurance", data.assurance);
      });
    });
  }

  // ===================== 11. CONGLOMERATE HERITAGE TIMELINE =====================
  function initHeritageTimeline() {
    const pills = document.querySelectorAll(".heritage-year-pill");
    const cards = document.querySelectorAll(".heritage-card");
    if (!pills.length || !cards.length) return;

    pills.forEach((pill, idx) => {
      pill.addEventListener("click", () => {
        pills.forEach(p => p.classList.remove("active"));
        cards.forEach(c => c.classList.remove("active"));

        pill.classList.add("active");
        if (cards[idx]) {
          cards[idx].classList.add("active");
        }
      });
    });
  }

  // ===================== 12. BACK TO TOP BUTTON & QUICK PORTAL DRAWER =====================
  function initScrollProgressAndTop() {
    const topBtn = document.getElementById("backToTopBtn");
    const progressCircle = document.getElementById("scrollProgressCircle");
    if (!topBtn) return;

    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      topBtn.classList.toggle("visible", scrollTop > 400);

      if (progressCircle) {
        const circumference = 125.66;
        const offset = circumference - (scrollPercent / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
      }
    }, { passive: true });

    topBtn.addEventListener("click", () => {
      if (lenisInstance) {
        lenisInstance.scrollTo(0, { duration: 1.4 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  function initQuickPortalDrawer() {
    const toggleBtn = document.getElementById("quickPortalToggle");
    const drawer = document.getElementById("quickPortalDrawer");
    const closeBtn = document.getElementById("closeQuickPortal");
    if (!toggleBtn || !drawer) return;

    toggleBtn.addEventListener("click", () => {
      drawer.classList.toggle("active");
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        drawer.classList.remove("active");
      });
    }

    document.addEventListener("click", (e) => {
      if (!drawer.contains(e.target) && !toggleBtn.contains(e.target) && drawer.classList.contains("active")) {
        drawer.classList.remove("active");
      }
    });
  }


  // ===================== 13. SEAMLESS PORTAL PAGE TRANSITION =====================
  function initPortalPageTransitions() {
    const curtain = document.getElementById("portalTransitionCurtain");
    const fill = document.getElementById("curtainProgressFill");
    const statusText = document.getElementById("curtainStatusText");
    if (!curtain) return;

    const loginLinks = document.querySelectorAll('a[href*="login.html"]');

    loginLinks.forEach(link => {
      link.addEventListener("click", function (e) {
        if (e.ctrlKey || e.shiftKey || e.metaKey || e.button === 1) return;

        const targetHref = this.getAttribute("href");
        if (!targetHref) return;

        e.preventDefault();

        // Custom status feedback based on trigger source
        const roleCard = this.closest(".gateway-card") || this.closest(".drawer-link");
        if (roleCard && statusText) {
          statusText.textContent = "Routing to Secure Role Gateway...";
        } else if (statusText) {
          statusText.textContent = "Securing Authenticated Connection...";
        }

        // Activate curtain
        curtain.classList.add("is-transitioning");

        if (fill) {
          fill.style.width = "0%";
          requestAnimationFrame(() => {
            fill.style.width = "100%";
          });
        }

        // Cinematic smooth content zoom & soft blur
        document.body.style.transition = "transform 0.45s ease, filter 0.45s ease";
        document.body.style.transform = "scale(0.985)";
        document.body.style.filter = "blur(3px)";

        setTimeout(() => {
          window.location.href = targetHref;
        }, 420);
      });
    });
  }


  // ===================== 14. ESG INTELLIGENCE & ACTION ENGINE SIMULATOR =====================
  const SIMULATOR_STAGES = [
    {
      step: 0,
      badge: "STAGE 01 · DATA SOURCE LINEAGE",
      title: "Substation Telemetry & Inward Invoice Ingestion",
      desc: "System traces the exact origin of energy data across physical and financial lineage: Plant 04 &rarr; Digital Feeder Meter #M-402 &rarr; Energy Ledger &rarr; Utility Invoice #INV-8891.",
      facility: "Plant 04 · Hyderabad Complex",
      meter: "Feeder Meter #M-402",
      hash: "8f3a9e...e71c (SHA-256)",
      status: "Verified Active",
      statusClass: "green",
      score: 88,
      nextText: "Next: Check Validation &rarr;",
      termHeader: "SOURCE LINEAGE ENGINE // BPUT_KERNEL_v2.4",
      terminalHtml: '<div class="term-line-lead">[01. PHYSICAL DATA INGESTION]</div>' +
        '<div>Facility Target     : <span style="color:#fff; font-weight:700;">Plant 04 (Hyderabad Manufacturing Complex)</span></div>' +
        '<div>Physical Feeder     : Substation Inward Bay 4 · Digital Meter #M-402</div>' +
        '<div>Meter Calibration   : <span class="term-badge green">NABL Certified Valid</span> (Exp: Mar 2027)</div>' +
        '<div>Timestamp Ingested  : 04 Oct 2026, 23:59:59 IST</div>' +
        '<div>Meter Reading (Q3)  : <span style="color:var(--gold); font-weight:800;">142,500 kWh</span> (vs Baseline: 115,400 kWh)</div>' +
        '<div>Utility Invoice Ref : TSSPDCL Industrial Bill #INV-8891</div>' +
        '<div>Ledger Sequence     : LEDGER-PL4-2026-Q3-BATCH09</div>' +
        '<div>Cryptographic Seal  : SHA-256 (8f3a9e22b071c4d9...e71c)</div>' +
        '<div style="margin-top:10px; color:#a3a3a3;">&rarr; Status: Ingestion verified with 100% meter-to-invoice lineage traceability.</div>'
    },
    {
      step: 1,
      badge: "STAGE 02 · AI & RULE ENGINE CHECK",
      title: "Automated Evidence Validation & Integrity Check",
      desc: "AI + algorithmic rules check if incoming data is correct, verify OCR against the scanned bill, and check whether evidence is missing or duplicated.",
      facility: "Plant 04 · Hyderabad Complex",
      meter: "Rules: 5 of 5 Passed",
      hash: "OCR Match: 100%",
      status: "Integrity Verified",
      statusClass: "green",
      score: 89,
      nextText: "Next: Detect Anomaly &rarr;",
      termHeader: "VALIDATION ENGINE // INTEGRITY_CHECK_SUITE",
      terminalHtml: '<div class="term-line-lead">[02. RULE ENGINE & OCR CROSS-EXAMINATION]</div>' +
        '<div>Rule #01 [OCR Lineage Verification] : <span class="term-badge green">PASSED</span> (142,500 kWh bill match)</div>' +
        '<div>Rule #02 [Duplicate Invoice Scan]   : <span class="term-badge green">PASSED</span> (0 duplicates in 18 states)</div>' +
        '<div>Rule #03 [Tariff Structure Check]   : <span class="term-badge green">PASSED</span> (Industrial HT-2 Tier rate)</div>' +
        '<div>Rule #04 [Cryptographic Chain Seal] : <span class="term-badge green">PASSED</span> (Block hash unaltered)</div>' +
        '<div>Rule #05 [Evidence Attachment]      : <span class="term-badge green">PASSED</span> (Utility bill PDF attached)</div>' +
        '<div style="margin-top:10px; color:#10b981;">[OK] DATA INTEGRITY CONFIRMED · PROCEEDING TO STATISTICAL RADAR...</div>'
    },
    {
      step: 2,
      badge: "STAGE 03 · STATISTICAL ANOMALY TRIGGER",
      title: "High-Variance Anomaly Triggered: +23.4%",
      desc: "System detects statistical irregularity: Plant 04 electricity consumption increased by +23.4% MoM, significantly exceeding permissible statutory variance tolerance (+10%).",
      facility: "Plant 04 · Hyderabad Complex",
      meter: "Consumption: 142,500 kWh",
      hash: "Variance: +23.4% MoM",
      status: "Anomaly Flagged",
      statusClass: "amber",
      score: 86,
      nextText: "Next: Diagnose with AI &rarr;",
      termHeader: "ANOMALY RADAR // VARIANCE_INTERCEPT",
      terminalHtml: '<div class="term-line-lead">[03. STATISTICAL VARIANCE DETECTED]</div>' +
        '<div style="color:#f87171; font-weight:800;">ALERT: ALERT: UNEXPECTED ELECTRICITY SURGE DETECTED</div>' +
        '<div>Baseline (Expected) : 115,400 kWh (Rolling 3-month seasonal median)</div>' +
        '<div>Recorded (Actual)   : <span style="color:#f87171; font-weight:800;">142,500 kWh</span></div>' +
        '<div>Net Delta Spike     : <span class="term-badge red">+27,100 kWh (+23.4%)</span></div>' +
        '<div>Statutory Threshold : +10.0% Max Permissible Tolerance (SEBI BRSR P6)</div>' +
        '<div>Variance Status     : <span class="term-badge red">BREACH DETECTED</span></div>' +
        '<div>Severity Level      : CRITICAL · ESCALATING TO AI DIAGNOSTIC ENGINE</div>'
    },
    {
      step: 3,
      badge: "STAGE 04 · CONTEXTUAL ROOT CAUSE INTELLIGENCE",
      title: "AI Explains Root Cause: Equipment Efficiency Degradation",
      desc: "AI cross-examines historical output volume, ambient weather data, and sub-meter telemetry to explain why the consumption increased.",
      facility: "Plant 04 · Hyderabad Complex",
      meter: "Chiller #2: +87.6% Surge",
      hash: "Diagnostic Confidence: 98.4%",
      status: "Root Cause Resolved",
      statusClass: "green",
      score: 88,
      nextText: "Next: Dispatch Action &rarr;",
      termHeader: "AI ROOT CAUSE REASONING ENGINE // DIAGNOSTICS",
      terminalHtml: '<div class="term-line-lead">[04. MULTI-FACTOR CORRELATION MATRIX]</div>' +
        '<div>Factor 1 [Production Output] : Only +4.1% increase (Does NOT explain +23% spike)</div>' +
        '<div>Factor 2 [Ambient Weather]   : +1.2°C mean temperature (Explains only ~2.5%)</div>' +
        '<div>Factor 3 [Sub-Meter Feeder Breakdown]:</div>' +
        '<div>  ├─ Line 1-3 Assembly Motors : +3.8% (Normal operating envelope)</div>' +
        '<div>  ├─ EV Battery Robotic Fab   : +4.2% (Normal operating envelope)</div>' +
        '<div>  └─ HVAC Chiller Unit #2     : <span style="color:#f87171; font-weight:800;">+87.6% ABNORMAL CONSUMPTION</span></div>' +
        '<div style="margin-top:8px; color:var(--gold); font-weight:700;">AI DIAGNOSTIC EXPLANATION:</div>' +
        '<div style="color:#e5e5e5; font-style:italic;">"Chiller Unit #2 compressor thermal efficiency degraded by 31.4%, running continuous non-inverter bypass cycles during peak daytime tariff periods."</div>'
    },
    {
      step: 4,
      badge: "STAGE 05 · AUTONOMOUS ACTION DISPATCH",
      title: "System Dispatches Corrective Action (CAPA Ticket)",
      desc: "System automatically creates a corrective task: 'Plant 04 Chiller & Substation Energy Audit', assigns Plant Manager Vikram Singh, and locks deadline to 15 Oct.",
      facility: "Plant 04 · Hyderabad Complex",
      meter: "Owner: Vikram Singh",
      hash: "Deadline: 15 Oct 2026",
      status: "Action Dispatched",
      statusClass: "gold",
      score: 90,
      nextText: "Next: Verify Evidence &rarr;",
      termHeader: "CORRECTIVE ACTION DISPATCH // CAPA_WORKFLOW",
      terminalHtml: '<div class="term-line-lead">[05. AUTONOMOUS CORRECTIVE ACTION GENERATION]</div>' +
        '<div>Ticket Identifier   : <span class="term-badge amber">CAPA-2026-084</span></div>' +
        '<div>Recommended Task    : "Execute Plant 04 Chiller Unit #2 Overhaul & Energy Audit"</div>' +
        '<div>Assigned Owner      : <span style="color:#fff; font-weight:700;">Vikram Singh (Plant 04 Operations Manager)</span></div>' +
        '<div>Statutory Deadline  : <span style="color:var(--gold); font-weight:800;">15 Oct 2026 (Strict Lock)</span></div>' +
        '<div>Target Reduction    : 24,000 kWh/mo (Restore normal COP baseline)</div>' +
        '<div>Workflow Route      : Dispatched to Plant Site Desk + SMS / Mobile Alert</div>' +
        '<div>Compliance Hold    : Form 10 sign-off paused pending service verification</div>' +
        '<div style="margin-top:10px; color:#a3a3a3;">&rarr; Status: Task live in Plant Manager workspace. Awaiting evidence upload.</div>'
    },
    {
      step: 5,
      badge: "STAGE 06 · EVIDENCE UPLOAD & DUAL VERIFICATION",
      title: "Evidence Uploaded & Multi-Party Sign-Off Closed",
      desc: "Action executed on-site. Service proof + thermal scan uploaded. EHS Officer Priya Nair and Statutory Auditor Anand Sharma verify and close the ticket.",
      facility: "Plant 04 · Hyderabad Complex",
      meter: "Proof: 2 Docs Attached",
      hash: "Audit Seal: ISAE 3000",
      status: "Closed & Verified",
      statusClass: "green",
      score: 91,
      nextText: "Next: Final BRSR Readiness &rarr;",
      termHeader: "MULTI-PARTY VERIFICATION LEDGER // CLOSING_SEAL",
      terminalHtml: '<div class="term-line-lead">[06. PROOF UPLOAD & AUDIT VERIFICATION]</div>' +
        '<div>Uploaded Evidence:</div>' +
        '<div>  1. Evidence #EV-4091: BlueStar OEM Compressor Overhaul Service Report</div>' +
        '<div>  2. Evidence #EV-4092: FLIR Post-Service Thermal Calibration Scan PDF</div>' +
        '<div>Telemetry Verification: Sub-meter normalized back to 116,200 kWh/mo</div>' +
        '<div style="margin-top:8px;">DUAL MULTI-PARTY SIGN-OFF:</div>' +
        '<div>  [OK] EHS Lead Approval    : Priya Nair · Verified 12 Oct 2026</div>' +
        '<div>  [OK] Statutory Auditor Review: Anand Sharma, FCA · ISAE 3000 Sealed 14 Oct 2026</div>' +
        '<div style="margin-top:10px; color:#10b981; font-weight:800;">[OK] CASE CLOSED & CRYPTOGRAPHICALLY LOCKED INTO LEDGER</div>'
    },
    {
      step: 6,
      badge: "STAGE 07 · BRSR READINESS & REPORTING",
      title: "Audit-Grade BRSR Readiness Recalculated: 92%",
      desc: "System recalculates statutory compliance: BRSR Readiness = 92% (+3.6% gain). Clean verified data passes directly into annual SEBI filing ledger.",
      facility: "Plant 04 · Hyderabad Complex",
      meter: "BRSR Readiness: 92.4%",
      hash: "SEBI Principle 6 Synced",
      status: "Filing Ready",
      statusClass: "green",
      score: 92,
      nextText: "Restart Engine Flow ↺",
      termHeader: "STATUTORY REPORTING PIPELINE // BRSR_ANNEXURE",
      terminalHtml: '<div class="term-line-lead">[07. STATUTORY FILING RECALCULATION]</div>' +
        '<div>BRSR Core Readiness  : <span class="term-badge green" style="font-size:12px;">92.4% READINESS</span> (Previous: 88.8%)</div>' +
        '<div>Compliance Gain     : <span style="color:var(--gold); font-weight:800;">+3.6% Verified Score Uplift</span></div>' +
        '<div>Avoided Penalty     : 22.8 tCO2e/mo Scope 2 Emissions Displaced</div>' +
        '<div>SEBI Principle 6    : Energy Intensity KPIs 100% verified with zero variance</div>' +
        '<div>Assurance Opinion   : Clean / ISAE 3000 Unqualified Assurance Opinion</div>' +
        '<div>Statutory Delivery  : Synchronized to Annual Business Responsibility Report</div>' +
        '<div style="margin-top:10px; color:var(--gold); font-weight:800;">[CONFIRMED] SYSTEM IDENTITY PROVEN: DATA &rarr; EVIDENCE &rarr; ACTION &rarr; CLOSED.</div>'
    }
  ];

  function initActionEngineSimulator() {
    const pills = document.querySelectorAll(".sim-pill");
    const termBody = document.getElementById("termBody");
    const termSysTitle = document.getElementById("termSysTitle");
    const stageBadge = document.getElementById("stageBadge");
    const stageTitle = document.getElementById("stageTitle");
    const stageDesc = document.getElementById("stageDesc");
    const metaFacility = document.getElementById("metaFacility");
    const metaMeter = document.getElementById("metaMeter");
    const metaHash = document.getElementById("metaHash");
    const metaStatus = document.getElementById("metaStatus");
    const simGaugeText = document.getElementById("simGaugeText");
    const simGaugeCircle = document.getElementById("simGaugeCircle");
    const simNextBtnText = document.getElementById("simNextBtnText");
    const simNextStageBtn = document.getElementById("simNextStageBtn");
    const prevBtn = document.getElementById("simPrevBtn");
    const nextBtn = document.getElementById("simNextBtn");
    const playPauseBtn = document.getElementById("simPlayPauseBtn");
    const playIcon = document.getElementById("simPlayIcon");
    const playText = document.getElementById("simPlayText");

    if (!pills.length || !termBody) return;

    let currentStep = 0;
    let isAutoPlaying = false;
    let simTimer = null;

    function renderStage(idx) {
      currentStep = idx;
      const data = SIMULATOR_STAGES[idx];
      if (!data) return;

      pills.forEach((p, i) => {
        p.classList.toggle("active", i === idx);
      });

      if (stageBadge) stageBadge.textContent = data.badge;
      if (stageTitle) stageTitle.textContent = data.title;
      if (stageDesc) stageDesc.textContent = data.desc;
      if (metaFacility) metaFacility.textContent = data.facility;
      if (metaMeter) metaMeter.textContent = data.meter;
      if (metaHash) metaHash.textContent = data.hash;

      if (metaStatus) {
        metaStatus.textContent = data.status;
        metaStatus.className = 'stage-meta-val ' + (data.statusClass || 'green');
      }

      if (termSysTitle) termSysTitle.textContent = data.termHeader;
      if (termBody) {
        termBody.style.opacity = "0";
        setTimeout(() => {
          termBody.innerHTML = data.terminalHtml;
          termBody.style.opacity = "1";
        }, 120);
      }

      if (simGaugeText) simGaugeText.textContent = data.score + '%';
      if (simGaugeCircle) {
        const circumference = 113.1;
        const offset = circumference - (data.score / 100) * circumference;
        simGaugeCircle.style.strokeDashoffset = offset;
      }

      if (simNextBtnText) simNextBtnText.textContent = data.nextText;
    }

    function advanceNext() {
      const next = (currentStep + 1) % SIMULATOR_STAGES.length;
      renderStage(next);
    }

    function advancePrev() {
      const prev = (currentStep - 1 + SIMULATOR_STAGES.length) % SIMULATOR_STAGES.length;
      renderStage(prev);
    }

    function startAutoPlay() {
      stopAutoPlay();
      isAutoPlaying = true;
      if (playIcon) playIcon.innerHTML = '<polygon points="6 4 10 4 10 20 6 20"/><polygon points="14 4 18 4 18 20 14 20"/>';
      if (playText) playText.textContent = "Pause Engine";
      simTimer = setInterval(advanceNext, 4500);
    }

    function stopAutoPlay() {
      if (simTimer) clearInterval(simTimer);
      simTimer = null;
      isAutoPlaying = false;
      if (playIcon) playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
      if (playText) playText.textContent = "Auto-Play Engine";
    }

    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const stepIdx = parseInt(pill.getAttribute("data-sim-step"), 10);
        renderStage(stepIdx);
        if (isAutoPlaying) startAutoPlay();
      });
    });

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        advanceNext();
        if (isAutoPlaying) startAutoPlay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        advancePrev();
        if (isAutoPlaying) startAutoPlay();
      });
    }

    if (simNextStageBtn) {
      simNextStageBtn.addEventListener("click", () => {
        advanceNext();
        if (isAutoPlaying) startAutoPlay();
      });
    }

    if (playPauseBtn) {
      playPauseBtn.addEventListener("click", () => {
        if (isAutoPlaying) stopAutoPlay();
        else startAutoPlay();
      });
    }

    // Auto-pause when not visible
    const simContainer = document.getElementById("actionSimulator");
    if (simContainer && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting && isAutoPlaying) {
            if (simTimer) clearInterval(simTimer);
          } else if (entry.isIntersecting && isAutoPlaying) {
            if (!simTimer) simTimer = setInterval(advanceNext, 4500);
          }
        });
      }, { threshold: 0.1 });
      observer.observe(simContainer);
    }

    // Render initial Stage 0
    renderStage(0);
  }

  // ===================== MASTER INITIALIZER =====================
  function init() {
    initLenisSmoothScroll();
    initHeroCinematicReel();
    initHeroAmbientCanvas();
    initScrollReveal();
    init3DCardParallax();
    initHeaderAndScrollSpy();
    initStatCounters();
    initSectorFilterHub();
    initCinemaReel();
    initBlueprintModal();
    initEsgPeriodSwitcher();
    initHeritageTimeline();
    initScrollProgressAndTop();
    initQuickPortalDrawer();
    initPortalPageTransitions();
    initActionEngineSimulator();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
