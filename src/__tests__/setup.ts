import { vi } from 'vitest';

class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
(globalThis as any).ResizeObserver = RO;
(globalThis as any).IntersectionObserver = IO;
(globalThis as any).matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});
window.scrollTo = vi.fn();
(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 0) as any;
(globalThis as any).cancelAnimationFrame = (id: any) => clearTimeout(id);
