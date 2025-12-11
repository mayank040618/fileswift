// Polyfill DOMMatrix/DOMPoint for Node.js (Required for pdf-lib/pdf-parse/etc)
if (typeof global.DOMMatrix === 'undefined') {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        constructor(init?: any) {
            if (init) { this.a = init.a; this.b = init.b; this.c = init.c; this.d = init.d; this.e = init.e; this.f = init.f; }
        }
    };
}
if (typeof global.DOMPoint === 'undefined') {
    // @ts-ignore
    global.DOMPoint = class DOMPoint { x = 0; y = 0; w = 1; constructor(x = 0, y = 0) { this.x = x; this.y = y; } matrixTransform() { return this; } };
}
console.log('✅ DOMMatrix Polyfill Loaded');
