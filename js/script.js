document.addEventListener("DOMContentLoaded", () => {
  const splash = document.querySelector("#splash");
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-links");
  const progress = document.querySelector("#scrollProgress");
  const backTop = document.querySelector("#backTop");
  const year = document.querySelector("#year");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Subtle cursor ambience — desktop only, visual enhancement with no layout impact.
  if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    let cursorFrame = null;
    window.addEventListener("pointermove", event => {
      if (cursorFrame) return;
      cursorFrame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
        document.documentElement.style.setProperty("--my", `${event.clientY}px`);
        cursorFrame = null;
      });
    }, { passive: true });
  }

  // Highlight the navigation item for the section currently in view.
  const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')].filter(link => link.getAttribute('href') !== '#top');
  const navSections = sectionLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ("IntersectionObserver" in window && navSections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    navSections.forEach(section => sectionObserver.observe(section));
  }

  if (year) year.textContent = new Date().getFullYear();

  // Premium splash screen — staged progress + cinematic exit
  const hideSplash = () => splash?.classList.add("hidden");
  const duration = 4000;
  const splashPercent = document.querySelector("#splashPercent");
  const splashStatus = document.querySelector("#splashStatus");
  const splashMessages = [
    [12, "ESTABLISHING SECURE SESSION"],
    [30, "LOADING DIGITAL IDENTITY"],
    [52, "INITIALIZING DESIGN SYSTEM"],
    [72, "ASSEMBLING DIGITAL EXPERIENCE"],
    [88, "CALIBRATING INTERFACE"],
    [100, "WELCOME TO KYKAL"]
  ];
  if (!reduceMotion && splash) {
    const started = performance.now();
    const tick = now => {
      if (splash.classList.contains("hidden")) return;
      const progressValue = Math.min(100, Math.round(((now - started) / duration) * 100));
      if (splashPercent) splashPercent.textContent = `${String(progressValue).padStart(2, "0")}%`;
      const message = [...splashMessages].reverse().find(item => progressValue >= item[0]);
      if (message && splashStatus) splashStatus.textContent = message[1];
      if (progressValue < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    window.setTimeout(hideSplash, duration + 180);
  } else {
    if (splashPercent) splashPercent.textContent = "100%";
    if (splashStatus) splashStatus.textContent = "WELCOME TO KYKAL";
    window.setTimeout(hideSplash, duration + 180);
  }
  window.setTimeout(hideSplash, 5600);

  const photoCircle = document.querySelector(".photo-circle");
  const photoImage = document.querySelector(".photo-circle img");
  if (photoImage && photoCircle) {
    photoImage.addEventListener("error", () => {
      photoCircle.classList.add("is-fallback");
      photoImage.style.display = "none";
    });
    photoImage.addEventListener("load", () => {
      photoCircle.classList.remove("is-fallback");
      photoImage.style.display = "block";
    });
  }

  // Header, progress bar and back-to-top
  let scrollFrame = null;
  const onScroll = () => {
    if (scrollFrame !== null) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = null;
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 24);
    backTop?.classList.toggle("show", y > 650);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    }
    });
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  backTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  // Mobile navigation
  navToggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("open") || false;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  nav?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  // Scroll reveal
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("visible"));
  }

  // Animated project count
  const counters = document.querySelectorAll(".counter");
  const animateCounter = el => {
    const target = Number(el.dataset.target || 0);
    if (reduceMotion) { el.textContent = target; return; }
    let start = 0;
    const duration = 900;
    const startTime = performance.now();
    const tick = now => {
      const progressValue = Math.min((now - startTime) / duration, 1);
      start = Math.round(progressValue * target);
      el.textContent = start;
      if (progressValue < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.7 });
    counters.forEach(counter => counterObserver.observe(counter));
  } else counters.forEach(animateCounter);

  // Smooth internal links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const selector = link.getAttribute("href");
      const target = selector ? document.querySelector(selector) : null;
      if (!target) return;
      event.preventDefault();
      const offset = (header?.offsetHeight || 0) + 15;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    });
  });

  // Subtle 3D tilt on desktop
  if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${y * -4}deg) rotateY(${x * 4}deg) translateY(-3px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  // Keyboard accessibility
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      nav?.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
      navToggle?.setAttribute("aria-label", "Open menu");
    }
  });
});
