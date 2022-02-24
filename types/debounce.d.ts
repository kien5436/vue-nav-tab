export declare function debounce<F extends (...args: any[]) => any>(func: F, wait?: number, immediate?: boolean): {
    (this: any, ...args: Parameters<F>): void;
    cancel(): void;
};
