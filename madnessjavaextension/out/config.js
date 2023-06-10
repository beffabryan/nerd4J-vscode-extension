"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JAVA_COMPILED_FOLDER = exports.JAVA_COMMAND = void 0;
const path_1 = require("path");
const JAVA_ANALYZER_FOLDER = (0, path_1.join)(__dirname, '..', 'src', 'java');
const JAVA_FILE_NAME = 'FileAnalyzer';
exports.JAVA_COMMAND = `java -cp ${JAVA_ANALYZER_FOLDER} ${JAVA_FILE_NAME}`;
exports.JAVA_COMPILED_FOLDER = (0, path_1.join)('target', 'classes');
//# sourceMappingURL=config.js.map