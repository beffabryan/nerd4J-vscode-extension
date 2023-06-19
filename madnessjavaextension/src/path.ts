import { join } from "path";
import * as fs from 'fs';
import * as vscode from 'vscode';

// Maven, Buildr, Grails, Leiningen
const STANDARD_COMPILED_FOLDER: string = join('target', 'classes');

// Ant
const ANT_COMPILED_FOLDER: string = join('build', 'classes');

// custo path
let customCompiledPath: string = '';

// the order is important
let possiblePaths: string[] = [
    ANT_COMPILED_FOLDER,
    STANDARD_COMPILED_FOLDER
]

export function setCustomizedPath(path: string): void {
    customCompiledPath = path;
}

export function deleteCustomizedPath(): void {
    customCompiledPath = '';
}


// return the path of the compiled folder
export function existingPath(projectPath: string): string {

    // check custom path
    if (customCompiledPath !== '' &&  fs.existsSync(customCompiledPath)){
        vscode.window.showWarningMessage(`The path ${customCompiledPath} was found`);
        return customCompiledPath;
    }

    for (const possiblePath of possiblePaths) {
        const path = join(projectPath, possiblePath);
        if (fs.existsSync(path))
            return path;
    }

    return '';
}
