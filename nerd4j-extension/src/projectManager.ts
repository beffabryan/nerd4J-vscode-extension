import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Check if the project is a Maven project
 */
export function isMavenProject() {

    // get the workspace folders
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return false;
    }

    // Check if pom.xml file exists in the project root folder (Apache Maven project)
    const pomXmlPath = vscode.Uri.file(path.join(workspaceFolders[0].uri.fsPath, "pom.xml"));
    if (fs.existsSync(pomXmlPath.fsPath)) {
        return pomXmlPath;
    }
    return false;
}

/**
 * Check if the project is an Apache Ant project
 */
export function isAntProject() {

    // get the workspace folders
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return false;
    }

    //check if there is a build.xml file in the project root folder (Apache Ant project)
    const buildXmlPath = vscode.Uri.file(path.join(path.join(workspaceFolders[0].uri.fsPath, "build.xml")));
    if (fs.existsSync(buildXmlPath.fsPath)) {
        return buildXmlPath;
    }
    return false;
}

/**
 * Check if the project is an Apache Buildr project
 */
export function isBuildProject() {

    // get the workspace folders
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return false;
    }

    //check if there is a buildfile file in the project root folder (Apache Ant project)
    const buildfileXmlPath = vscode.Uri.file(path.join(path.join(workspaceFolders[0].uri.fsPath, "buildfile")));
    if (fs.existsSync(buildfileXmlPath.fsPath)) {
        return buildfileXmlPath;
    }
    return false;
}

/**
 * Check if the project is a Groovy Grape or a Grails project
 */
export function isGrapeOrGrailsProject() {

    // get the workspace folders
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return false;
    }

    // check if there is a build.gradle file in the project root folder (Groovy Grape or Grails project)
    const buildGradlePath = vscode.Uri.file(path.join(workspaceFolders[0].uri.fsPath, "build.gradle")); 
    if (fs.existsSync(buildGradlePath.fsPath)) {
        return buildGradlePath;
    }
    return false;
}

/**
 * Check if the project is a Leiningen project
 */
export function isLeiningenProject() {

    // get the workspace folders
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return false;
    }

    // check if there is a project.clj file in the project root folder (Leiningen project)
    const leiningenGradlePath = vscode.Uri.file(path.join(workspaceFolders[0].uri.fsPath, "project.clj")); 
    if (fs.existsSync(leiningenGradlePath.fsPath)) {
        return leiningenGradlePath;
    }
    return false;
}

/**
 * Check if the project is a Apache Maven project
 * Check pom.xml file and set the cursor position to the java configuration
 *  
 * @param pomXmlPath path of the pom.xml file
 */
export async function setPomJDK(pomXmlPath: vscode.Uri) {

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
 * Open a file in the editor
 * @param file file to open
 */
export async function openFile(file: vscode.Uri) {
    const document = await vscode.workspace.openTextDocument(file);
    await vscode.window.showTextDocument(document);
}

/**
 * Check if the project is a buildfile.buildr Buildr project
 * Check buildfile.xml or build.yaml file and set the cursor position 
 * 
 */
export async function setBuildfileJDK(buildfilePath: vscode.Uri) {

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