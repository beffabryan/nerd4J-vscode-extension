import { streamToBuffer } from '@vscode/test-electron/out/util';
import { exec } from 'child_process';
import * as vscode from 'vscode';
import * as which from 'which';
import * as fs from 'fs';
import * as path from 'path';

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
    if (jdkPath) {
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

/**
 * Check if the project is a Apache Maven project
 * Check pom.xml file and set the cursor position 
 * 
 */
export async function setPomJDK(pomXmlPath: vscode.Uri) {

    //open pom.xml file
    const pomXmlDocument = await vscode.workspace.openTextDocument(pomXmlPath);
    await vscode.window.showTextDocument(pomXmlDocument);

    // get the text editor
    const editor = vscode.window.activeTextEditor;
    if (editor) {

        //maven compiler source
        const javaCompilerSource = "maven.compiler.source";
        const javaCompilerTarget = "maven.compiler.target";

        //get text editor
        const pomText = fs.readFileSync(pomXmlPath.fsPath).toString();
        const sourceCompiler = pomText.match(new RegExp(`<${javaCompilerSource}>(.*)<\\/${javaCompilerSource}>`));
        const targetCompiler = pomText.match(new RegExp(`<${javaCompilerTarget}>(.*)<\\/${javaCompilerTarget}>`));

        //check if the java version is set in the pom.xml file
        if (sourceCompiler && targetCompiler) {

            //set the first cursor position to the javaVersion position
            const position = editor.document.positionAt(sourceCompiler.index! + `<${javaCompilerTarget}>`.length);
            const selection1 = new vscode.Selection(position, position);

            //set the second cursor position to the end of the javaVersion position
            const position2 = editor.document.positionAt(targetCompiler.index! + `<${javaCompilerTarget}>`.length)
            const selection2 = new vscode.Selection(position2, position2);
            editor.selections = [selection1, selection2];
        }
    }
}

/**
 * Check if the project is a Apache Ant project
 * Check build.xml file and set the cursor position 
 * 
 */
function setBuildJDK(): string {
    vscode.window.showInformationMessage('Ant project detected');
    return "";
}

/**
 * Check if the project is a buildfile.buildr Buildr project
 * Check buildfile.xml or build.yaml file and set the cursor position 
 * 
 */
function setBuildrJDK(): string {
    vscode.window.showInformationMessage('Buildr project detected');
    return "";
}

/**
 * Check if the project is build gradle project
 * Check build.gradle file and set the cursor position 
 * 
 */
function setGrailsJDK(): string {
    vscode.window.showInformationMessage('Grails project detected');
    return "";
}

/**
 * Check if the project is a Grape project
 * Check build.gradle file and set the cursor position 
 * 
 */
function setGrapeJDK(): string {
    vscode.window.showInformationMessage('Grape project detected');
    return "";
}

/**
 * Check if the project is a Leiningen project
 * Check project.clj file and set the cursor position 
 * 
 */
function setLeiningenJDK(): string {
    vscode.window.showInformationMessage('Leiningen project detected');
    return "";
}

/**
 * Check if the project is a SBT project
 * Check build.sbt or project/build.properties file and set the cursor position 
 * 
 */
function setSBTJDK(): string {
    vscode.window.showInformationMessage('SBT project detected');
    return "";
}

export async function setProjectManagerJDK() {

    //check if the pom.xml file exists
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('Nessun progetto aperto.');
        return "";
    }
    const projectFolder = workspaceFolders[0].uri.fsPath;

    // Check if pom.xml file exists in the project root folder
    const pomXmlPath = vscode.Uri.file(path.join(projectFolder, "pom.xml"));
    if (fs.existsSync(pomXmlPath.fsPath)) {

        //set the pom.xml file
        setPomJDK(pomXmlPath);
    }

    return "";
}