"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const node_test_1 = require("node:test");
const codeGenerator_1 = require("../../../codeGenerator");
(0, node_test_1.describe)('generateWithFields', () => {
    // test with fields
    (0, node_test_1.it)('should generate the correct code for selected attributes', () => {
        const selectedAttributes = ['String name', 'int age'];
        const className = 'Person';
        const expectedCode = '\npublic Person withName(String value) {'
            + '\n\tthis.name = value;\n\treturn this;\n}\n'
            + '\npublic Person withAge(int value) {\n\tthis.age = value;\n\treturn this;\n}\n';
        const generatedCode = (0, codeGenerator_1.generateWithFields)(selectedAttributes, className);
        assert.strictEqual(generatedCode.trim(), expectedCode.trim());
    });
    // test with empty selected attributes
    (0, node_test_1.it)('should return an empty string when selected attributes are empty', () => {
        const selectedAttributes = [];
        const className = 'Person';
        const generatedCode = (0, codeGenerator_1.generateWithFields)(selectedAttributes, className);
        assert.strictEqual(generatedCode, '');
    });
});
//# sourceMappingURL=withFieldGenerator.test.js.map