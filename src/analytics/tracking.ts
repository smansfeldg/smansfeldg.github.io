import { trackEvent } from "./events";
import { initScrollTracking } from "./scroll";

export const initTracking = () => {
  if (typeof window === "undefined") return;

  initScrollTracking();

  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    
    // Find the closest parent with data-track attribute
    const trackingElement = target.closest("[data-track]");
    
    if (trackingElement) {
      const eventName = trackingElement.getAttribute("data-track");
      if (eventName) {
        trackEvent(eventName);
      }
    }
  });
};

initTracking();
