import * as vscode from 'vscode';

/**
 * Check if the import exists
 * 
 * @param importRegExp of the current java file
 * @returns true if the import exists
 */
export function checkIfCodeExists(importRegExp: RegExp) {
	const editor = vscode.window.activeTextEditor;
	const editorText = editor?.document.getText();

	const match = importRegExp.exec(editorText!);

	return match ? true : false;
}

/**
 * Returns the package name of the current java file
 * 
 * @param code code of the current java file 
 * @returns package name
 */
export function getPackageName(code: string) {
	const packageRegExp: RegExp = /package\s+([a-zA-Z0-9.]+);/g;
	const match = packageRegExp.exec(code!);
	return match ? match[1] : "";
}

/**
 * Check if the there is a javadoc comment before the method
 * 
 * @param oldCodeIndex index of the old method code
 * @returns index of the javadoc comment
 */
function checkJavadocComment(oldCodeIndex: number): number {

	const editor = vscode.window.activeTextEditor;
	const editorText = editor?.document.getText();

	if (!editorText) {
		return oldCodeIndex;
	}

	let index = oldCodeIndex;
	let ignoreChar = false;

	for (index; index >= 0; index--) {
		const currentChar = editorText.charAt(index);

		if (currentChar === '/') {
			if (editorText.charAt(index - 1) === '*') {
				ignoreChar = true;
			}
		}

		if (!ignoreChar && (currentChar === ';' || currentChar === '}' || currentChar === '{')) {
			return oldCodeIndex;
		}

		if (currentChar === '*') {
			if (editorText.charAt(index - 1) === '*') {
				if (editorText.charAt(index - 2) === '/') {
					return index - 2;
				}
			}
		}
	}

	return oldCodeIndex;
}

/**
 * Replace the old code with the new code
 * 
 * @param regex regex to find the old code
 * @param newCode new code to replace the old code
 */
export async function replaceOldCode(regex: RegExp, newCode: string) {

	const editor = vscode.window.activeTextEditor;
	const editorText = editor?.document.getText();
	const match = regex.exec(editorText!);

	if (match) {

		const oldCode = match[0];
		let oldCodeIndex = editorText?.indexOf(oldCode);

		if (oldCodeIndex) {

			// check if there is a javadoc comment
			const oldCodeLastIndex = editor!.document.positionAt(oldCodeIndex + oldCode.length);
			oldCodeIndex = checkJavadocComment(oldCodeIndex);

			const range = new vscode.Range(editor!.document.positionAt(oldCodeIndex), oldCodeLastIndex);
			await editor?.edit(editBuilder => {
				editBuilder.replace(range, newCode);
			});
		}
	}
}

/**
 * Generate the code for the toString method
 * 
 * @param selectedAttributes selected attributes included in the toString method
 * @param layoutType layout type of the toString method
 * @returns toString method code generated
 */
export async function generateToStringCode(selectedAttributes: string[], layoutType: string): Promise<string> {

	const tabs = insertTab(getIndentation());
	let code = `\n${tabs}/**\n${tabs} * {@inheritDoc}\n${tabs} */\n${tabs}@Override\n${tabs}public String toString() {\n${tabs}\treturn ToString.of(this)`;

	for (const attribute of selectedAttributes) {
		const attributeName = attribute.split(" ")[1]; // get variable name
		if (attributeName) {
			code += `\n${tabs}\t\t.print("${attributeName}", ${attributeName})`;
		}
	}

	code += `\n${tabs}\t\t.${layoutType}();\n${tabs}}\n`;
	return code;
}

/**
 * Generate the code for the equals method
 * 
 * @param selectedAttributes selected attributes included in the equals method
 * @returns equals method code generated
 */
export async function generateEquals(selectedAttributes: string[]): Promise<string> {

	const tabs = insertTab(getIndentation());
	let code = `\n${tabs}/**\n${tabs} * {@inheritDoc}\n${tabs} */\n${tabs}@Override\n${tabs}public boolean equals(Object other) {\n${tabs}\treturn Equals.ifSameClass(this, other`;
	if (selectedAttributes.length === 0) {
		code += `);\n${tabs}}\n`;
	} else {
		code += ',';

		for (let i = 0; i < selectedAttributes.length; i++) {
			const attributeName = selectedAttributes[i].split(" ")[1];

			if (attributeName) {
				code += `\n${tabs}\t\to -> o.${attributeName}`;

				//check index
				if (i !== selectedAttributes.length - 1) {
					code += ', ';
				}
			}
		}

		code += `\n${tabs}\t);\n${tabs}}\n`;
	}
	return code;
}

/**
 * Generate the code for the hashCode method
 * 
 * @param selectedAttributes selected attributes included in the hashCode method
 * @returns hashCode method code generated
 */
export async function generateHashCode(selectedAttributes: string[]): Promise<string> {

	const tabs = insertTab(getIndentation());
	let code = `\n${tabs}/**\n${tabs} * {@inheritDoc}\n${tabs} */\n${tabs}@Override\n${tabs}public int hashCode() {\n${tabs}\treturn Hashcode.of(`;

	if (selectedAttributes.length === 0) {
		code += '0';
	} else {
		for (let i = 0; i < selectedAttributes.length; i++) {
			const attributeName = selectedAttributes[i].split(" ")[1];

			if (attributeName) {
				code += `${attributeName}`;

				//check index
				if (i !== selectedAttributes.length - 1) {
					code += ', ';
				}
			}
		}
	}

	code += `);\n${tabs}}\n`;
	return code;;

}

/**
 * Generate the code for the whitField methods
 * 
 * @param selectedAttributes selected attributes included in the withField methods
 * @param className name of the class
 * @returns withField methods code generated
 */
export function generateWithFields(selectedAttributes: string[], className: string): string {

	let code = '';

	for (let i = 0; i < selectedAttributes.length; i++) {
		const attributeType = selectedAttributes[i].split(" ")[0];
		const attributeName = selectedAttributes[i].split(" ")[1];

		if (attributeName) {

			const tabs = insertTab(getIndentation());

			//set first letter to upper case
			const methodName = 'with' + attributeName.charAt(0).toUpperCase() + attributeName.slice(1);
			const methodSignature = `public ${className} ${methodName}(${attributeType} ${attributeName})`;

			//escape special characters
			const escapedClassName = className.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
			const escapedMethodName = methodName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
			const withFieldRegExpPattern = `public\\s+${escapedClassName}\\s+${escapedMethodName}\\s*\\(\\s*[^\\s]+\\s+[^\\s]+\\s*\\)\\s*\\{`;

			const withFieldRegExp = new RegExp(withFieldRegExpPattern);

			//check if method already exists
			if (!checkIfCodeExists(withFieldRegExp)) {
				code += `\n${tabs}${methodSignature} {\n${tabs}\tthis.${attributeName} = ${attributeName};\n${tabs}\treturn this;\n${tabs}}\n`;
			} else {
				vscode.window.showInformationMessage(`Method ${methodName}() already exists`);
			}
		}
	}
	return code;
}

/**
 * Generate the code for the setter methods
 * 
 * @param selectedAttributes selected attributes included in the setter methods
 * @returns setter methods code generated
 */
export function generateSetter(selectedAttributes: string[]): string {

	let code = '';

	for (let i = 0; i < selectedAttributes.length; i++) {
		const attributeType = selectedAttributes[i].split(" ")[0];
		const attributeName = selectedAttributes[i].split(" ")[1];

		if (attributeName) {

			const tabs = insertTab(getIndentation());

			//set first letter to upper case
			const methodName = 'set' + attributeName.charAt(0).toUpperCase() + attributeName.slice(1);
			const methodSignature = `public void ${methodName}(${attributeType} ${attributeName})`;

			//escape special characters
			const escapedMethodName = methodName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
			const setterRegExpPattern = `public\\s+void\\s+${escapedMethodName}\\s*\\(\\s*[^\\s]+\\s+[^\\s]+\\s*\\)\\s*\\{`;

			const setterRegExp = new RegExp(setterRegExpPattern);

			//check if method already exists
			if (!checkIfCodeExists(setterRegExp)) {
				code += `\n${tabs}${methodSignature} {\n${tabs}\tthis.${attributeName} = ${attributeName};\n${tabs}}\n`;
			} else {
				vscode.window.showInformationMessage(`Method ${methodName}() already exists`);
			}
		}
	}
	return code;
}

/**
 * Generate the code for the etgter methods
 * 
 * @param selectedAttributes selected attributes included in the getter methods
 * @returns getter methods code generated
 */
export function generateGetter(selectedAttributes: string[]): string {

	let code = '';

	for (let i = 0; i < selectedAttributes.length; i++) {
		const attributeType = selectedAttributes[i].split(" ")[0];
		const attributeName = selectedAttributes[i].split(" ")[1];

		if (attributeName) {

			const tabs = insertTab(getIndentation());

			//set first letter to upper case
			const methodName = 'get' + attributeName.charAt(0).toUpperCase() + attributeName.slice(1);
			const methodSignature = `public ${attributeType} ${methodName}()`;

			//escape special characters
			const escapedMethodName = methodName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
			const getterRegExpPattern = `public\\s+${attributeType}\\s+${escapedMethodName}\\s*\\(\\s*\\)\\s*\\{`;
			const getterRegExp = new RegExp(getterRegExpPattern);

			//check if method already exists
			if (!checkIfCodeExists(getterRegExp)) {
				code += `\n${tabs}${methodSignature} {\n${tabs}\treturn ${attributeName};\n${tabs}}\n`;
			} else {
				vscode.window.showInformationMessage(`Method ${methodName}() already exists`);
			}
		}
	}
	return code;
}

/**
 * Insert and returns the number of tabs to indent correctly the code
 * 
 * @param times number of tabs to insert
 * @returns string of tabs
 */
function insertTab(times: number): string {
	const character = '\t';
	return character.repeat(times);
}

/**
 * Returns the number of tabs needed to indent correctly the code
 * 
 * @returns number of tabs
 */
function getIndentation(): number {

	const editor = vscode.window.activeTextEditor;

	let indentation = 0;
	if (editor) {

		const document = editor?.document;
		const currentPosition = editor?.selection.active;
		const range = new vscode.Range(new vscode.Position(0, 0), currentPosition);
		const textUntilCursor = document?.getText(range);


		for (let i = 0; i < textUntilCursor?.length; i++) {
			if (textUntilCursor[i] === '{') {
				indentation++;
			} else if (textUntilCursor[i] === '}') {
				indentation--;
			}
		}
	}
	return indentation;
}