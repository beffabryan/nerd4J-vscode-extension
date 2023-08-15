import * as vscode from 'vscode';
import { EQUALS_SIGNATURE, HASHCODE_SIGNATURE, TO_STRING_SIGNATURE } from './config';

// check if method already exists
function checkIfMethodAlreadyExists(methodName: string) {
	const editor = vscode.window.activeTextEditor;
	const editorText = editor?.document.getText();

	// check if to string exitst
	return editorText?.includes(methodName);
}

// show error message
function showErrorMessage(message: string, quickFixes: any) {
	//add all quick fixes
	vscode.window.showErrorMessage(message,
		{ modal: false },
		...quickFixes);
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

// generate toString method
export async function generateToStringCode(selectedAttributes: string[], selectedType: string) : Promise<string> {

	//check if toString already exists
	if (checkIfMethodAlreadyExists(TO_STRING_SIGNATURE)) {
		const ans = await vscode.window.showInformationMessage("The toString() method is already implemented.", "Regenerate", "Cancel");

		if(ans !== "Regenerate"){
			return "";
		}

		// remove old toString
		const editor = vscode.window.activeTextEditor;
		const editorText = editor?.document.getText();
		const toStringRegex = /@Override(.+)\}/g;
		const match = toStringRegex.exec(editorText!);
		if (match) {
			const oldToString = match[0];
			const oldToStringIndex = editorText?.indexOf(oldToString);

			vscode.window.showInformationMessage(`there is a match`);
			if (oldToStringIndex) {
				const range = new vscode.Range(editor!.document.positionAt(oldToStringIndex), editor!.document.positionAt(oldToStringIndex + oldToString.length));
				editor?.edit(editBuilder => {
					editBuilder.delete(range);
				});
				vscode.window.showInformationMessage(`toString() method removed`);
			}
		}

		vscode.window.showInformationMessage(`${editor?.document.getText()}`);

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

// generate equals and hadhcode method
export function generateEquals(selectedAttributes: string[], createHashCode: boolean = false): string {

	let code = '';

	//check if equals already exists
	if (checkIfMethodAlreadyExists(EQUALS_SIGNATURE)) {
		showErrorMessage("The equals() method is already implemented.", []);
	} else {

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
		showInformationMessage("equals() method generated");
	}

	if (createHashCode) {
		code += generateHashCode(selectedAttributes);
	}

	return code;
}

// generate hashCode method
export function generateHashCode(selectedAttributes: string[]): string {

	//check if hashCode already exists
	if (checkIfMethodAlreadyExists(HASHCODE_SIGNATURE)) {
		showErrorMessage("The hashCode() method is already implemented.", []);
		return "";
	}

	const tabs = insertTab(getIndentation());
	let code = `\n${tabs}/**\n${tabs} * {@inheritDoc}\n${tabs} */\n${tabs}@Override\n${tabs}public int hashCode() {\n${tabs}\treturn Hashcode.of(`;

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