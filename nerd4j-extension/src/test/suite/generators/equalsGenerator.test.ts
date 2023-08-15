import * as assert from 'assert';
import { describe, it } from 'node:test';
import { generateEquals } from '../../../codeGenerator';
import * as vscode from 'vscode';

describe('generateEquals', () => {

    // test equals with selected attributes
    it('should generate the correct code for equals method', () => {
        const selectedAttributes = ['String name', 'int age', 'boolean isActive'];
        const expectedCode = '\n@Override\npublic boolean equals(Object other) {\n\treturn Equals.ifSameClass(this, other,'
        + '\n\t\to -> o.name, '
        + '\n\t\to -> o.age, '
        + '\n\t\to -> o.isActive'
        + '\n\t);\n}';
        
        const generatedCode = generateEquals(selectedAttributes);
        assert.strictEqual(`${generatedCode}`.trim(), expectedCode.trim());
    });

    // test equals with empty selected attributes
    it('should return an empty string when selected attributes are empty', () => {
        const selectedAttributes: string[] = [];
        const generatedCode = generateEquals(selectedAttributes);
        assert.strictEqual(generatedCode, '');
    });
});
