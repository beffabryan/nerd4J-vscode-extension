import { join } from "path";
import * as fs from 'fs';

/* Maven, Buildr, Grails, Leiningen default path */
const STANDARD_COMPILED_FOLDER: string = join('target', 'classes');

/* Ant default path*/
const ANT_COMPILED_FOLDER: string = join('build', 'classes');

/* Variable used to define the custom compiled folder path */
let customCompiledPath: string = '';

/* the order is important */
let possiblePaths: string[] = [
    ANT_COMPILED_FOLDER,
    STANDARD_COMPILED_FOLDER
];

/**
 * Set the path of the compiled folder
 * 
 * @param path path of the compiled folder 
 */
export function setCustomizedPath(path: string): void {
    customCompiledPath = path;
}

/**
 * Delete the path of the compiled folder
 * 
 * @param path path of the compiled folder
 */
export function deleteCustomizedPath(): void {
    customCompiledPath = '';
}

/**
 * Return the path of the compiled folder
 * 
 * @param projectPath path of the project
 * @returns the path of the compiled folder
 */
export function existingPath(projectPath: string): string {

    // check custom path
    if (customCompiledPath !== '' &&  fs.existsSync(customCompiledPath)) {
        return customCompiledPath;
    }

    for (const possiblePath of possiblePaths) {
        const path = join(projectPath, possiblePath);
        if (fs.existsSync(path)) {
            return path;
        }
    }

    return '';
}
