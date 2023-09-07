import * as vscode from 'vscode';
import { checkIfCodeExists, generateEquals, generateHashCode, generateToStringCode, generateWithFields, getPackageName, replaceOldCode } from './codeGenerator';
import { exec } from 'child_process';
import * as path from 'path';
import { EQUALS_IMPORT, EQUALS_IMPORT_REGEXP, EQUALS_REGEXP, GLOBAL_IMPORT_REGEXP, HASHCODE_IMPORT, HASHCODE_IMPORT_REGEXP, HASHCODE_REGEXP, JAVA_COMMAND, JAVAC_COMMAND, TO_STRING_IMPORT, TO_STRING_IMPORT_REGEXP, TO_STRING_REGEXP } from './config';
import { existingPath, setCustomizedPath, deleteCustomizedPath } from './path';
import * as fs from 'fs';
import { getCurrentJDK, jdkQuickFix, setWorkspaceJDK } from './jdkManagement';

let options: vscode.QuickPickItem[] = [];
let className: string = '';
const printers: string[] = ['likeIntellij', 'likeEclipse', 'likeFunction', 'likeTuple', 'like'];
const hashCode = [
	{ label: 'create hashCode()', picked: true },
];

/**
 * Show dialog to select a folder
 * 
 * @param canSelectMany select many folders
 * @param openLabel label of the open button
 * @param title title of the dialog
 * @param canSelectFolders select folders
 * @returns the path of the selected folder
 * 
 */
function showDialog(canSelectMany: boolean, openLabel: string, title: string, canSelectFolders: boolean): Promise<string | undefined> {
	return new Promise((resolve) => {
		const jdkMainFolder: vscode.OpenDialogOptions = {
			canSelectMany: canSelectMany,
			openLabel: openLabel,
			title: title,
			canSelectFolders: canSelectFolders
		};

		vscode.window.showOpenDialog(jdkMainFolder).then(fileUri => {
			if (fileUri && fileUri[0]) {
				resolve(fileUri[0]?.fsPath);
			} else {
				resolve(undefined);
			}
		});
	});
}

/**
 * Method that returns the current jdk version
 * 
 * @returns the current jdk version
 */
async function getJDK() {
	const currentJDK = await getCurrentJDK();
	if (!currentJDK) {
		vscode.window.showWarningMessage(`This project does not have a JDK version set. Please set a JDK version in the settings.`,
			jdkQuickFix).then(selection => {
				if (selection) {
					vscode.commands.executeCommand(selection.command);
				}
			});
		return;
	}

	return Promise.resolve(currentJDK);
}

/**
 * @inerhitDoc 
 */
export function activate(context: vscode.ExtensionContext) {

	/* set workspace jdk command */
	const setJDKWorkspace = vscode.commands.registerCommand('nerd4j-extension.setWorkspaceJDK', async () => {

		const jdkMainFolder = await showDialog(false, 'Select', 'Select workspace jdk main folder', true);

		if (jdkMainFolder) {
			setWorkspaceJDK(jdkMainFolder);
			vscode.window.showInformationMessage('workspace jdk has been set to: ' + jdkMainFolder);
		} else {

			const quickFix = { title: 'Set workspace jdk main folder', command: 'nerd4j-extension.setWorkspaceJDK' };
			vscode.window.showErrorMessage('Error: the selected folder is not valid',
				quickFix).then(selection => {
					if (selection) {
						vscode.commands.executeCommand(selection.command);
					}
				});
		}
	});

	//set workspace jdk command
	const checkCurrentJDK = vscode.commands.registerCommand('nerd4j-extension.checkCurrentJDK', async () => {

		const jdk = await getCurrentJDK();

		if (jdk) {
			vscode.window.showInformationMessage('Current jdk version: ' + jdk);
		} else {

			const quickFix = { title: 'Set workspace jdk main folder', command: 'nerd4j-extension.setWorkspaceJDK' };
			vscode.window.showWarningMessage('There is no jdk version set for this workspace',
				quickFix).then(selection => {
					if (selection) {
						vscode.commands.executeCommand(selection.command);
					}
				});
		}
	});

	//recompile fileanalyzer command
	const recompileFileAnalyzer = vscode.commands.registerCommand('nerd4j-extension.recompileFileAnalyzer', async () => {

		const jdk = await getJDK();
		if (!jdk) {
			return;
		}

		const javacCommand = path.join(jdk, "bin", JAVAC_COMMAND);

		exec(javacCommand, (error, stdout, stderr) => {
			if (error || stderr) {
				vscode.window.showErrorMessage(`${stderr} ${error}`,
					jdkQuickFix).then(selection => {
						if (selection) {
							vscode.commands.executeCommand(selection.command);
						}
					});
				return;
			} else {
				vscode.window.showInformationMessage("Compilation successful");
			}
		});
	});

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
				const toStringCode = await generateToStringCode(selectedAttributes, selectionType);

				const editor = vscode.window.activeTextEditor;
				if (editor) {

					// remove old code
					if (checkIfCodeExists(TO_STRING_REGEXP)) {
						const ans = await vscode.window.showInformationMessage("The toString() method is already implemented.", "Regenerate", "Cancel");
						if (ans !== "Regenerate") {
							return;
						}

						await replaceOldCode(TO_STRING_REGEXP, toStringCode);
						vscode.window.showInformationMessage("toString() method regenerated");

					} else {

						const selection = editor.selection;
						await editor.edit(editBuilder => {
							editBuilder.insert(selection.end, toStringCode);
						});
					}

					await editor.edit(editBuilder => {
						// add import if is not present
						if (!checkIfCodeExists(TO_STRING_IMPORT_REGEXP) && !checkIfCodeExists(GLOBAL_IMPORT_REGEXP)) {
							editBuilder.insert(new vscode.Position(1, 0), `\n${TO_STRING_IMPORT}`);
						}
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

			const toString = await generateToStringCode(selectedAttributes, selectionType);
			const equals = await generateEquals(selectedAttributes);
			const hashCode = await generateHashCode(selectedAttributes);

			let code = '';

			// select attributres for withField
			await getFields(true);
			selectedOptions = await vscode.window.showQuickPick(options, {
				canPickMany: true,
				placeHolder: 'Select attributes for withField'
			});

			if (selectedOptions) {
				selectedAttributes = selectedOptions.map(option => option.label);
				const withFieldCode = generateWithFields(selectedAttributes, className);

				const editor = vscode.window.activeTextEditor;
				if (editor) {
					const selection = editor.selection;

					let regenerateToString: boolean = false;
					let regenerateEquals: boolean = false;
					let regenerateHashCode: boolean = false;

					// remove old code
					if (checkIfCodeExists(TO_STRING_REGEXP)) {
						const ans = await vscode.window.showInformationMessage("The toString() method is already implemented.", "Regenerate", "Cancel");
						if (ans === "Regenerate") {
							regenerateToString = true;
						}
					} else {
						code += toString;
					}
					if (checkIfCodeExists(EQUALS_REGEXP)) {
						const ans = await vscode.window.showInformationMessage("The equals() method is already implemented.", "Regenerate", "Cancel");
						if (ans === "Regenerate") {
							regenerateEquals = true;
						}
					} else {
						code += equals;
					}
					if (checkIfCodeExists(HASHCODE_REGEXP)) {
						const ans = await vscode.window.showInformationMessage("The hashCode() method is already implemented.", "Regenerate", "Cancel");
						if (ans === "Regenerate") {
							regenerateHashCode = true;
						}
					} else {
						code += hashCode;
					}

					code += withFieldCode;

					await editor.edit(editBuilder => {
						// add imports if is not present
						if (!checkIfCodeExists(TO_STRING_IMPORT_REGEXP) && !checkIfCodeExists(GLOBAL_IMPORT_REGEXP)) {
							editBuilder.insert(new vscode.Position(1, 0), `\n${TO_STRING_IMPORT}`);
						}
						if (!checkIfCodeExists(EQUALS_IMPORT_REGEXP) && !checkIfCodeExists(GLOBAL_IMPORT_REGEXP)) {
							editBuilder.insert(new vscode.Position(1, 0), `\n${EQUALS_IMPORT}`);
						}
						if (!checkIfCodeExists(HASHCODE_IMPORT_REGEXP) && !checkIfCodeExists(GLOBAL_IMPORT_REGEXP)) {
							editBuilder.insert(new vscode.Position(1, 0), `\n${HASHCODE_IMPORT}`);
						}
						editBuilder.insert(selection.end, code);
					});

					// delete old code
					if (regenerateToString) {
						await replaceOldCode(TO_STRING_REGEXP, toString);
						vscode.window.showInformationMessage("toString() method regenerated");
					}
					if (regenerateEquals) {
						await replaceOldCode(EQUALS_REGEXP, equals);
						vscode.window.showInformationMessage("equals() method regenerated");
					}
					if (regenerateHashCode) {
						await replaceOldCode(HASHCODE_REGEXP, hashCode);
						vscode.window.showInformationMessage("hashCode() method regenerated");
					}
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

				// code variables
				let code = '';
				const equalsCode = await generateEquals(selectedAttributes);

				const editor = vscode.window.activeTextEditor;

				if (editor) {

					const selection = editor.selection;

					let regenerateEquals: boolean = false;
					let regenerateHashCode: boolean = false;

					// check and remove old equals code
					if (checkIfCodeExists(EQUALS_REGEXP)) {
						const ans = await vscode.window.showInformationMessage("The equals() method is already implemented.", "Regenerate", "Cancel");
						if (ans === "Regenerate") {
							regenerateEquals = true;
						}
					} else {
						code += equalsCode;
					}

					// check and remove old equals code
					let hashCode = '';
					if (createHashCode) {

						hashCode = await generateHashCode(selectedAttributes);

						if (checkIfCodeExists(HASHCODE_REGEXP)) {
							const ans = await vscode.window.showInformationMessage("The hashCode() method is already implemented.", "Regenerate", "Cancel");
							if (ans === "Regenerate") {
								regenerateHashCode = true;
							}
						} else {
							code += hashCode;
						}
					}

					await editor.edit(editBuilder => {

						// add imports if is not present
						if (!checkIfCodeExists(EQUALS_IMPORT_REGEXP) && !checkIfCodeExists(GLOBAL_IMPORT_REGEXP)) {
							editBuilder.insert(new vscode.Position(1, 0), `\n${EQUALS_IMPORT}`);
						}
						if (!checkIfCodeExists(HASHCODE_IMPORT_REGEXP) && !checkIfCodeExists(GLOBAL_IMPORT_REGEXP) && createHashCode) {
							editBuilder.insert(new vscode.Position(1, 0), `\n${HASHCODE_IMPORT}`);
						}

						editBuilder.insert(selection.end, code);

					});

					// delete old code
					if (regenerateEquals) {
						await replaceOldCode(EQUALS_REGEXP, equalsCode);
						vscode.window.showInformationMessage("equals() method regenerated");
					}
					if (regenerateHashCode) {
						await replaceOldCode(HASHCODE_REGEXP, hashCode);
						vscode.window.showInformationMessage("hashCode() method regenerated");
					}
				}
			}
		}
	});

	//set compiled folder command
	const setCustomCompiledFolder = vscode.commands.registerCommand('nerd4j-extension.setCustomCompiledFolder', async () => {

		const compiledFolder = await showDialog(false, 'Select folder', 'Select compiled folder', true);

		if (compiledFolder) {
			setCustomizedPath(compiledFolder);
			vscode.window.showInformationMessage('Compiled folder set to: ' + compiledFolder);
		} else {

			const quickFix = { title: 'Set new compiled folder', command: 'nerd4j-extension.setCustomCompiledFolder' };
			vscode.window.showErrorMessage('Error: the folder is not valid',
				quickFix).then(selection => {
					if (selection) {
						vscode.commands.executeCommand(selection.command);
					}
				});
		}
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
				{ label: 'toString()', command: 'nerd4j-extension.generateToString' },
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
	context.subscriptions.push(setJDKWorkspace);
	context.subscriptions.push(checkCurrentJDK);
	context.subscriptions.push(recompileFileAnalyzer);
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
	return new Promise(async (resolve, reject) => {

		// get root path
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders) {
			const projectRoot = workspaceFolders[0].uri.fsPath;

			const fullCompiledPath = existingPath(projectRoot);

			if (fullCompiledPath) {

				// get current active editor file path
				const activeEditor = vscode.window.activeTextEditor;

				if (activeEditor) {

					//check jdk version
					const jdk = await getJDK();
					if (!jdk) {
						return;
					}

					// Get the class name of the active file
					const fileUri = activeEditor.document.uri;
					const fileName = path.basename(fileUri.fsPath).split('.')[0] + '.class';

					if ((fileUri.fsPath).split('.')[1] !== 'java') {
						vscode.window.showErrorMessage("The active file is not a java file");
						return;
					}

					// get package name
					const packageName = getPackageName(activeEditor.document.getText());
					const classDefinition = (packageName) ? `${packageName}.${fileName.split('.')[0]}` : fileName.split('.')[0];
					const javaCommand = `${path.join(jdk, 'bin', JAVA_COMMAND)} ${fullCompiledPath} ${classDefinition} ${editableField}`;

					//check if the class file exists
					const classFilePath = path.join(fullCompiledPath, packageName.replace(/\./g, '/'), fileName);

					if (fs.existsSync(classFilePath)) {

						exec(javaCommand, (error, stdout, stderr) => {
							if (error || stderr) {
								vscode.window.showErrorMessage("jdk main folder not found. Check if the jdk is correctly set",
									jdkQuickFix).then(selection => {
										if (selection) {
											vscode.commands.executeCommand(selection.command);
										}
									});
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
				const quickFix = { title: 'Set new compiled folder', command: 'nerd4j-extension.setCustomCompiledFolder' };
				vscode.window.showErrorMessage('The folder containing the compiled files could not be found', quickFix).then(selection => {
					if (selection) {
						vscode.commands.executeCommand(selection.command);
					}
				});
			}
		} else {
			vscode.window.showErrorMessage('Could not find the root folder of the project');
		}
	});
}