import * as assert from 'assert';
import { describe, it } from 'node:test';
import { getPackageName } from '../../../codeGenerator';

describe('getPackageName', () => {

    // test package name present
    it('should return the package name when it is present in the text', () => {
        const text = 'package com.example;';
        const packageName = getPackageName(text);
        assert.strictEqual(packageName, 'com.example');
    });

    // test package name not present
    it('should return an empty string when the package name is not present in the text', () => {
        const text = 'some random text';
        const packageName = getPackageName(text);
        assert.strictEqual(packageName, '');
    });
});
