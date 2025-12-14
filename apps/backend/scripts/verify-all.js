"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var axios_1 = require("axios");
var form_data_1 = require("form-data");
var pdf_lib_1 = require("pdf-lib");
var API_URL = process.env.API_URL || 'http://localhost:8080';
var TMP_DIR = path_1.default.join(__dirname, '../../temp_test');
if (!fs_1.default.existsSync(TMP_DIR))
    fs_1.default.mkdirSync(TMP_DIR);
var TEST_PDF = path_1.default.join(TMP_DIR, 'test.pdf');
var TEST_IMG = path_1.default.join(TMP_DIR, 'test.png');
// 1. Generate Assets
function generateAssets() {
    return __awaiter(this, void 0, void 0, function () {
        var pdfDoc, page, _a, _b, _c, pngBuffer, _d, Document, Packer, Paragraph, doc, docBuffer;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, pdf_lib_1.PDFDocument.create()];
                case 1:
                    pdfDoc = _e.sent();
                    page = pdfDoc.addPage();
                    page.drawText('Smoke Test Content for FileSwift', { x: 50, y: 700 });
                    _b = (_a = fs_1.default).writeFileSync;
                    _c = [TEST_PDF];
                    return [4 /*yield*/, pdfDoc.save()];
                case 2:
                    _b.apply(_a, _c.concat([_e.sent()]));
                    pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
                    fs_1.default.writeFileSync(TEST_IMG, pngBuffer);
                    _d = require('docx'), Document = _d.Document, Packer = _d.Packer, Paragraph = _d.Paragraph;
                    doc = new Document({
                        sections: [{ children: [new Paragraph("Smoke Test DOCX Content")] }]
                    });
                    return [4 /*yield*/, Packer.toBuffer(doc)];
                case 3:
                    docBuffer = _e.sent();
                    fs_1.default.writeFileSync(path_1.default.join(TMP_DIR, 'test.docx'), docBuffer);
                    return [2 /*return*/];
            }
        });
    });
}
function runTest(toolId, filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var form, uploadRes, jobId, status_1, result, attempts, jobRes, downloadUrl, dlRes, e_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("\nTesting [".concat(toolId, "]..."));
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, , 9]);
                    form = new form_data_1.default();
                    form.append('files', fs_1.default.createReadStream(filePath)); // Field name 'files' for generic upload (based on Frontend ToolClient)
                    // Actually upload.ts checks for part.type === 'file' and pushes to uploadedFiles. Field name for file doesn't matter much but Frontend uses 'files'.
                    // upload.ts also checks part.fieldname === 'toolId'.
                    form.append('toolId', toolId);
                    return [4 /*yield*/, axios_1.default.post("".concat(API_URL, "/upload"), form, {
                            headers: __assign({}, form.getHeaders())
                        })];
                case 2:
                    uploadRes = _b.sent();
                    jobId = uploadRes.data.jobId;
                    if (!jobId)
                        throw new Error('No Job ID returned');
                    console.log("  Job ID: ".concat(jobId));
                    status_1 = 'processing';
                    result = null;
                    attempts = 0;
                    _b.label = 3;
                case 3:
                    if (!(status_1 !== 'completed' && status_1 !== 'failed' && attempts < 30)) return [3 /*break*/, 6];
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 1000); })];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, axios_1.default.get("".concat(API_URL, "/api/jobs/").concat(jobId, "/status"))];
                case 5:
                    jobRes = _b.sent();
                    status_1 = jobRes.data.status;
                    result = jobRes.data;
                    process.stdout.write('.');
                    attempts++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log('');
                    if (status_1 !== 'completed') {
                        console.error('Job Error:', result === null || result === void 0 ? void 0 : result.error);
                        throw new Error("Job failed or timed out. Status: ".concat(status_1));
                    }
                    downloadUrl = result.downloadUrl;
                    if (!downloadUrl)
                        throw new Error('No download URL');
                    return [4 /*yield*/, axios_1.default.get(downloadUrl, { responseType: 'arraybuffer' })];
                case 7:
                    dlRes = _b.sent();
                    if (dlRes.status !== 200)
                        throw new Error("Download failed: ".concat(dlRes.status));
                    if (dlRes.data.length === 0)
                        throw new Error('Downloaded file is empty');
                    console.log("  \u2705 Success! Output size: ".concat(dlRes.data.length, " bytes"));
                    return [2 /*return*/, true];
                case 8:
                    e_1 = _b.sent();
                    console.error("  \u274C Failed: ".concat(e_1.message));
                    if ((_a = e_1.response) === null || _a === void 0 ? void 0 : _a.data)
                        console.error('  Server Error:', JSON.stringify(e_1.response.data));
                    return [2 /*return*/, false];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('=== Starting Smoke Tests ===');
                    return [4 /*yield*/, generateAssets()];
                case 1:
                    _a.sent();
                    // PDF Tools
                    return [4 /*yield*/, runTest('pdf-to-word', TEST_PDF)];
                case 2:
                    // PDF Tools
                    _a.sent();
                    return [4 /*yield*/, runTest('compress-pdf', TEST_PDF)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, runTest('rotate-pdf', TEST_PDF)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, runTest('doc-to-pdf', path_1.default.join(TMP_DIR, 'test.docx'))];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, runTest('ai-summary', TEST_PDF)];
                case 6:
                    _a.sent();
                    // Image Tools
                    // Fixed IDs:
                    return [4 /*yield*/, runTest('image-resizer', TEST_IMG)];
                case 7:
                    // Image Tools
                    // Fixed IDs:
                    _a.sent();
                    return [4 /*yield*/, runTest('image-compressor', TEST_IMG)];
                case 8:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
