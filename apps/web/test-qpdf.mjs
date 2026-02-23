import qpdf from '@jspawn/qpdf-wasm';

async function test() {
    try {
        const mod = await qpdf({
            print: text => console.log('stdout:', text),
            printErr: text => console.error('stderr:', text),
        });
        console.log("Keys:", Object.keys(mod).filter(k => k.startsWith('callMain') || k.startsWith('FS')));
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
