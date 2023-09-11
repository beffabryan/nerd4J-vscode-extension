import { join } from "path";

const JAVA_ANALYZER_FOLDER: string = join(__dirname, '..', 'src', 'java'); 
const JAVA_FILE_ANALYZER_NAME: string = 'ClassAnalyzer';
const JAVAC_PATH = join(JAVA_ANALYZER_FOLDER, `${JAVA_FILE_ANALYZER_NAME}.java`)

export const FILE_ANALYZER_COMMAND: string = `java -cp ${JAVA_ANALYZER_FOLDER} ${JAVA_FILE_ANALYZER_NAME}`;
export const JAVAC_COMMAND: string = `javac ${JAVAC_PATH}`;

export const TO_STRING_IMPORT: string = 'import org.nerd4j.utils.lang.ToString;';
export const HASHCODE_IMPORT: string = 'import org.nerd4j.utils.lang.Hashcode;';
export const EQUALS_IMPORT: string = 'import org.nerd4j.utils.lang.Equals;';

export const TO_STRING_IMPORT_REGEXP: RegExp = /import\s+org.nerd4j.utils.lang.ToString\s*;\s*/;
export const HASHCODE_IMPORT_REGEXP: RegExp = /import\s+org.nerd4j.utils.lang.Hashcode\s*;\s*/;
export const EQUALS_IMPORT_REGEXP: RegExp = /import\s+org.nerd4j.utils.lang.Equals\s*;\s*/;
export const GLOBAL_IMPORT_REGEXP: RegExp = /import\s+org.nerd4j.utils.lang.\*\s*;\s*/;

export const TO_STRING_REGEXP: RegExp = /(@Override)*\s*public\s+String\s+toString\s*\(\s*\)\s*(\{\s*[^}]*\})?/;
export const EQUALS_REGEXP: RegExp = /(@Override)*\s*public\s+boolean\s+equals\s*\(\s*Object[^,]*\)\s*\{[^}]*\}/;
export const HASHCODE_REGEXP: RegExp = /(@Override)*\s*public\s+int\s+hashCode\s*\(\s*\)\s*\{[^}]*\}/;

export const PARENT_IMPLEMENTATION: string = "(parent class)";
export const CURRENT_IMPLEMENTATION: string = "(current class)";
                                        