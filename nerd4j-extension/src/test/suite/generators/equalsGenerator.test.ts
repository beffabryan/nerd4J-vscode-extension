import * as assert from 'assert';
import { describe, it } from 'node:test';
import { generateEquals } from '../../../codeGenerator';

describe('generateEquals', () => {

    const tabs = '';

    // test equals with selected attributes
    it('should generate the correct code for equals method', async () => {
        const selectedOptions = [{label: 'String name', picked: true, description: ""},
        {label: 'int age', picked: true, description: ""},
        {label: 'boolean isActive', picked: true, description: ""}];

        let expectedCode = `\n${tabs}/**\n${tabs} * ` 
            + `{@inheritDoc}\n${tabs} */\n${tabs}@Override\n${tabs}public boolean equals(Object other) `
            + `{\n${tabs}\treturn Equals.ifSameClass(this, other,`
            + `\n${tabs}\t\to -> o.name, `
            + `\n${tabs}\t\to -> o.age, `
            + `\n${tabs}\t\to -> o.isActive`
            + `\n${tabs}\t);\n${tabs}}\n`;

        const generatedCode = await generateEquals(selectedOptions);
        assert.strictEqual(`${generatedCode}`.trim(), expectedCode.trim());
    });

    // test equals with empty selected attributes
    it('should return an empty string when selected attributes are empty', async () => {
        const selectedOptions: any = [{}];
        const generatedCode = await generateEquals(selectedOptions);

        let expectedCode = `\n${tabs}/**\n${tabs} * `
            + `{@inheritDoc}\n${tabs} */\n${tabs}@Override\n${tabs}public boolean equals(Object other) `
            + `{\n${tabs}\treturn Equals.ifSameClass(this, other`;
        expectedCode += `);\n${tabs}}\n`;
        
        assert.strictEqual(generatedCode, expectedCode);
    });
});
