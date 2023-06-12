import * as vscode from 'vscode';

function checkIfMethodAlreadyExists(methodName: string) {
	const editor = vscode.window.activeTextEditor;
	const editorText = editor?.document.getText();

	// check if to string exitst
	return editorText?.includes(methodName);
}

function showErrorMessage(message: string) {
	vscode.window.showErrorMessage(message);
}

// get package name
export function getPackageName(text: string): string {
	const packageRegex = /package\s+([a-zA-Z0-9.]+);/g;
	const match = packageRegex.exec(text!);
	return match ? match[1] : "";
}

// generate toString method
export function generateToStringCode(selectedAttributes: string[], selectedType: string): string {

	//check if toString already exists
	if (checkIfMethodAlreadyExists('public String toString()')) {
		showErrorMessage("Il metodo toString() è già implementato");
		return "";
	}

	//check if there are selected attributes
	if (selectedAttributes.length === 0) {
		vscode.window.showErrorMessage("Nessun attributo selezionato");
		return "";
	}

	let code = `\n@Override\npublic String toString() {\n\treturn ToString.of(this)`;

	for (const attribute of selectedAttributes) {
		const attributeName = attribute.split(" ")[1]; // get variable name
		if (attributeName)
			code += `\n\t\t.print("${attributeName}", ${attributeName})`;
	}

	code += `\n\t\t.${selectedType}();\n}`;
	return code;
}

// generate equals and hadhcode method
export function generateEquals(selectedAttributes: string[], createHashCode: boolean = false): string {

	//check if there are selected attributes
	if (selectedAttributes.length === 0) {
		showErrorMessage("Nessun attributo selezionato");
		return "";
	}

	let code = '';

	//check if equals already exists
	if (checkIfMethodAlreadyExists('boolean equals(Object other)'))
		showErrorMessage("Il metodo equals() è già implementato");
	else {

		code += `\n@Override\npublic boolean equals(Object other) {\n\treturn Equals.ifSameClass(this, other,`;
		for (let i = 0; i < selectedAttributes.length; i++) {
			const attributeName = selectedAttributes[i].split(" ")[1];

			if (attributeName) {
				code += `\n\t\to -> o.${attributeName}`;

				//check index
				if (i != selectedAttributes.length - 1)
					code += ', ';
			}
		}

		code += `\n\t);\n}`;
	}

	if (createHashCode)
		code += generateHashCode(selectedAttributes);

	return code;
}


// generate hashCode method
export function generateHashCode(selectedAttributes: string[]): string {

	//check if there are selected attributes
	if (selectedAttributes.length === 0) {
		showErrorMessage("Nessun attributo selezionato");
		return "";
	}

	//check if hashCode already exists
	if (checkIfMethodAlreadyExists('int hashCode()')) {
		showErrorMessage("Il metodo hashCode() è già implementato");
		return "";
	}

	let code = `\n\n@Override\npublic int hashCode() {\n\treturn Hashcode.of(`;

	for (let i = 0; i < selectedAttributes.length; i++) {
		const attributeName = selectedAttributes[i].split(" ")[1];

		if (attributeName) {
			code += `${attributeName}`;

			//check index
			if (i != selectedAttributes.length - 1)
				code += ', ';
		}
	}

	code += `);\n}`;
	return code;

}

// generate with methods 
export function generateWithFields(selectedAttributes: string[], className: string): string {

	let code = '';

	for (let i = 0; i < selectedAttributes.length; i++) {
		const attributeType = selectedAttributes[i].split(" ")[0];
		const attributeName = selectedAttributes[i].split(" ")[1];

		if (attributeName) {
			//set first letter to upper case
			const methodName = 'with' + attributeName.charAt(0).toUpperCase() + attributeName.slice(1);
			code += `\npublic ${className} ${methodName}(${attributeType} value) {\n\tthis.${attributeName} = value;\n\treturn this;\n}\n`;
		}
	}

	return code;
}
