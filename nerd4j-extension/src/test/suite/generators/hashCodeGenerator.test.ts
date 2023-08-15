import * as assert from 'assert';
import { describe, it } from 'node:test';
import { generateHashCode } from '../../../codeGenerator';

describe('generateHashCode', () => {

    // test hashCode with selected attributes
    it('should generate the correct code for hashCode method', () => {
        const selectedAttributes = ['String name', 'int age', 'boolean isActive'];
        const expectedCode = '\n@Override\npublic int hashCode() {\n\treturn Hashcode.of(name, age, isActive);\n}\n';
        const generatedCode = generateHashCode(selectedAttributes);
        assert.strictEqual(`${generatedCode}`.trim(), expectedCode.trim());
    });

    // test hashCode with empty selected attributes
    it('should return an empty string when selected attributes are empty', () => {
        const selectedAttributes: string[] = [];
        const generatedCode = generateHashCode(selectedAttributes);
        assert.strictEqual(generatedCode, '');
    });
});
