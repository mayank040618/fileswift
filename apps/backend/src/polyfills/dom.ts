// Polyfill DOMMatrix/DOMPoint for Node.js (Required for pdf-lib/pdf-parse/etc)
// This file IS THE Source of Truth for DOM Global Polyfills.
// It must be imported BEFORE any other import in index.ts

if (typeof global.DOMMatrix === 'undefined') {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        constructor(init?: any) {
            if (init) {
                this.a = init.a || 1;
                this.b = init.b || 0;
                this.c = init.c || 0;
                this.d = init.d || 1;
                this.e = init.e || 0;
                this.f = init.f || 0;
            }
        }
        // Basic identity method often called
        multiply(_other: any) { return this; }
        transformPoint(point: any) { return point; }
        toString() { return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`; }
    };
    console.log('[Polyfill] DOMMatrix defined globally.');
}

if (typeof global.DOMPoint === 'undefined') {
    // @ts-ignore
    global.DOMPoint = class DOMPoint {
        x = 0; y = 0; z = 0; w = 1;
        constructor(x = 0, y = 0, z = 0, w = 1) {
            this.x = x; this.y = y; this.z = z; this.w = w;
        }
        matrixTransform() { return this; }
    };
    console.log('[Polyfill] DOMPoint defined globally.');
} else {
    // console.log('[Polyfill] DOMMatrix/DOMPoint already exists.');
}

export { }; // Ensure it's treated as a module
