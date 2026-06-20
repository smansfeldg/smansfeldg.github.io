import { pushClarityEvent } from "./clarity";

export const trackEvent = (eventName: string) => {
  // console.debug("[Analytics] Event tracked:", eventName);
  pushClarityEvent(eventName);
};
