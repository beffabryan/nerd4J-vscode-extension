import * as vscode from 'vscode';
import { EQUALS_SIGNATURE, HASHCODE_SIGNATURE, TO_STRING_SIGNATURE } from './config';

// check if method already exists
function checkIfMethodAlreadyExists(methodName: string) {
	const editor = vscode.window.activeTextEditor;
	const editorText = editor?.document.getText();

	// check if to string exitst
	return editorText?.includes(methodName);
}

// show warning message
function showWarningMessage(message: string) {

	//add all quick fixes
	vscode.window.showWarningMessage(message);
}

// show warning message
function showInformationMessage(message: string) {
	vscode.window.showInformationMessage(message);
}

// get package name
export function getPackageName(text: string): string {
	const packageRegex = /package\s+([a-zA-Z0-9.]+);/g;
	const match = packageRegex.exec(text!);
	return match ? match[1] : "";
}

// check if there is a javadoc comment
function checkJavadocComment(oldCodeIndex: number): number {

	const editor = vscode.window.activeTextEditor;
	const editorText = editor?.document.getText();

	vscode.window.showInformationMessage("index: " + oldCodeIndex);

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

// generate toString method
export async function generateToStringCode(selectedAttributes: string[], selectedType: string): Promise<string> {

	//check if toString already exists
	if (checkIfMethodAlreadyExists(TO_STRING_SIGNATURE)) {
		const ans = await vscode.window.showInformationMessage("The toString() method is already implemented.", "Regenerate", "Cancel");

		if (ans !== "Regenerate") {
			return "";
		}

		// remove old toString
		const editor = vscode.window.activeTextEditor;
		const editorText = editor?.document.getText();
		const toStringRegex = /@Override\s*public\s*String\s*toString\(\)\s*\{[^}]*\}/g;
		const match = toStringRegex.exec(editorText!);

		if (match) {

			const oldToString = match[0];
			let oldToStringIndex = editorText?.indexOf(oldToString);

			if (oldToStringIndex) {

				// check if there is a javadoc comment
				const lastToStringIndex = editor!.document.positionAt(oldToStringIndex + oldToString.length)
				oldToStringIndex = checkJavadocComment(oldToStringIndex);

				const range = new vscode.Range(editor!.document.positionAt(oldToStringIndex), lastToStringIndex);
				editor?.edit(editBuilder => {
					editBuilder.delete(range);
				});
			}
		}
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
	showInformationMessage("toString() method generated");
	return code;
}

// generate equals and hashcode method
export async function generateEquals(selectedAttributes: string[], createHashCode: boolean = false): Promise<string> {

	let code = '';
	let regenerateEquals = false;

	//check if equals already exists
	if (checkIfMethodAlreadyExists(EQUALS_SIGNATURE)) {
		const ans = await vscode.window.showInformationMessage("The equals() method is already implemented.", "Regenerate", "Cancel");

		if (ans !== "Regenerate") {

			if (createHashCode) {
				code += await generateHashCode(selectedAttributes);
			}

			return code;
		}

		// remove old equals
		const editor = vscode.window.activeTextEditor;
		const editorText = editor?.document.getText();
		const equalsRegex = /@Override\s*public\s*boolean\s*equals\(Object\s*other\)\s*\{[^}]*\}/g;
		const match = equalsRegex.exec(editorText!);

		if (match) {

			const oldEquals = match[0];
			let oldEqualsIndex = editorText?.indexOf(oldEquals);

			if (oldEqualsIndex) {

				// check if there is a javadoc comment
				const lastEqualsIndex = editor!.document.positionAt(oldEqualsIndex + oldEquals.length)
				oldEqualsIndex = checkJavadocComment(oldEqualsIndex);

				const range = new vscode.Range(editor!.document.positionAt(oldEqualsIndex), lastEqualsIndex);
				editor?.edit(editBuilder => {
					editBuilder.delete(range);
				});

			}
		}
	}

	const tabs = insertTab(getIndentation());
	code += `\n${tabs}/**\n${tabs} * {@inheritDoc}\n${tabs} */\n${tabs}@Override\n${tabs}public boolean equals(Object other) {\n${tabs}\treturn Equals.ifSameClass(this, other`;
	vscode.window.showInformationMessage("selectedAttributes: " + selectedAttributes.length);
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

	showInformationMessage("equals() method generated");

	return code;
}

// generate hashCode method
export async function generateHashCode(selectedAttributes: string[]): Promise<string> {

	//check if hashCode already exists
	if (checkIfMethodAlreadyExists(HASHCODE_SIGNATURE)) {
		const ans = await vscode.window.showInformationMessage("The hashCode() method is already implemented.", "Regenerate", "Cancel");

		if (ans !== "Regenerate") {
			return "";
		}

		// remove old hashcode
		const editor = vscode.window.activeTextEditor;
		const editorText = editor?.document.getText();
		const hashCodeRegex = /@Override\s*public\s*int\s*hashCode\(\)\s*\{[^}]*\}/g;
		const match = hashCodeRegex.exec(editorText!);

		if (match) {

			const oldHashCode = match[0];
			let oldHashCodeIndex = editorText?.indexOf(oldHashCode);

			if (oldHashCodeIndex) {

				// check if there is a javadoc comment
				const lastHashCodeIndexIndex = editor!.document.positionAt(oldHashCodeIndex + oldHashCode.length)
				oldHashCodeIndex = checkJavadocComment(oldHashCodeIndex);

				const range = new vscode.Range(editor!.document.positionAt(oldHashCodeIndex), lastHashCodeIndexIndex);
				editor?.edit(editBuilder => {
					editBuilder.delete(range);
				});
			}
		}
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
	showInformationMessage("hashCode() method generated");

	return code;

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
			else {
				showWarningMessage(`Method ${methodName} already exists`);
			}
		}
	}
	showInformationMessage("withField() methods generated");
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