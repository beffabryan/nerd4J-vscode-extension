import { generateToStringCode } from '../../../codeGenerator';
import * as assert from 'assert';
import { describe, it } from 'node:test';

describe('generateToStringCode', () => {

    const tabs = '';

    // toString
    it('should return the expected code', async () => {
        const selectedAttributes = ['int age', 'String name'];
        const selectedType = 'likeFunction';

        let expectedCode = `\n${tabs}/**\n${tabs} * {@inheritDoc}\n${tabs} */\n${tabs}@Override\n${tabs}public String toString() {\n${tabs}\treturn ToString.of(this)`
            + '\n\t\t.print("age", age)'
            + '\n\t\t.print("name", name)'
            + '\n\t\t.likeFunction();\n}\n';

        const generatedCode = await generateToStringCode(selectedAttributes, selectedType);

        assert.strictEqual(generatedCode, expectedCode);
    });

    // no selected attributes
    it('should handle empty selectedAttributes', async () => {
        const selectedAttributes: any[] = [];
        const selectedType = 'likeFunction';

        const generatedCode = await generateToStringCode(selectedAttributes, selectedType);
        const expectedCode = `\n${tabs}/**\n${tabs} * {@inheritDoc}\n${tabs} */\n${tabs}@Override\n${tabs}public String toString() {\n${tabs}\treturn ToString.of(this)`
            + `\n${tabs}\t\t.likeFunction();\n${tabs}}\n`;

        assert.strictEqual(generatedCode, expectedCode);
    });
});