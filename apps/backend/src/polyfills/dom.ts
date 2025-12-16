
// Minimal DOMMatrix Polyfill for pdf-parse / pdfjs-dist
// preventing "ReferenceError: DOMMatrix is not defined"
/* eslint-disable */

if (typeof (global as any).DOMMatrix === 'undefined') {
    (global as any).DOMMatrix = class DOMMatrix {
        a = 1;
        b = 0;
        c = 0;
        d = 1;
        e = 0;
        f = 0;
        constructor() { }
    };
}
