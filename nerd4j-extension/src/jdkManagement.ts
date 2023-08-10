import * as vscode from 'vscode';

const javaHome = 'java.jdt.ls.java.home';
export const jdkQuickFix = [
    {
        title: 'Set JDK for workspace', command: 'nerd4j-extension.setWorkspaceJDK'
    }, 
    {
        title: 'Set JDK for global', command: 'java.set.jdk.global'
    }
];

export function getCurrentJDK(): string | null {
    const jdkPath = vscode.workspace.getConfiguration().get(javaHome);
    return jdkPath ? `${jdkPath}` : null;
}

export function setWorkspaceJDK(jdkPath: string) {
    vscode.workspace.getConfiguration().update(javaHome, jdkPath, vscode.ConfigurationTarget.Workspace);
}
