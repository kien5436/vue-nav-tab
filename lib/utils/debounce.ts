// eslint-disable-next-line no-unused-vars
export function debounce <F extends(...args: any[]) => any>(func: F, wait = 250, immediate = false) {

  let timeout: ReturnType<typeof setTimeout> | null = null;

  function debounced(this: typeof debounced, ...args: Parameters<F>) {

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let context: typeof debounced | null = this;
    const previous = Date.now();

    function later() {
      const passed = Date.now() - previous;

      if (wait > passed) {
        timeout = setTimeout(later, wait - passed);
      }
      else {
        timeout = null;
        if (!immediate) func.apply(context, args);
        // this check is needed because `func` can recursively invoke debounce
        if (!timeout) context = null;
      }
    }

    if (!timeout) {
      timeout = setTimeout(later, wait);
      if (immediate) func.apply(context, args);
    }
  }

  debounced.cancel = function() {

    if (!timeout) return;

    clearTimeout(timeout);
    timeout = null;
  };

  return debounced;
}