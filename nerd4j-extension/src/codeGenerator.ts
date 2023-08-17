import * as vscode from 'vscode';
import { EQUALS_SIGNATURE, HASHCODE_SIGNATURE, TO_STRING_SIGNATURE } from './config';

// check if method already exists
export function checkIfMethodAlreadyExists(methodName: string) {
	const editor = vscode.window.activeTextEditor;
	const editorText = editor?.document.getText();

	// check if to string exitst
	return editorText?.includes(methodName);
}

// show warning message
function showInformationMessage(message: string) {
	vscode.window.showInformationMessage(message);
}

// get package name
export function getPackageName(text: string) {
	const packageRegExp: RegExp = /package\s+([a-zA-Z0-9.]+);/g;
	const match = packageRegExp.exec(text!);
	return match ? match[1] : "";
}

// check if there is a javadoc comment
function checkJavadocComment(oldCodeIndex: number): number {

	const editor = vscode.window.activeTextEditor;
	const editorText = editor?.document.getText();

	if (!editorText) {
		return oldCodeIndex;
	}

	let index = oldCodeIndex;
	let ignoreChar = false;

	for (index; index >= 0; index--) {

		if (editorText.charAt(index) === '/') {
			if (editorText.charAt(index - 1) === '*') {
				ignoreChar = true;
			}
		}

		if (!ignoreChar && (editorText.charAt(index) === ';' || editorText.charAt(index) === '}' || editorText.charAt(index) === '{')) {
			return oldCodeIndex;
		}

		if (editorText.charAt(index) === '*') {
			if (editorText.charAt(index - 1) === '*') {
				if (editorText.charAt(index - 2) === '/') {
					return index - 2;
				}
			}
		}
	}

	return oldCodeIndex;
}

// remove old code
export async function removeOldCode(regex: RegExp) {

	const editor = vscode.window.activeTextEditor;
	const editorText = editor?.document.getText();
	const match = regex.exec(editorText!);

	if (match) {

		const oldCode = match[0];
		let oldCodeIndex = editorText?.indexOf(oldCode);

		if (oldCodeIndex) {

			// check if there is a javadoc comment
			const oldCodeLastIndex = editor!.document.positionAt(oldCodeIndex + oldCode.length)
			oldCodeIndex = checkJavadocComment(oldCodeIndex);

			const range = new vscode.Range(editor!.document.positionAt(oldCodeIndex), oldCodeLastIndex);
			await editor?.edit(editBuilder => {
				editBuilder.delete(range);
			});
		}
	}
}

// generate toString method
export async function generateToStringCode(selectedAttributes: string[], selectedType: string, regenerateCode: boolean = true): Promise<string> {

	//check if toString already exists
	if (checkIfMethodAlreadyExists(TO_STRING_SIGNATURE) && regenerateCode) {
		const ans = await vscode.window.showInformationMessage("The toString() method is already implemented.", "Regenerate", "Cancel");

		if (ans !== "Regenerate") {
			return "";
		}

		// remove old code
		const toStringRegExp = /@Override\s*public\s*String\s*toString\(\)\s*\{[^}]*\}/g;
		await removeOldCode(toStringRegExp);
	}

	const tabs = insertTab(getIndentation());
	let code = `\n${tabs}/**\n${tabs} * {@inheritDoc}\n${tabs} */\n${tabs}@Override\n${tabs}public String toString() {\n${tabs}\treturn ToString.of(this)`;

	for (const attribute of selectedAttributes) {
		const attributeName = attribute.split(" ")[1]; // get variable name
		if (attributeName) {
			code += `\n${tabs}\t\t.print("${attributeName}", ${attributeName})`;
		}
	}

	code += `\n${tabs}\t\t.${selectedType}();\n${tabs}}\n`;
	return code;
}

// generate equals and hashcode method
export async function generateEquals(selectedAttributes: string[], createHashCode: boolean = false, regenerateCode: boolean = true): Promise<string> {

	let code = '';

	//check if equals already exists
	if (checkIfMethodAlreadyExists(EQUALS_SIGNATURE) && regenerateCode) {
		const ans = await vscode.window.showInformationMessage("The equals() method is already implemented.", "Regenerate", "Cancel");

		if (ans !== "Regenerate") {

			if (createHashCode) {
				code += await generateHashCode(selectedAttributes);
			}

			return code;
		}

		// remove old equals
		const equalsRegExp: RegExp = /@Override\s*public\s*boolean\s*equals\(Object\s*other\)\s*\{[^}]*\}/g;
		await removeOldCode(equalsRegExp);
	}

	const tabs = insertTab(getIndentation());
	code += `\n${tabs}/**\n${tabs} * {@inheritDoc}\n${tabs} */\n${tabs}@Override\n${tabs}public boolean equals(Object other) {\n${tabs}\treturn Equals.ifSameClass(this, other`;
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

	if (createHashCode) {
		code += await generateHashCode(selectedAttributes);
	}

	return code;
}

// generate hashCode method
export async function generateHashCode(selectedAttributes: string[], regenerateCode: boolean = true): Promise<string> {

	//check if hashCode already exists
	if (checkIfMethodAlreadyExists(HASHCODE_SIGNATURE) && regenerateCode) {
		const ans = await vscode.window.showInformationMessage("The hashCode() method is already implemented.", "Regenerate", "Cancel");

		if (ans !== "Regenerate") {
			return "";
		}

		// remove old hashcode
		const hashCodeRegExp = /@Override\s*public\s*int\s*hashCode\(\)\s*\{[^}]*\}/g;
		await removeOldCode(hashCodeRegExp)
	}

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

// generate with methods 
export function generateWithFields(selectedAttributes: string[], className: string): string {

	let code = '';

	for (let i = 0; i < selectedAttributes.length; i++) {
		const attributeType = selectedAttributes[i].split(" ")[0];
		const attributeName = selectedAttributes[i].split(" ")[1];

		if (attributeName) {

			const tabs = insertTab(getIndentation());

			//set first letter to upper case
			const methodName = 'with' + attributeName.charAt(0).toUpperCase() + attributeName.slice(1);
			const methodSignature = `public ${className} ${methodName}(${attributeType} value)`;

			//check if method already exists
			if (!checkIfMethodAlreadyExists(methodSignature)) {
				code += `\n${tabs}${methodSignature} {\n${tabs}\tthis.${attributeName} = value;\n${tabs}\treturn this;\n${tabs}}\n`;
			}
		}
	}
	return code;
}

function insertTab(times: number): string {
	const character = '\t';
	return character.repeat(times);
}

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