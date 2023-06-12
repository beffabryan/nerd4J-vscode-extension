"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const node_test_1 = require("node:test");
const codeGenerator_1 = require("../../../codeGenerator");
(0, node_test_1.describe)('generateHashCode', () => {
    // test hashCode with selected attributes
    (0, node_test_1.it)('should generate the correct code for hashCode method', () => {
        const selectedAttributes = ['String name', 'int age', 'boolean isActive'];
        const expectedCode = '\n@Override\npublic int hashCode() {\n\treturn Hashcode.of(name, age, isActive);\n}\n';
        const generatedCode = (0, codeGenerator_1.generateHashCode)(selectedAttributes);
        assert.strictEqual(generatedCode.trim(), expectedCode.trim());
    });
    // test hashCode with empty selected attributes
    (0, node_test_1.it)('should return an empty string when selected attributes are empty', () => {
        const selectedAttributes = [];
        const generatedCode = (0, codeGenerator_1.generateHashCode)(selectedAttributes);
        assert.strictEqual(generatedCode, '');
    });
});
//# sourceMappingURL=hashCodeGenerator.test.js.map