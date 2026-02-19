// Polyfill for DOMMatrix
if (typeof DOMMatrix === 'undefined' && typeof window !== 'undefined') {
    // @ts-ignore
    window.DOMMatrix = window.WebKitCSSMatrix || window.MSCSSMatrix;
}
