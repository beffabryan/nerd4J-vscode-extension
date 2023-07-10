import * as vscode from 'vscode';
import { generateEquals, generateHashCode, generateToStringCode, generateWithFields, getPackageName } from './codeGenerator';
import { exec } from 'child_process';
import * as path from 'path';
import { JAVA_COMMAND } from './config';
import { existingPath, setCustomizedPath, deleteCustomizedPath } from './path';
import * as fs from 'fs';

let options: vscode.QuickPickItem[] = [];
let className: string = '';
const printers: string[] = ['likeIntellij', 'likeEclipse', 'likeFunction', 'likeTuple', 'like'];
const hashCode = [
	{ label: 'create hashCode()', picked: true },
];

export function activate(context: vscode.ExtensionContext) {

	//generate toString command
	const toString = vscode.commands.registerCommand('nerd4j-extension.generateToString', async () => {

		await getFields();
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

	//generate with field command
	const withField = vscode.commands.registerCommand('nerd4j-extension.generateWithField', async () => {

		await getFields(true);
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

	//all methods command
	const allMethods = vscode.commands.registerCommand('nerd4j-extension.generateAllMethods', async () => {
		await getFields();
		let selectedOptions = await vscode.window.showQuickPick(options, {
			canPickMany: true,
			placeHolder: 'Select attributes for toString, equals and hashCode'
		});

		const selectionType = await vscode.window.showQuickPick(
			printers,
			{ placeHolder: 'Select a layout' }
		);

		// select attributres for toString, equals and hashCode
		if (selectedOptions && selectionType) {
			let selectedAttributes = selectedOptions.map(option => option.label);

			const toString = generateToStringCode(selectedAttributes, selectionType);
			const equals = generateEquals(selectedAttributes);
			const hashCode = generateHashCode(selectedAttributes);

			let code = toString + '\n\n' + equals + '\n\n' + hashCode;


			// select attributres for withField
			await getFields(true);
			selectedOptions = await vscode.window.showQuickPick(options, {
				canPickMany: true,
				placeHolder: 'Select attributes for withField'
			});

			if (selectedOptions) {
				selectedAttributes = selectedOptions.map(option => option.label);
				const withFieldCode = generateWithFields(selectedAttributes, className);

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

	//generate equals and hashCode command
	const equals = vscode.commands.registerCommand('nerd4j-extension.generateEquals', async () => {

		await getFields();
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

	//set compiled folder command
	const setCustomCompiledFolder = vscode.commands.registerCommand('nerd4j-extension.setCustomCompiledFolder', async () => {
		const compiledFolderOptions: vscode.OpenDialogOptions = {
			canSelectMany: false,
			openLabel: 'Select folder',
			title: 'Select compiled folder',
			canSelectFolders: true
		};

		vscode.window.showOpenDialog(compiledFolderOptions).then(fileUri => {
			if (fileUri && fileUri[0]) {
				setCustomizedPath(fileUri[0].fsPath);
				vscode.window.showInformationMessage('Compiled folder set to: ' + fileUri[0].fsPath);
			} else {
				vscode.window.showErrorMessage('Error: the folder is not valid');
			}
		});

	});

	// delete custom compiled folder command
	const deleteCustomCompiledFolder = vscode.commands.registerCommand('nerd4j-extension.deleteCustomCompiledFolder', async () => {
		deleteCustomizedPath();
		vscode.window.showInformationMessage('Custom compiled folder deleted');
	});

	//show context menu
	const showContextMenu = vscode.commands.registerCommand('nerd4j-extension.showContextMenu', async () => {
		const selectedOption = await vscode.window.showQuickPick(
			[
				{ label: 'toString() method', command: 'nerd4j-extension.generateToString' },
				{ label: 'equals() and hashCode', command: 'nerd4j-extension.generateEquals' },
				{ label: 'withField()', command: 'nerd4j-extension.generateWithField' },
				{ label: 'all methods', command: 'nerd4j-extension.generateAllMethods' }
			],
			{ placeHolder: 'Generate' }
		);

		if (selectedOption) {
			vscode.commands.executeCommand(selectedOption.command);
		}

	});
	
	//subscritpions
	context.subscriptions.push(toString);
	context.subscriptions.push(withField);
	context.subscriptions.push(allMethods);
	context.subscriptions.push(equals);
	context.subscriptions.push(setCustomCompiledFolder);
	context.subscriptions.push(deleteCustomCompiledFolder);
	context.subscriptions.push(showContextMenu);
}

// get fields using java reflection
function getFields(editableField: boolean = false): Promise<any> {
	return new Promise((resolve, reject) => {

		// get root path
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders) {
			const projectRoot = workspaceFolders[0].uri.fsPath;

			const fullCompiledPath = existingPath(projectRoot);

			if (fullCompiledPath) {

				// get current active editor file path
				const activeEditor = vscode.window.activeTextEditor;

				if (activeEditor) {

					// Get the class name of the active file
					const fileUri = activeEditor.document.uri;
					const fileName = path.basename(fileUri.fsPath).split('.')[0] + '.class';

					// get package name
					const packageName = getPackageName(activeEditor.document.getText());
					const classDefinition = (packageName) ? `${packageName}.${fileName.split('.')[0]}` : fileName.split('.')[0];
					const javaCommand = `${JAVA_COMMAND} ${fullCompiledPath} ${classDefinition} ${editableField}`;

					//check if the class file exists
					const classFilePath = path.join(fullCompiledPath, packageName.replace(/\./g, '/'), fileName);

					if (fs.existsSync(classFilePath)) {

						exec(javaCommand, (error, stdout, stderr) => {
							if (error) {
								vscode.window.showErrorMessage(error.message);
								return;
							}

							if (stderr) {
								vscode.window.showErrorMessage(stderr);
								return;
							}

							const output = stdout.trim();

							// save output in a list
							const outputList = output.split("\n");

							//remove all options
							options = [];
							className = outputList[0].trim();
							for (let i = 1; i < outputList.length; i++) {
								options.push({ label: outputList[i].trim(), picked: true });
							}

							resolve(options);
						});
					} else {
						vscode.window.showErrorMessage('There is no compiled version of this file in the folder ' + fullCompiledPath);
					}
				} else {
					vscode.window.showErrorMessage('No active editor');
				}
			} else {
				vscode.window.showErrorMessage('The folder containing the compiled files could not be found');
			}
		} else {
			vscode.window.showErrorMessage('Could not find the root folder of the project');
		}
	});
}