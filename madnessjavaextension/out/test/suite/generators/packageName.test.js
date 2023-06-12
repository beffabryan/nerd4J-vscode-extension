"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const node_test_1 = require("node:test");
const codeGenerator_1 = require("../../../codeGenerator");
(0, node_test_1.describe)('getPackageName', () => {
    // test package name present
    (0, node_test_1.it)('should return the package name when it is present in the text', () => {
        const text = 'package com.example;';
        const packageName = (0, codeGenerator_1.getPackageName)(text);
        assert.strictEqual(packageName, 'com.example');
    });
    // test package name not present
    (0, node_test_1.it)('should return an empty string when the package name is not present in the text', () => {
        const text = 'some random text';
        const packageName = (0, codeGenerator_1.getPackageName)(text);
        assert.strictEqual(packageName, '');
    });
});
//# sourceMappingURL=packageName.test.js.map