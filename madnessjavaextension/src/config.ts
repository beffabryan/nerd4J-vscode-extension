import { join } from "path";

const JAVA_ANALYZER_FOLDER = join(__dirname, '..', 'src', 'java'); 
const JAVA_FILE_NAME = 'FileAnalyzer';
export const JAVA_COMMAND = `java -cp ${JAVA_ANALYZER_FOLDER} ${JAVA_FILE_NAME}`;

export const JAVA_COMPILED_FOLDER = join('target', 'classes');