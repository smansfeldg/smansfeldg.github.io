import { trackEvent } from "./events";

export const initScrollTracking = () => {
  if (typeof window === "undefined") return;

  const scrollState = {
    scroll_25: false,
    scroll_50: false,
    scroll_75: false,
    scroll_100: false,
  };

  const calculateScrollPercentage = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    if (scrollHeight <= 0) return 0;
    return (scrollTop / scrollHeight) * 100;
  };

  const handleScroll = () => {
    const scrollPercent = calculateScrollPercentage();

    if (scrollPercent >= 25 && !scrollState.scroll_25) {
      scrollState.scroll_25 = true;
      trackEvent("scroll_25");
    }
    if (scrollPercent >= 50 && !scrollState.scroll_50) {
      scrollState.scroll_50 = true;
      trackEvent("scroll_50");
    }
    if (scrollPercent >= 75 && !scrollState.scroll_75) {
      scrollState.scroll_75 = true;
      trackEvent("scroll_75");
    }
    if (scrollPercent >= 99 && !scrollState.scroll_100) {
      scrollState.scroll_100 = true;
      trackEvent("scroll_100");
    }
  };

  let scrollTimeout: number | undefined;
  window.addEventListener("scroll", () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(handleScroll);
  }, { passive: true });

  // Section visibility tracking
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5, // Trigger when 50% of the section is visible
  };

  const viewedSections = new Set<string>();

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        if (id && !viewedSections.has(id)) {
          viewedSections.add(id);
          trackEvent(`${id}_view`);
        }
      }
    });
  }, observerOptions);

  document.querySelectorAll("section[id]").forEach((section) => {
    sectionObserver.observe(section);
  });
};
