"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const codeGenerator_1 = require("./codeGenerator");
const child_process_1 = require("child_process");
const path = require("path");
const config_1 = require("./config");
const path_1 = require("./path");
let options = [];
let className = '';
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
        await getAttributes(true);
        const selectedOptions = await vscode.window.showQuickPick(options, {
            canPickMany: true,
            placeHolder: 'Select attributes'
        });
        if (selectedOptions) {
            const selectedAttributes = selectedOptions.map(option => option.label);
            const withFieldCode = (0, codeGenerator_1.generateWithFields)(selectedAttributes, className);
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
    const allMethods = vscode.commands.registerCommand('madnessjavaextension.generateAllMethods', async () => {
        await getAttributes();
        let selectedOptions = await vscode.window.showQuickPick(options, {
            canPickMany: true,
            placeHolder: 'Select attributes for toString, equals and hashCode'
        });
        const selectionType = await vscode.window.showQuickPick(printers, { placeHolder: 'Select a layout' });
        // select attributres for toString, equals and hashCode
        if (selectedOptions && selectionType) {
            let selectedAttributes = selectedOptions.map(option => option.label);
            const toString = (0, codeGenerator_1.generateToStringCode)(selectedAttributes, selectionType);
            const equals = (0, codeGenerator_1.generateEquals)(selectedAttributes);
            const hashCode = (0, codeGenerator_1.generateHashCode)(selectedAttributes);
            let code = toString + '\n\n' + equals + '\n\n' + hashCode;
            // select attributres for withField
            await getAttributes(true);
            selectedOptions = await vscode.window.showQuickPick(options, {
                canPickMany: true,
                placeHolder: 'Select attributes for withField'
            });
            if (selectedOptions) {
                selectedAttributes = selectedOptions.map(option => option.label);
                const withFieldCode = (0, codeGenerator_1.generateWithFields)(selectedAttributes, className);
                code += '\n\n' + withFieldCode;
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    const selection = editor.selection;
                    editor.edit(editBuilder => {
                        editBuilder.insert(selection.end, code);
                    });
                }
            }
        }
    });
    context.subscriptions.push(allMethods);
    //generate equals and hashCode command
    const equals = vscode.commands.registerCommand('madnessjavaextension.generateEquals', async () => {
        await getAttributes();
        const selectedOptions = await vscode.window.showQuickPick(options, {
            canPickMany: true,
            placeHolder: 'Select attributes'
        });
        if (selectedOptions) {
            const hashCodeOption = await vscode.window.showQuickPick(hashCode, {
                canPickMany: true,
                placeHolder: 'Create equals'
            });
            if (hashCodeOption) {
                const selectedAttributes = selectedOptions.map(option => option.label);
                const createHashCode = hashCodeOption[0] && hashCodeOption[0].picked;
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
    //show context menu
    const showContextMenu = vscode.commands.registerCommand('madnessjavaextension.showContextMenu', async () => {
        const selectedOption = await vscode.window.showQuickPick([
            { label: 'toString() method', command: 'madnessjavaextension.generateToString' },
            { label: 'equals() and hashCode', command: 'madnessjavaextension.generateEquals' },
            { label: 'withField()', command: 'madnessjavaextension.generateWithField' },
            { label: 'all methods', command: 'madnessjavaextension.generateAllMethods' }
        ], { placeHolder: 'Generate' });
        if (selectedOption)
            vscode.commands.executeCommand(selectedOption.command);
    });
    context.subscriptions.push(showContextMenu);
}
exports.activate = activate;
// get attributes using java reflection
function getAttributes(editableField = false) {
    return new Promise((resolve, reject) => {
        // get root path
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            const projectRoot = workspaceFolders[0].uri.fsPath;
            const fullCompiledPath = (0, path_1.existingPath)(projectRoot);
            if (fullCompiledPath) {
                // get current active editor file path
                const activeEditor = vscode.window.activeTextEditor;
                if (activeEditor) {
                    // Get the class name of the active file
                    const fileUri = activeEditor.document.uri;
                    const fileName = path.basename(fileUri.fsPath).split('.')[0] + '.class';
                    // get package name
                    const packageName = (0, codeGenerator_1.getPackageName)(activeEditor.document.getText());
                    const classDefinition = (packageName) ? `${packageName}.${fileName.split('.')[0]}` : fileName.split('.')[0];
                    const javaCommand = `${config_1.JAVA_COMMAND} ${fullCompiledPath} ${classDefinition} ${editableField}`;
                    (0, child_process_1.exec)(javaCommand, (error, stdout, stderr) => {
                        if (error) {
                            vscode.window.showErrorMessage(`Errore durante l'esecuzione del file Java: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            vscode.window.showErrorMessage(`Errore durante l'esecuzione del file Java: ${stderr}`);
                            return;
                        }
                        const output = stdout.trim();
                        // save output in a list
                        const outputList = output.split("\n");
                        //remove all options
                        options = [];
                        className = outputList[0].trim();
                        for (let i = 1; i < outputList.length; i++) {
                            let option = outputList[i].trim();
                            options.push({ label: option, picked: true });
                        }
                        resolve(options);
                    });
                }
                else
                    vscode.window.showErrorMessage('No active editor');
            }
            else
                vscode.window.showErrorMessage('Impossibile trovare la cartella contenente i file compilati');
        }
        else
            vscode.window.showErrorMessage('Impossibile trovare la folder root del progetto');
    });
}
//# sourceMappingURL=extension.js.map