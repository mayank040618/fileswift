if (typeof global.DOMMatrix === "undefined") {
    try {
        // Use simple JS fallback to prevent SSR crashes
        // @ts-ignore
        global.DOMMatrix = class DOMMatrix {
            constructor() { }
        };
    } catch (err) {
        // No-op safeguard
    }
}
