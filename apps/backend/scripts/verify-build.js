"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var child_process_1 = require("child_process");
// Simple color release
var green = function (msg) { return "\u001B[32m".concat(msg, "\u001B[0m"); };
var red = function (msg) { return "\u001B[31m".concat(msg, "\u001B[0m"); };
var yellow = function (msg) { return "\u001B[33m".concat(msg, "\u001B[0m"); };
var BACKEND_ROOT = path_1.default.join(__dirname, '..');
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var failed, jsonFiles, _i, jsonFiles_1, file, filePath, content, output, pkg;
        var _a;
        return __generator(this, function (_b) {
            console.log(yellow("=== FileSwift Integrity Check ===\n"));
            failed = false;
            // 1. JSON Validation
            console.log("1. Checking JSON Configuration Files...");
            jsonFiles = [
                'package.json',
                'tsconfig.json',
                '../../package.json' // Root
            ];
            for (_i = 0, jsonFiles_1 = jsonFiles; _i < jsonFiles_1.length; _i++) {
                file = jsonFiles_1[_i];
                filePath = path_1.default.join(BACKEND_ROOT, file);
                try {
                    if (fs_1.default.existsSync(filePath)) {
                        content = fs_1.default.readFileSync(filePath, 'utf-8');
                        JSON.parse(content);
                        console.log("  \u2705 ".concat(file, " is valid JSON"));
                    }
                    else {
                        console.log(yellow("  \u26A0\uFE0F  ".concat(file, " not found (skipping)")));
                    }
                }
                catch (e) {
                    console.error(red("  \u274C ".concat(file, " INVALID JSON: ").concat(e.message)));
                    failed = true;
                }
            }
            // 2. TSC Check (Build)
            console.log("\n2. verifying TypeScript Build...");
            try {
                console.log("  Running 'tsc --noEmit'...");
                (0, child_process_1.execSync)('npx tsc --noEmit', { cwd: BACKEND_ROOT, stdio: 'pipe' });
                console.log(green("  ✅ TypeScript compiles successfully"));
            }
            catch (e) {
                console.error(red("  ❌ TypeScript Build Failed"));
                output = ((_a = e.stdout) === null || _a === void 0 ? void 0 : _a.toString()) || e.message;
                console.error(output.split('\n').slice(0, 10).join('\n'));
                failed = true;
            }
            // 3. Worker Compatibility Check
            console.log("\n3. Checking Production Worker Config...");
            pkg = JSON.parse(fs_1.default.readFileSync(path_1.default.join(BACKEND_ROOT, 'package.json'), 'utf-8'));
            if (pkg.scripts['start:prod'] && pkg.scripts['start:prod'].includes('node dist/index.js')) {
                console.log(green("  ✅ 'start:prod' script is correctly configured for production"));
            }
            else {
                console.error(red("  ❌ 'start:prod' script missing or incorrect (Must use 'node dist/index.js')"));
                failed = true;
            }
            if (failed) {
                console.log(red("\n❌ VERIFICATION FAILED - DO NOT PUSH"));
                process.exit(1);
            }
            else {
                console.log(green("\n✅ VERIFICATION PASSED - SAFETY CHECK OK"));
            }
            return [2 /*return*/];
        });
    });
}
main();
