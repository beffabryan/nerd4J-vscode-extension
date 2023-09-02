import { join } from "path";

const JAVA_ANALYZER_FOLDER: string = join(__dirname, '..', 'src', 'java'); 
const JAVA_FILE_NAME: string = 'ClassAnalyzer';
const JAVAC_PATH = join(JAVA_ANALYZER_FOLDER, `${JAVA_FILE_NAME}.java`)

export const JAVA_COMMAND: string = `java -cp ${JAVA_ANALYZER_FOLDER} ${JAVA_FILE_NAME}`;
export const JAVAC_COMMAND: string = `javac ${JAVAC_PATH}`;

export const TO_STRING_IMPORT: string = 'import org.nerd4j.utils.lang.ToString;';
export const HASHCODE_IMPORT: string = 'import org.nerd4j.utils.lang.Hashcode;';
export const EQUALS_IMPORT: string = 'import org.nerd4j.utils.lang.Equals;';

export const TO_STRING_IMPORT_REGEXP: RegExp = /import\s+org.nerd4j.utils.lang.ToString\s*;\s*/;
export const HASHCODE_IMPORT_REGEXP: RegExp = /import\s+org.nerd4j.utils.lang.Hashcode\s*;\s*/;
export const EQUALS_IMPORT_REGEXP: RegExp = /import\s+org.nerd4j.utils.lang.Equals\s*;\s*/;
export const GLOBAL_IMPORT_REGEXP: RegExp = /import\s+org.nerd4j.utils.lang.\*\s*;\s*/;

export const TO_STRING_SIGNATURE: string = 'public String toString()';
export const EQUALS_SIGNATURE: string = 'public boolean equals(Object other)';
export const HASHCODE_SIGNATURE: string = 'public int hashCode()';