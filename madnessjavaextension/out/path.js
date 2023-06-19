"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.existingPath = exports.deleteCustomizedPath = exports.setCustomizedPath = void 0;
const path_1 = require("path");
const fs = require("fs");
const vscode = require("vscode");
// Maven, Buildr, Grails, Leiningen
const STANDARD_COMPILED_FOLDER = (0, path_1.join)('target', 'classes');
// Ant
const ANT_COMPILED_FOLDER = (0, path_1.join)('build', 'classes');
// custo path
let customCompiledPath = '';
// the order is important
let possiblePaths = [
    ANT_COMPILED_FOLDER,
    STANDARD_COMPILED_FOLDER
];
function setCustomizedPath(path) {
    customCompiledPath = path;
}
exports.setCustomizedPath = setCustomizedPath;
function deleteCustomizedPath() {
    customCompiledPath = '';
}
exports.deleteCustomizedPath = deleteCustomizedPath;
// return the path of the compiled folder
function existingPath(projectPath) {
    // check custom path
    if (customCompiledPath !== '' && fs.existsSync(customCompiledPath)) {
        vscode.window.showWarningMessage(`The path ${customCompiledPath} was found`);
        return customCompiledPath;
    }
    for (const possiblePath of possiblePaths) {
        const path = (0, path_1.join)(projectPath, possiblePath);
        if (fs.existsSync(path))
            return path;
    }
    return '';
}
exports.existingPath = existingPath;
//# sourceMappingURL=path.js.map