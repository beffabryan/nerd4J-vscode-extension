import * as vscode from 'vscode';

const javaHome = 'java.jdt.ls.java.home';
export const jdkQuickFix = { title: 'Set workspace JDK', command: 'nerd4j-extension.setWorkspaceJDK' };

export function getCurrentJDK(): string | null {
    const jdkPath = `${vscode.workspace.getConfiguration().get(javaHome)}`

    if (!jdkPath)
        return null;

    //escape path wiwth spaces
    let jdkParts = jdkPath?.split('\\');
    let escapedPath = '';
    if (jdkParts.length > 0) {
        escapedPath = `${jdkParts[0]}`;
        for (let i = 1; i < jdkParts.length; i++)
            escapedPath += `\\${jdkParts[i]}`;
    }

    vscode.window.showInformationMessage(`${escapedPath}`);

    return escapedPath;
}

export function setWorkspaceJDK(jdkPath: string) {
    vscode.workspace.getConfiguration().update(javaHome, jdkPath, vscode.ConfigurationTarget.Workspace);
}
