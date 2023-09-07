import * as vscode from 'vscode';

/* jdk key in the settings.json file */
const JAVA_HOME = 'java.jdt.ls.java.home';

/* quick fix if the jdk is not correctly set */
export const jdkQuickFix = { title: 'Set workspace JDK', command: 'nerd4j-extension.setWorkspaceJDK' };

/**
 * Returns the path of the current JDK
 * 
 * @returns the path of the current JDK 
 */
export async function getCurrentJDK(): Promise<string> {
    const jdkPath = await vscode.workspace.getConfiguration().get(JAVA_HOME);
    return jdkPath ? `${jdkPath}` : ''; 
}

/**
 * Set the path of the JDK
 * 
 * @param jdkPath path of the JDK
 */
export function setWorkspaceJDK(jdkPath: string) {
    vscode.workspace.getConfiguration().update(JAVA_HOME, jdkPath, vscode.ConfigurationTarget.Workspace);
}
