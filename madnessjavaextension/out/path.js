"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.existingPath = void 0;
const path_1 = require("path");
const fs = require("fs");
// Maven, Buildr, Grails, Leiningen
const STANDARD_COMPILED_FOLDER = (0, path_1.join)('target', 'classes');
// Ant
const ANT_COMPILED_FOLDER = (0, path_1.join)('build', 'classes');
// SBT
const possiblePaths = [
    ANT_COMPILED_FOLDER,
    STANDARD_COMPILED_FOLDER
];
// return the path of the compiled folder
function existingPath(projectPath) {
    for (const possiblePath of possiblePaths) {
        const path = (0, path_1.join)(projectPath, possiblePath);
        if (fs.existsSync(path))
            return path;
    }
    return '';
}
exports.existingPath = existingPath;
//# sourceMappingURL=path.js.map