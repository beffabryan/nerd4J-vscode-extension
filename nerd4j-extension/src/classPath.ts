import { join } from "path";
import * as fs from 'fs';
import * as vscode from 'vscode';
import { isMavenProject } from "./projectManager";

/**
 * Return the classpath of the project, built with the dependencies in the pom.xml file
 * @returns the classpath of the project
 */
export async function getClassPath(): Promise<string | null> {

    let cpPath = '';

    //check if it a Maven project
    if (isMavenProject()) {

        // get  m2 path
        const m2Path = getM2Path();

        if (!m2Path)
            return null;

        // get separator based on the OS
        const separator = process.platform === 'win32' ? ';' : ':';

        // build the classpath using the dependencies in the pom.xml file
        for (const dependencyPath of await getMavenDependenciesPath()) {
            cpPath += join(m2Path, dependencyPath) + separator;
        }
    }

    return cpPath;
}

/**
 * Return the path of the dependencies in the pom.xml file
 */
async function getMavenDependenciesPath() {

    // array of dependencies path    
    const dependenciesPath = [];

    //check if the pom.xml file exists
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('There is no open project.');
        return "";
    }

    // Read the pom.xml file
    const projectFolder = workspaceFolders[0].uri.fsPath;
    const pomXmlPath = vscode.Uri.file(join(projectFolder, "pom.xml"));

    if (fs.existsSync(pomXmlPath.fsPath)) {

        // get all dependencies
        const text = fs.readFileSync(pomXmlPath.fsPath, 'utf8');

        // get dependencies with regex
        const regex = /<dependency\s*>([\s\S]*?)<\/dependency\s*>/g;
        let dependencies = text.match(regex);

        if (dependencies) {
            for (const dependency of dependencies) {
                // Utilizza una regex per estrarre il nome della dipendenza
                const groupIdMatch = /<groupId\s*>(.*?)<\/groupId\s*>/s.exec(dependency);
                const artifactIdMatch = /<artifactId\s*>(.*?)<\/artifactId\s*>/s.exec(dependency);
                const versionMatch = /<version\s*>(.*?)<\/version\s*>/s.exec(dependency);

                if (artifactIdMatch && versionMatch && groupIdMatch) {
                    const groupId = join(...groupIdMatch[1].split('.'));
                    const artifactId = artifactIdMatch[1];
                    const version = versionMatch[1];

                    //build the path of the dependency
                    const dependencyPath = join(groupId, artifactId, version, `${artifactId}-${version}.jar`);
                    dependenciesPath.push(dependencyPath);
                }
            }
        }
    }
    return dependenciesPath;
}

/**
 * Return the path of the m2 folder
 * @returns the path of the m2 folder
 */
function getM2Path(): string | null {

    // check if the m2 path is set in the pom.xml file
    const pomXmlPath = isMavenProject();
    if (!pomXmlPath) {
        return null;
    }

    // Read the pom.xml file and check if the m2 path is set
    const pomXml = fs.readFileSync(pomXmlPath.fsPath, 'utf8');
    const regex = /<localRepository\s*>(.*?)<\/localRepository\s*>/;
    const m2Path = regex.exec(pomXml);

    if (m2Path) {
        
        //get the path
        const m2PathString = m2Path[1];
        
        //split the path with / or \
        const m2PathArray = m2PathString.split(/[\/\\]/);
        const m2PathPlatformIdipendent = join(...m2PathArray);

        //check if the path exists
        if (fs.existsSync(m2PathPlatformIdipendent)) {
            return m2PathPlatformIdipendent;
        }
    }

    // get default m2 path
    const userPath = process.env.HOME || process.env.USERPROFILE;

    if (userPath) {
        const m2Path = join(userPath, '.m2', 'repository');

        //check if the path exists
        if (fs.existsSync(m2Path)) {
            return m2Path;
        }
    }

    return null;
}
