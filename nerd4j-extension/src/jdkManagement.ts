import { streamToBuffer } from '@vscode/test-electron/out/util';
import { exec } from 'child_process';
import * as vscode from 'vscode';
import * as which from 'which';


/* jdk key in the settings.json file */
const JAVA_HOME = 'java.jdt.ls.java.home';

/* quick fix if the jdk is not correctly set */
export const jdkQuickFix = { title: 'Set workspace JDK', command: 'nerd4j-extension.setWorkspaceJDK' };

/**
 * Check if exists a JDK in the workspace settings.json file
 * 
 * Priority: workspace > user > operating system
 * 
 * @returns the path of the current JDK 
 */
export async function getCurrentJDK(): Promise<string | null> {
    
    // check if the jdk is set in the settings.json file
    const jdkPath = await vscode.workspace.getConfiguration().get(JAVA_HOME);
    if(jdkPath){
        return `${jdkPath}`;
    }

    // check if java command exists
    if (await checkIfJavaCommandExists() !== "") {
        return "java";
    }

    return null;
}

/**
 * Set the path of the JDK
 * 
 * @param jdkPath path of the JDK
 */
export function setWorkspaceJDK(jdkPath: string) {
    vscode.workspace.getConfiguration().update(JAVA_HOME, jdkPath, vscode.ConfigurationTarget.Workspace);
}

/**
 * Check if the java command exists on the operating system
 * 
 * @returns the path of the java command if exists, null otherwise
 */
async function checkIfJavaCommandExists(): Promise<string | null> {
    try {
        const javaPath = await which('java');
        return javaPath;
    } catch (error) {
        return null;
    }
}

