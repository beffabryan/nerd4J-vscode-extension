import * as assert from 'assert';
import { describe, it } from 'node:test';
import { generateHashCode } from '../../../codeGenerator';

describe('generateHashCode', () => {

    const tabs = '';

    // test hashCode with selected attributes
    it('should generate the correct code for hashCode method', async () => {
        const selectedAttributes = ['String name', 'int age', 'boolean isActive'];
        let expectedCode = `\n${tabs}/**\n${tabs} * {@inheritDoc}\n${tabs} */\n${tabs}@Override\n${tabs}public int hashCode() {\n${tabs}\treturn Hashcode.of(`
            + `name, age, isActive` + `);\n${tabs}}\n`;

        const generatedCode = await generateHashCode(selectedAttributes);
        assert.strictEqual(`${generatedCode}`.trim(), expectedCode.trim());
    });

    // test hashCode with empty selected attributes
    it('should return an empty string when selected attributes are empty', async () => {
        const selectedAttributes: string[] = [];

        let expectedCode = `\n${tabs}/**\n${tabs} * {@inheritDoc}\n${tabs} */\n${tabs}@Override\n${tabs}public int hashCode() {\n${tabs}\treturn Hashcode.of(`
            + `0` + `);\n${tabs}}\n`;

        const generatedCode = await generateHashCode(selectedAttributes);
        assert.strictEqual(generatedCode, expectedCode);
    });
});
