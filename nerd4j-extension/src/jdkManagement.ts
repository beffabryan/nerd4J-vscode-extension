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
export const projectManagerJdkQuickFix = { title: 'Open and set project manager config file', command: 'nerd4j-extension.setProjectManagerJDK' };

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
 * Check pom.xml file and set the cursor position to the java configuration
 *  
 * @param pomXmlPath path of the pom.xml file
 */
async function setPomJDK(pomXmlPath: vscode.Uri) {

    //open pom.xml file
    await openFile(pomXmlPath);

    // get the text editor
    const editor = vscode.window.activeTextEditor;
    if (editor) {

        //maven compiler source
        const javaCompilerSource = "maven.compiler.source";
        const javaCompilerTarget = "maven.compiler.target";

        //get text editor
        const pomText = fs.readFileSync(pomXmlPath.fsPath).toString();
        const sourceCompiler = pomText.match(new RegExp(`<${javaCompilerSource}\\s*>`));
        const targetCompiler = pomText.match(new RegExp(`<${javaCompilerTarget}\\s*>`));

        //check if the java version is set in the pom.xml file
        if (sourceCompiler && targetCompiler) {

            //set the first cursor position to the javaVersion position
            const position = editor.document.positionAt(sourceCompiler.index! + sourceCompiler.toString().length);
            const selection1 = new vscode.Selection(position, position);

            //set the second cursor position to the end of the javaVersion position
            const position2 = editor.document.positionAt(targetCompiler.index! + targetCompiler.toString().length)
            const selection2 = new vscode.Selection(position2, position2);
            editor.selections = [selection1, selection2];
        }
    }
}

/**
 * Check if the project is a buildfile.buildr Buildr project
 * Check buildfile.xml or build.yaml file and set the cursor position 
 * 
 */
async function setBuildfileJDK(buildfilePath: vscode.Uri) {

    //open buildfile file
    await openFile(buildfilePath);

    // get the text editor
    const editor = vscode.window.activeTextEditor;
    if (editor) {

        //maven compiler source
        const javaCompilerSource = "compile.options.source";
        const javaCompilerTarget = "compile.options.target";

        //get text editor
        const pomText = fs.readFileSync(buildfilePath.fsPath).toString();
        const sourceCompiler = pomText.match(new RegExp(`${javaCompilerSource}\\s*=\\s*\\'`));
        const targetCompiler = pomText.match(new RegExp(`${javaCompilerTarget}\\s*=\\s*\\'`));

        //check if the java version is set in the pom.xml file
        if (sourceCompiler && targetCompiler) {

            //set the first cursor position to the javaVersion position
            const position = editor.document.positionAt(sourceCompiler.index! + sourceCompiler.toString().length);
            const selection1 = new vscode.Selection(position, position);

            //set the second cursor position to the end of the javaVersion position
            const position2 = editor.document.positionAt(targetCompiler.index! + targetCompiler.toString().length)
            const selection2 = new vscode.Selection(position2, position2);
            editor.selections = [selection1, selection2];
        }
    }
}

/**
 * Open project manager file to set the java configuration
 */
export async function setProjectManagerJDK() {

    //check if the pom.xml file exists
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('Nessun progetto aperto.');
        return "";
    }
    const projectFolder = workspaceFolders[0].uri.fsPath;

    // Check if pom.xml file exists in the project root folder (Apache Maven project)
    const pomXmlPath = vscode.Uri.file(path.join(projectFolder, "pom.xml"));
    if (fs.existsSync(pomXmlPath.fsPath)) {

        //open the pom.xml file and set the cursor on java configuration
        setPomJDK(pomXmlPath);
        return;
    }

    //check if there is a build.xml file in the project root folder (Apache Ant project)
    const buildXmlPath = vscode.Uri.file(path.join(projectFolder, "build.xml"));
    if (fs.existsSync(buildXmlPath.fsPath)) {

        // open build.xml file
        openFile(buildXmlPath);
        return;
    }

    //check if there is a buildfile file in the project root folder (Apache Buildr project)
    const buildFileXmlPath = vscode.Uri.file(path.join(projectFolder, "buildfile"));
    if (fs.existsSync(buildFileXmlPath.fsPath)) {

        //open the buildfile file and set the cursor on java configuration
        setBuildfileJDK(buildFileXmlPath);
        return;

    }

    //check if there is a build.gradle file in the project root folder (Groovy Grape or Grails project)
    const buildGradlePath = vscode.Uri.file(path.join(projectFolder, "build.gradle"));
    if (fs.existsSync(buildGradlePath.fsPath)) {

        //open build.gradle file
        openFile(buildGradlePath);
    }

    //check if there is a project.clj file in the project root folder (Leiningen project)
    const projectCljPath = vscode.Uri.file(path.join(projectFolder, "project.clj"));
    if (fs.existsSync(projectCljPath.fsPath)) {

        //open project.clj file
        openFile(projectCljPath);
        return;
    }
}

/**
 * Open a file in the editor
 * @param file file to open
 */
async function openFile(file: vscode.Uri) {
    const document = await vscode.workspace.openTextDocument(file);
    await vscode.window.showTextDocument(document);
}