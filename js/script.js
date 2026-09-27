document.addEventListener("DOMContentLoaded", () => {
  const splash = document.querySelector("#splash");
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-links");
  const progress = document.querySelector("#scrollProgress");
  const backTop = document.querySelector("#backTop");
  const year = document.querySelector("#year");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (year) year.textContent = new Date().getFullYear();

  // Premium splash screen
  const hideSplash = () => splash?.classList.add("hidden");
  if (reduceMotion) hideSplash();
  else window.setTimeout(hideSplash, 2200);
  window.setTimeout(hideSplash, 4500);

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
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 24);
    backTop?.classList.toggle("show", y > 650);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    }
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
