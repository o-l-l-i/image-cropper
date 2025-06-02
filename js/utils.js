export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function waitForLayoutStabilization(callback, delay = 50) {
    requestAnimationFrame(() => {
        setTimeout(callback, delay);
    });
}