import * as vscode from 'vscode';
import { generateEquals, generateToStringCode } from './codeGenerator';

let options = [
	{ label: 'age', picked: true },
	{ label: 'name', picked: true },
	{ label: 'surname', picked: true },
	{ label: 'id', picked: true },
	{ label: 'iban', picked: true }
];

const printers = ['likeIntellij', 'likeEclipse', 'likeFunction', 'likeTuple', 'like'];

export function activate(context: vscode.ExtensionContext) {
	const hashCode = [
		{ label: 'create hashCode()', picked: true },
	]

	const toString = vscode.commands.registerCommand('madnessjavaextension.generateToString', async () => {
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
		const selectedOption = await vscode.window.showQuickPick(
			[
				{ label: 'toString() method', command: 'madnessjavaextension.generateToString' },
				{ label: 'equals() and hashCode', command: 'madnessjavaextension.generateEquals' }
			],
			{ placeHolder: 'Select an option' }
		);

		if (selectedOption) {
			vscode.commands.executeCommand(selectedOption.command);
		}
	});
	context.subscriptions.push(disposable1);
}
function getAttributes(): void {

	options = [
		{ label: 'id', picked: true },
		{ label: 'name', picked: true },
		{ label: 'surname', picked: true },
		{ label: 'age', picked: true },
		{ label: 'city', picked: true }
	];
}