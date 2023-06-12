import * as assert from 'assert';
import { describe, it } from 'node:test';
import { generateWithFields } from '../../../codeGenerator';

describe('generateWithFields', () => {

    // test with fields
    it('should generate the correct code for selected attributes', () => {
        const selectedAttributes = ['String name', 'int age'];
        const className = 'Person';
        const expectedCode = '\npublic Person withName(String value) {'
            + '\n\tthis.name = value;\n\treturn this;\n}\n'
            + '\npublic Person withAge(int value) {\n\tthis.age = value;\n\treturn this;\n}\n';

        const generatedCode = generateWithFields(selectedAttributes, className);
        assert.strictEqual(generatedCode.trim(), expectedCode.trim());
    });

    // test with empty selected attributes
    it('should return an empty string when selected attributes are empty', () => {
        const selectedAttributes: string[] = [];
        const className = 'Person';
        const generatedCode = generateWithFields(selectedAttributes, className);
        assert.strictEqual(generatedCode, '');
    });
});
