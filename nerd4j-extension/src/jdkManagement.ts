import * as vscode from 'vscode';

const javaHome = 'java.jdt.ls.java.home';
export const jdkQuickFix = { title: 'Set workspace JDK', command: 'nerd4j-extension.setWorkspaceJDK' };

export function getCurrentJDK(): string | null {
    const jdkPath = vscode.workspace.getConfiguration().get(javaHome);
    return jdkPath ? `${jdkPath}` : null;
}

export function setWorkspaceJDK(jdkPath: string) {
    vscode.workspace.getConfiguration().update(javaHome, jdkPath, vscode.ConfigurationTarget.Workspace);
}
