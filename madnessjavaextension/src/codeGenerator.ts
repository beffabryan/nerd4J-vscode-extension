import * as vscode from 'vscode';

function checkIfMethodAlreadyExists(methodName: string) {
	const editor = vscode.window.activeTextEditor;
	const editorText = editor?.document.getText();

	// check if to string exitst
	return editorText?.includes(methodName);

}

export function generateToStringCode(selectedAttributes: string[], selectedType: string): string {

	//check if toString already exists
	if (checkIfMethodAlreadyExists('String toString()')) {
		vscode.window.showErrorMessage("Il metodo toString() è già implementato");
		return "";
	}

	//check if there are selected attributes
	if (selectedAttributes.length === 0) {
		vscode.window.showErrorMessage("Nessun attributo selezionato");
		return "";
	}

	let code = `\n@Override\npublic String toString() {\n\treturn ToString.of(this)`;

	for (const attribute of selectedAttributes) {
		const attributeName = attribute.match(/\w+/); // Ottieni il nome della variabile
		if (attributeName)
			code += `\n\t\t.print("${attributeName[0]}", ${attributeName[0]})`;
	}

	code += `\n\t\t.${selectedType}();\n}`;

	return code;
}

// generate equals and hadhcode method
export function generateEquals(selectedAttributes: string[], createHashCode: boolean = false): string {

	//check if there are selected attributes
	if (selectedAttributes.length === 0) {
		vscode.window.showErrorMessage("Nessun attributo selezionato");
		return "";
	}

	let code = '';

	//check if equals already exists
	if (checkIfMethodAlreadyExists('boolean equals(Object other)')) {
		vscode.window.showErrorMessage("Il metodo equals() è già implementato");
	} else {

		code += `\n
	@Override
	public boolean equals(Object other) {
		return Equals.ifSameClass(
			this, other,`;


		let i = 0;
		for (const attribute of selectedAttributes) {
			const attributeName = attribute.match(/\w+/); // Ottieni il nome della variabile

			if (attributeName) {
				code += `
			o -> o.${attributeName[0]}`;

				//check index
				if (i != selectedAttributes.length - 1)
					code += ', ';
			}
			i++;
		}

		code += `
		);
	}`;
	}

	if (createHashCode) {

		//create hashCode method
		code += generateHashCode(selectedAttributes);

	}
	return code;
}

export function generateHashCode(selectedAttributes: string[]): string {

	//check if there are selected attributes
	if (selectedAttributes.length === 0) {
		vscode.window.showErrorMessage("Nessun attributo selezionato");
		return "";
	}

	//check if hashCode already exists
	if (checkIfMethodAlreadyExists('int hashCode()')) {
		vscode.window.showErrorMessage("Il metodo hashCode() è già implementato");
		return "";
	}

	let code = `\n
	@Override
	public int hashCode() {
		return HashCode.of(`;

	let i = 0;
	for (const attribute of selectedAttributes) {
		const attributeName = attribute.match(/\w+/); // Ottieni il nome della variabile

		if (attributeName) {
			code += `${attributeName[0]}`;

			//check index
			if (i != selectedAttributes.length - 1)
				code += ', ';
		}
		i++;
	}

	code += `);
	}`;

	return code;

}
