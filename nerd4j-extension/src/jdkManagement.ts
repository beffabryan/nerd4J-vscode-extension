import { streamToBuffer } from '@vscode/test-electron/out/util';
import { exec } from 'child_process';
import * as vscode from 'vscode';
import * as which from 'which';
import * as fs from 'fs';
import * as path from 'path';
import { isAntProject, isBuildProject, isGrapeOrGrailsProject, isLeiningenProject, isMavenProject, openFile, setBuildfileJDK, setPomJDK } from './projectManager';

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
        return jdkPath as string;
    }

    // check if java command exists
    if (await checkIfJavaCommandExists()) {
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
    try{
        const java = await which('java');
        return java;

    } catch (error) {
        return null;
    }
}

/**
 * Open project manager file to set the java configuration
 */
export async function setProjectManagerJDK() {

    const workspaceFolders = vscode.workspace.workspaceFolders;

    //check if the pom.xml file exists
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('There is no open project.');
        return "";
    }
    const projectFolder = workspaceFolders[0].uri.fsPath;

    // Check if the project is a Maven project
    const pomXmlPath = isMavenProject();
    if(pomXmlPath) {

        //open the pom.xml file and set the cursor on java configuration
        setPomJDK(pomXmlPath);
        return;
    }

    //check if there is a build.xml file in the project root folder (Apache Ant project)
    const buildXmlPath = isAntProject();
    if (buildXmlPath) {

        // open build.xml file
        openFile(buildXmlPath);
        return;
    }

    //check if there is a buildfile file in the project root folder (Apache Buildr project)
    const buildFileXmlPath = isBuildProject(); 
    if (buildFileXmlPath) {

        //open the buildfile file and set the cursor on java configuration
        setBuildfileJDK(buildFileXmlPath);
        return;

    }

    //check if there is a build.gradle file in the project root folder (Groovy Grape or Grails project)
    const buildGradlePath = isGrapeOrGrailsProject();
    if (buildGradlePath) {

        //open build.gradle file
        openFile(buildGradlePath);
    }

    //check if there is a project.clj file in the project root folder (Leiningen project)
    const projectCljPath = isLeiningenProject();
    if (projectCljPath) {

        //open project.clj file
        openFile(projectCljPath);
        return;
    }
}


