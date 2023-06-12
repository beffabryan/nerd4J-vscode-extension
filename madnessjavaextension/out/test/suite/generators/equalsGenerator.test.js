"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const node_test_1 = require("node:test");
const codeGenerator_1 = require("../../../codeGenerator");
(0, node_test_1.describe)('generateEquals', () => {
    // test equals with selected attributes
    (0, node_test_1.it)('should generate the correct code for equals method', () => {
        const selectedAttributes = ['String name', 'int age', 'boolean isActive'];
        const expectedCode = '\n@Override\npublic boolean equals(Object other) {\n\treturn Equals.ifSameClass(this, other,'
            + '\n\t\to -> o.name, '
            + '\n\t\to -> o.age, '
            + '\n\t\to -> o.isActive'
            + '\n\t);\n}';
        const generatedCode = (0, codeGenerator_1.generateEquals)(selectedAttributes);
        assert.strictEqual(generatedCode.trim(), expectedCode.trim());
    });
    // test equals with empty selected attributes
    (0, node_test_1.it)('should return an empty string when selected attributes are empty', () => {
        const selectedAttributes = [];
        const generatedCode = (0, codeGenerator_1.generateEquals)(selectedAttributes);
        assert.strictEqual(generatedCode, '');
    });
});
//# sourceMappingURL=equalsGenerator.test.js.map