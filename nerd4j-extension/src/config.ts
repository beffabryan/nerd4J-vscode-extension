import { join } from "path";

const JAVA_ANALYZER_FOLDER = join(__dirname, '..', 'src', 'java'); 
const JAVA_FILE_NAME = 'FileAnalyzer';

export const JAVA_COMMAND = `java -cp ${JAVA_ANALYZER_FOLDER} ${JAVA_FILE_NAME}`;

export const TO_STRING_IMPORT = 'import org.nerd4j.utils.lang.ToString;';
export const HASHCODE_IMPORT = 'import org.nerd4j.utils.lang.Hashcode;';
export const EQUALS_IMPORT = 'import org.nerd4j.utils.lang.Equals;';