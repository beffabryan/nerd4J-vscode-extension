import { join } from "path";
import * as fs from 'fs';
import * as vscode from 'vscode';

// Maven, Buildr, Grails, Leiningen
const STANDARD_COMPILED_FOLDER = join('target', 'classes');

// Ant
const ANT_COMPILED_FOLDER = join('build', 'classes');

// SBT

const possiblePaths: string[] = [
    ANT_COMPILED_FOLDER,
    STANDARD_COMPILED_FOLDER
]

// return the path of the compiled folder
export function existingPath(projectPath: string): string {

    for (const possiblePath of possiblePaths) {
        const path = join(projectPath, possiblePath);
        if (fs.existsSync(path))
            return path;
    }

    return '';
}
