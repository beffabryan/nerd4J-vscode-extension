import * as vscode from 'vscode';
import { generateEquals, generateToStringCode, generateWithFields, getPackageName } from './codeGenerator';
import { exec } from 'child_process';
import * as path from 'path';
import { JAVA_COMMAND, JAVA_COMPILED_FOLDER } from './config';

let options: vscode.QuickPickItem[] = [];
let className: string = '';
const printers: string[] = ['likeIntellij', 'likeEclipse', 'likeFunction', 'likeTuple', 'like'];

export function activate(context: vscode.ExtensionContext) {
	const hashCode = [
		{ label: 'create hashCode()', picked: true },
	]

	//generate toString command
	const toString = vscode.commands.registerCommand('madnessjavaextension.generateToString', async () => {

		await getAttributes();
		const selectedOptions = await vscode.window.showQuickPick(options, {
			canPickMany: true,
			placeHolder: 'Select attributes'
		});

		if (selectedOptions) {
			const selectedAttributes = selectedOptions.map(option => option.label);

			const selectionType = await vscode.window.showQuickPick(
				printers,
				{ placeHolder: 'Select a layout' }
			);

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

	//generate with field command
	const withField = vscode.commands.registerCommand('madnessjavaextension.generateWithField', async () => {

		await getAttributes(true);
		const selectedOptions = await vscode.window.showQuickPick(options, {
			canPickMany: true,
			placeHolder: 'Select attributes'
		});

		if (selectedOptions) {
			const selectedAttributes = selectedOptions.map(option => option.label);

			const withFieldCode = generateWithFields(selectedAttributes, className);

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
				const equalsCode = generateEquals(selectedAttributes, createHashCode);

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

	const showContextMenu = vscode.commands.registerCommand('madnessjavaextension.showContextMenu', async () => {
		const selectedOption = await vscode.window.showQuickPick(
			[
				{ label: 'toString() method', command: 'madnessjavaextension.generateToString' },
				{ label: 'equals() and hashCode', command: 'madnessjavaextension.generateEquals' },
				{ label: 'withField()', command: 'madnessjavaextension.generateWithField' }
			],
			{ placeHolder: 'Select an option' }
		);

		if (selectedOption) {
			vscode.commands.executeCommand(selectedOption.command);
		}
	});
	context.subscriptions.push(showContextMenu);
}

// get attributes using java reflection
function getAttributes(editableField: boolean = false): Promise<any> {
	return new Promise((resolve, reject) => {

		// get root path
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders) {
			const projectRoot = workspaceFolders[0].uri.fsPath;
			const fullCompiledPath = path.join(projectRoot, JAVA_COMPILED_FOLDER);

			// get current active editor file path
			const activeEditor = vscode.window.activeTextEditor;

			if (activeEditor) {

				// Get the class name of the active file
				const fileUri = activeEditor.document.uri;
				const fileName = path.basename(fileUri.fsPath).split('.')[0] + '.class';

				// get package name
				const packageName = getPackageName(activeEditor.document.getText());
				const classDefinition = `${packageName}.${fileName.split('.')[0]}`;

				const javaCommand = `${JAVA_COMMAND} ${fullCompiledPath} ${classDefinition} ${editableField}`;

				exec(javaCommand, (error, stdout, stderr) => {
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
			} else {
				console.log('No active editor');
			}
		} else
			vscode.window.showInformationMessage('Impossibile trovare la folder root del progetto');
	});
}