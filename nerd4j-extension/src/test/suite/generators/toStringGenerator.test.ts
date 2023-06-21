import { generateToStringCode } from '../../../codeGenerator';
import * as assert from 'assert';
import { describe, it } from 'node:test';

describe('generateToStringCode', () => {

    // toString
    it('should return the expected code', () => {
        const selectedAttributes = ['int age', 'String name'];
        const selectedType = 'likeFunction';

        let expectedCode = '\n@Override\npublic String toString() {\n\treturn ToString.of(this)'
            + '\n\t\t.print("age", age)'
            + '\n\t\t.print("name", name)'
            + '\n\t\t.likeFunction();\n}';

        const generatedCode = generateToStringCode(selectedAttributes, selectedType);

        assert.strictEqual(generatedCode, expectedCode);
    });

    // no selected attributes
    it('should handle empty selectedAttributes', () => {
        const selectedAttributes: any[] = [];
        const selectedType = 'likeFunction';
        const generatedCode = generateToStringCode(selectedAttributes, selectedType);

        assert.strictEqual(generatedCode, '');
    });
});