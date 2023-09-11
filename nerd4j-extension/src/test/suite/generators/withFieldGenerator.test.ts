import * as assert from 'assert';
import { describe, it } from 'node:test';
import { generateWithFields } from '../../../codeGenerator';

describe('generateWithFields', () => {

    // test with fields
    it('should generate the correct code for selected attributes', () => {
        const selectedOptions = [{ label: 'String name', picked: true, description: "" },
        { label: 'int age', picked: true, description: "" },
        { label: 'boolean isActive', picked: true, description: "" }];

        const className = 'Person';
        const expectedCode = '\npublic Person withName(String value) {'
            + '\n\tthis.name = value;\n\treturn this;\n}\n'
            + '\npublic Person withAge(int value) {\n\tthis.age = value;\n\treturn this;\n}\n';

        const generatedCode = generateWithFields(selectedOptions, className);
        assert.strictEqual(generatedCode, expectedCode);
    });

    // test with empty selected attributes
    it('should return an empty string when selected attributes are empty', () => {
        const selectedOptions: any = [];
        const className = 'Person';
        const generatedCode = generateWithFields(selectedOptions, className);
        assert.strictEqual(generatedCode, '');
    });
});
