"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWithFields = exports.generateHashCode = exports.generateEquals = exports.generateToStringCode = void 0;
const vscode = require("vscode");
function checkIfMethodAlreadyExists(methodName) {
    const editor = vscode.window.activeTextEditor;
    const editorText = editor?.document.getText();
    // check if to string exitst
    return editorText?.includes(methodName);
}
function showErrorMessage(message) {
    vscode.window.showErrorMessage(message);
}
function generateToStringCode(selectedAttributes, selectedType) {
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
        const attributeName = attribute.match(/\w+/); // get variable name
        if (attributeName)
            code += `\n\t\t.print("${attributeName[0]}", ${attributeName[0]})`;
    }
    code += `\n\t\t.${selectedType}();\n}`;
    return code;
}
exports.generateToStringCode = generateToStringCode;
// generate equals and hadhcode method
function generateEquals(selectedAttributes, createHashCode = false) {
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
            const attributeName = selectedAttributes[i].match(/\w+/); // Ottieni il nome della variabile
            if (attributeName) {
                code += `\n\t\to -> o.${attributeName[0]}`;
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
exports.generateEquals = generateEquals;
function generateHashCode(selectedAttributes) {
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
    let code = `\n\n@Override\npublic int hashCode() {\n\treturn HashCode.of(`;
    for (let i = 0; i < selectedAttributes.length; i++) {
        const attributeName = selectedAttributes[i].match(/\w+/); // Ottieni il nome della variabile
        if (attributeName) {
            code += `${attributeName[0]}`;
            //check index
            if (i != selectedAttributes.length - 1)
                code += ', ';
        }
    }
    code += `);\n}`;
    return code;
}
exports.generateHashCode = generateHashCode;
function generateWithFields(selectedAttributes) {
    let code = '';
    for (let i = 0; i < selectedAttributes.length; i++) {
        const attributeName = selectedAttributes[i].match(/\w+/); // Ottieni il nome della variabile
        if (attributeName) {
            //set first letter to upper case
            const methodName = 'with' + attributeName[0].charAt(0).toUpperCase() + attributeName[0].slice(1);
            code += `\npublic Object ${methodName}(String value) {\n\tthis.${attributeName[0]} = value;\n\treturn this;\n}\n`;
        }
    }
    return code;
}
exports.generateWithFields = generateWithFields;
//# sourceMappingURL=codeGenerator.js.map