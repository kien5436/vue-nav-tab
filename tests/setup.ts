import { vi } from 'vitest';

// happy-dom does not implement scrollIntoView, which Tab calls on mount
if (!window.HTMLElement.prototype.scrollIntoView)
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
