declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}

export const pushClarityEvent = (eventName: string) => {
  if (typeof window !== "undefined" && window.clarity) {
    window.clarity("set", eventName, "true");
  }
};
