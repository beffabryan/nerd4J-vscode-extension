import * as vscode from 'vscode';

const javaHome = 'java.jdt.ls.java.home';
export const jdkQuickFix = { title: 'Set workspace JDK', command: 'nerd4j-extension.setWorkspaceJDK' };

export async function getCurrentJDK(): Promise<string> {
    const jdkPath = await vscode.workspace.getConfiguration().get(javaHome);
    return Promise.resolve(`${jdkPath}`);
}

export function setWorkspaceJDK(jdkPath: string) {
    vscode.workspace.getConfiguration().update(javaHome, jdkPath, vscode.ConfigurationTarget.Workspace);
}
