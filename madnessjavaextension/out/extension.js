"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
let options = [
    { label: 'age', picked: true },
    { label: 'name', picked: true },
    { label: 'surname', picked: true },
    { label: 'id', picked: true },
    { label: 'iban', picked: true }
];
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    const printers = ['likeIntellij', 'likeEclipse', 'likeFunction', 'likeTuple', 'like'];
    const hashCode = [
        { label: 'create hashCode()', picked: true },
    ];
    const toString = vscode.commands.registerCommand('madnessjavaextension.generateToString', async () => {
        const selectedOptions = await vscode.window.showQuickPick(options, {
            canPickMany: true,
            placeHolder: 'Select attributes'
        });
        if (selectedOptions) {
            const selectedAttributes = selectedOptions.map(option => option.label);
            const selectionType = await vscode.window.showQuickPick(printers, { placeHolder: 'Select a layout' });
            if (selectionType) {
                const toStringCode = generateToStringCode(selectedAttributes, selectionType);
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    const selection = editor.selection;
                    editor.edit(editBuilder => {
                        editBuilder.insert(selection.end, toStringCode);
                    });
                }
            }
        }
    });
    context.subscriptions.push(toString);
    //generate equals and hashCode command
    const equals = vscode.commands.registerCommand('madnessjavaextension.generateEquals', async () => {
        getAttributes();
        const selectedOptions = await vscode.window.showQuickPick(options, {
            canPickMany: true,
            placeHolder: 'Select attributes'
        });
        if (selectedOptions) {
            const selectedAttributes = selectedOptions.map(option => option.label);
            const hashCodeOption = await vscode.window.showQuickPick(hashCode, {
                canPickMany: true,
                placeHolder: 'Create equals'
            });
            if (hashCodeOption) {
                const selectedAttributes = selectedOptions.map(option => option.label);
                let createHashCode = hashCodeOption[0] && hashCodeOption[0].picked;
                const toStringCode = generateEquals(selectedAttributes, createHashCode);
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    const selection = editor.selection;
                    editor.edit(editBuilder => {
                        editBuilder.insert(selection.end, toStringCode);
                    });
                }
            }
        }
    });
    context.subscriptions.push(toString);
    const disposable1 = vscode.commands.registerCommand('madnessjavaextension.showContextMenu', async () => {
        const selectedOption = await vscode.window.showQuickPick([
            { label: 'toString() method', command: 'madnessjavaextension.generateToString' },
            { label: 'equals() and hashCode', command: 'madnessjavaextension.generateEquals' }
        ], { placeHolder: 'Select an option' });
        if (selectedOption) {
            vscode.commands.executeCommand(selectedOption.command);
        }
    });
    context.subscriptions.push(disposable1);
}
exports.activate = activate;
function checkIfMethodAlreadyExists(methodName) {
    const editor = vscode.window.activeTextEditor;
    const editorText = editor?.document.getText();
    // check if to string exitst
    return editorText?.includes(methodName);
}
function generateToStringCode(selectedAttributes, selectedType) {
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
function generateEquals(selectedAttributes, createHashCode = false) {
    //check if there are selected attributes
    if (selectedAttributes.length === 0) {
        vscode.window.showErrorMessage("Nessun attributo selezionato");
        return "";
    }
    let code = '';
    //check if equals already exists
    if (checkIfMethodAlreadyExists('boolean equals(Object other)')) {
        vscode.window.showErrorMessage("Il metodo equals() è già implementato");
    }
    else {
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
function generateHashCode(selectedAttributes) {
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
function getAttributes() {
    options = [
        { label: 'id', picked: true },
        { label: 'name', picked: true },
        { label: 'surname', picked: true },
        { label: 'age', picked: true },
        { label: 'city', picked: true }
    ];
}
//# sourceMappingURL=extension.js.map