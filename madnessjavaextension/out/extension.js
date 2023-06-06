"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const codeGenerator_1 = require("./codeGenerator");
const child_process_1 = require("child_process");
let options = [
    { label: 'age', picked: true },
    { label: 'name', picked: true },
    { label: 'surname', picked: true },
    { label: 'id', picked: true },
    { label: 'iban', picked: true }
];
const printers = ['likeIntellij', 'likeEclipse', 'likeFunction', 'likeTuple', 'like'];
function activate(context) {
    const hashCode = [
        { label: 'create hashCode()', picked: true },
    ];
    //generate toString command
    const toString = vscode.commands.registerCommand('madnessjavaextension.generateToString', async () => {
        await getAttributes();
        const selectedOptions = await vscode.window.showQuickPick(options, {
            canPickMany: true,
            placeHolder: 'Select attributes'
        });
        if (selectedOptions) {
            const selectedAttributes = selectedOptions.map(option => option.label);
            const selectionType = await vscode.window.showQuickPick(printers, { placeHolder: 'Select a layout' });
            if (selectionType) {
                const toStringCode = (0, codeGenerator_1.generateToStringCode)(selectedAttributes, selectionType);
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
    //generate with field command
    const withField = vscode.commands.registerCommand('madnessjavaextension.generateWithField', async () => {
        await getAttributes();
        const selectedOptions = await vscode.window.showQuickPick(options, {
            canPickMany: true,
            placeHolder: 'Select attributes'
        });
        if (selectedOptions) {
            const selectedAttributes = selectedOptions.map(option => option.label);
            const withFieldCode = (0, codeGenerator_1.generateWithFields)(selectedAttributes);
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const selection = editor.selection;
                editor.edit(editBuilder => {
                    editBuilder.insert(selection.end, withFieldCode);
                });
            }
        }
    });
    context.subscriptions.push(toString);
    //generate equals and hashCode command
    const equals = vscode.commands.registerCommand('madnessjavaextension.generateEquals', async () => {
        await getAttributes();
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
                const equalsCode = (0, codeGenerator_1.generateEquals)(selectedAttributes, createHashCode);
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    const selection = editor.selection;
                    editor.edit(editBuilder => {
                        editBuilder.insert(selection.end, equalsCode);
                    });
                }
            }
        }
    });
    context.subscriptions.push(equals);
    const disposable1 = vscode.commands.registerCommand('madnessjavaextension.showContextMenu', async () => {
        const selectedOption = await vscode.window.showQuickPick([
            { label: 'toString() method', command: 'madnessjavaextension.generateToString' },
            { label: 'equals() and hashCode', command: 'madnessjavaextension.generateEquals' },
            { label: 'withField()', command: 'madnessjavaextension.generateWithField' }
        ], { placeHolder: 'Select an option' });
        if (selectedOption) {
            vscode.commands.executeCommand(selectedOption.command);
        }
    });
    context.subscriptions.push(disposable1);
}
exports.activate = activate;
// get attributes using java reflection
function getAttributes() {
    return new Promise((resolve, reject) => {
        // get current folder path
        const currentPath = "C:\\Users\\Bryan\\Desktop\\nerd4J-vscode-extension\\madnessjavaextension\\src\\java";
        const arg = "C:\\Users\\Bryan\\Desktop\\Car.java";
        vscode.window.showInformationMessage(`Path: ${currentPath}`);
        (0, child_process_1.exec)(`java -cp ${currentPath} FileAnalyzer ${arg}`, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Errore durante l'esecuzione del file Java: ${error.message}`);
                return;
            }
            if (stderr) {
                vscode.window.showErrorMessage(`Errore durante l'esecuzione del file Java: ${stderr}`);
                return;
            }
            const output = stdout.trim();
            console.log(`Output 1: ${output}`);
            // save output in a list
            const outputList = output.split("\n");
            //remove all options
            options = [];
            for (let i = 0; i < outputList.length; i++) {
                let option = outputList[i].trim();
                options.push({ label: option, picked: true });
            }
            console.log(`List: ${outputList}`);
            resolve(options);
        });
    });
}
//# sourceMappingURL=extension.js.map