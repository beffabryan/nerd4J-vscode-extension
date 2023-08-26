# Nerd4J Extension
The VS Code extension for the Java library Nerd4J is designed to provide advanced features and streamline development with this library. With this extension, you can easily generate the necessary code for common operations such as generating the `toString()` method, `withField()` methods, and `equals()` and `hashCode()` methods based on selected fields.

Additionally, the extension provides predefined snippets for quickly importing the required libraries to use Nerd4J, simplifying the inclusion of the correct dependencies in your project. You can also find snippets for configuring Nerd4J dependencies in various build systems such as Apache Maven, Apache Ant, Apache Buildr, Groovy Grape, Grails, Leiningen, and SBT. This makes it easier to add the necessary dependencies to your project based on the build system you are using.

By leveraging the full potential of the VS Code extension for Nerd4J, you can enhance your productivity in Java application development, thanks to its ability to automate code generation and simplify dependency management.

## Installation

1. Install the extension from the marketplace 
2. Restart VS Code
3. Open a java file and start coding

## Features
The following commands are available in the VS Code command palette:

<b>Compiled folder: </b>

- <b>setCustomCompiledFolder</b>: sets a custom path for the folder containing the compiled Java files.
- <b>deleteCustomCompiledFolder</b>: deletes the custom compiled folder path if it's set.

<b>Generate: </b>

The following "generate" commands are available in the VS Code command palette or context menu typing "Generate ...":
- <b>generateToString</b>: generates the toString() method based on the selected fields.
- <b>generateWithField</b>: generates the withField() methods based on the selected fields.
- <b>generateEquals</b>: generates the equals() and hashCode() methods based on the selected fields.
- <b>generateAllMethods</b>: generates the toString(), withField(), equals(), and hashCode() methods based on the selected fields.

The <b>toString(), equals() </b>and <b>hashCode()</b> methods can be regenerated if they are already present. The java import of Ner4j library is automatically added if it is not already present.

<b>Java Development Kit: </b>
- <b>checkCurrentJDK</b>: checks and returns the current JDK version if it is set.
- <b>setWorkspaceJDK</b>: sets the JDK version for the current workspace.
- <b>recompileFileAnalyzer: </b> recompiles the FileAnalyzer class with the current jdk.


### Commands
<table>
    <tr>
        <th>Command name</th>
        <th>Command palette</th>
    </tr>
    <tr>
        <td>setCustomCompiledFolder</td>
        <td>Nerd4J: set custom compiled files folder</td>
    </tr>
    <tr>
        <td>deleteCustomCompiledFolder</td>
        <td>Nerd4J: delete custom compiled files folder </td>
    </tr>
    <tr>
        <td>showContextMenu</td>
        <td>Nerd4J: generate </td>
    </tr>
    <tr>
        <td>checkCurrentJDK</td>
        <td>Nerd4J: check jdk version </td>
    </tr>
    <tr>
        <td>setWorkspaceJDK</td>
        <td>Nerd4J: set workspace jdk main folder </td>
    </tr>
    <tr>
        <td>recompileFileAnalyzer</td>
        <td>Nerd4J: recompile FileAnalyzer class </td>
    </tr>
</table>

### Code snippets
There are a few code snippets available for quickly importing the required libraries to use Nerd4J. 

<b>Imports: </b>
The editor via autocomplete will suggest the following Nerd4J library imports:

- import org.nerd4j.utils.lang.*;
- import org.nerd4j.utils.tuple.*;
- import org.nerd4j.utils.math.*;
- import org.nerd4j.utils.cache.*;

<b> Dependencies: </b>
The editor via autocomplete will suggest the Nerd4J library dependencies for the following dependency managers:

- Apache Maven
- Apache Ant
- Apache Buildr
- Groovy Grape
- Grails
- Leiningen
- SBT