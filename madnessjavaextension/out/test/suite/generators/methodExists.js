"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codeGenerator_1 = require("../../../codeGenerator");
const assert = require("assert");
const node_test_1 = require("node:test");
(0, node_test_1.describe)('generateToStringCode', () => {
    (0, node_test_1.it)('should return the expected code', () => {
        const selectedAttributes = ['int age', 'String name'];
        const selectedType = 'likeFunction';
        let expectedCode = '\n@Override\npublic String toString() {\n\treturn ToString.of(this)'
            + '\n\t\t.print("age", age)'
            + '\n\t\t.print("name", name)'
            + '\n\t\t.likeFunction();\n}';
        const generatedCode = (0, codeGenerator_1.generateToStringCode)(selectedAttributes, selectedType);
        assert.strictEqual(generatedCode, expectedCode);
    });
    (0, node_test_1.it)('should handle empty selectedAttributes', () => {
        const selectedAttributes = [];
        const selectedType = 'likeFunction';
        const generatedCode = (0, codeGenerator_1.generateToStringCode)(selectedAttributes, selectedType);
        assert.strictEqual(generatedCode, '');
    });
});
//# sourceMappingURL=methodExists.js.map