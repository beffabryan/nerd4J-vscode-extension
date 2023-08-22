import * as vscode from 'vscode';

// check if method already exists
export function checkIfMethodAlreadyExists(methodSignature: string) {
	const editor = vscode.window.activeTextEditor;
	const editorText = editor?.document.getText();

	// check if to string exitst
	return editorText?.includes(methodSignature);
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

// remove old code
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

// generate toString method
export async function generateToStringCode(selectedAttributes: string[], selectedType: string): Promise<string> {

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

// generate hashCode method
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

// insert the number of tabs
function insertTab(times: number): string {
	const character = '\t';
	return character.repeat(times);
}

// returns the number of tabs to indent the code
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