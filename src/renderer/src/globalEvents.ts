// Global event registration

// Create a global event emitter
export const globalEvents = new EventTarget();

export function triggerGlobalEvent(name: string, detail?: any) {
  globalEvents.dispatchEvent(new CustomEvent(name, { detail }));
}

export function onGlobalEvent(name: string, callback: (detail?: any) => void) {
  globalEvents.addEventListener(name, (event: Event) => {
    callback((event as CustomEvent).detail);
  });
}
