"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWithFields = exports.generateHashCode = exports.generateEquals = exports.generateToStringCode = exports.getPackageName = void 0;
const vscode = require("vscode");
// check if method already exists
function checkIfMethodAlreadyExists(methodName) {
    const editor = vscode.window.activeTextEditor;
    const editorText = editor?.document.getText();
    // check if to string exitst
    return editorText?.includes(methodName);
}
// show error message
function showErrorMessage(message) {
    vscode.window.showErrorMessage(message);
}
// show warning message
function showWarningMessage(message) {
    vscode.window.showWarningMessage(message);
}
// show warning message
function showInformationMessage(message) {
    vscode.window.showInformationMessage(message);
}
// get package name
function getPackageName(text) {
    const packageRegex = /package\s+([a-zA-Z0-9.]+);/g;
    const match = packageRegex.exec(text);
    return match ? match[1] : "";
}
exports.getPackageName = getPackageName;
// generate toString method
function generateToStringCode(selectedAttributes, selectedType) {
    //check if toString already exists
    if (checkIfMethodAlreadyExists('public String toString()')) {
        showErrorMessage("The toString() method is already implemented.");
        return "";
    }
    //check if there are selected attributes
    if (selectedAttributes.length === 0) {
        vscode.window.showErrorMessage("No attribute selected");
        return "";
    }
    let code = `\n@Override\npublic String toString() {\n\treturn ToString.of(this)`;
    for (const attribute of selectedAttributes) {
        const attributeName = attribute.split(" ")[1]; // get variable name
        if (attributeName)
            code += `\n\t\t.print("${attributeName}", ${attributeName})`;
    }
    code += `\n\t\t.${selectedType}();\n}`;
    showInformationMessage("toString() method generated");
    return code;
}
exports.generateToStringCode = generateToStringCode;
// generate equals and hadhcode method
function generateEquals(selectedAttributes, createHashCode = false) {
    //check if there are selected attributes
    if (selectedAttributes.length === 0) {
        showErrorMessage("No attribute selected");
        return "";
    }
    let code = '';
    //check if equals already exists
    if (checkIfMethodAlreadyExists('boolean equals(Object other)'))
        showErrorMessage("The equals() method is already implemented.");
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
        showInformationMessage("equals() method generated");
    }
    if (createHashCode)
        code += generateHashCode(selectedAttributes);
    return code;
}
exports.generateEquals = generateEquals;
// generate hashCode method
function generateHashCode(selectedAttributes) {
    //check if there are selected attributes
    if (selectedAttributes.length === 0) {
        showErrorMessage("No attribute selected");
        return "";
    }
    //check if hashCode already exists
    if (checkIfMethodAlreadyExists('int hashCode()')) {
        showErrorMessage("The hashCode() method is already implemented.");
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
    showInformationMessage("hashCode() method generated");
    return code;
}
exports.generateHashCode = generateHashCode;
// generate with methods 
function generateWithFields(selectedAttributes, className) {
    let code = '';
    for (let i = 0; i < selectedAttributes.length; i++) {
        const attributeType = selectedAttributes[i].split(" ")[0];
        const attributeName = selectedAttributes[i].split(" ")[1];
        if (attributeName) {
            //set first letter to upper case
            const methodName = 'with' + attributeName.charAt(0).toUpperCase() + attributeName.slice(1);
            const methodSignature = `public ${className} ${methodName}(${attributeType} value)`;
            //check if method already exists
            if (!checkIfMethodAlreadyExists(methodSignature))
                code += `\n${methodSignature} {\n\tthis.${attributeName} = value;\n\treturn this;\n}\n`;
            else
                showWarningMessage(`Method ${methodName} already exists`);
        }
    }
    showInformationMessage("withField() methods generated");
    return code;
}
exports.generateWithFields = generateWithFields;
//# sourceMappingURL=codeGenerator.js.map