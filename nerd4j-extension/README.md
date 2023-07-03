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

- <b>setCustomCompiledFolder</b>: sets a custom path for the folder containing the compiled Java files.
- <b>deleteCustomCompiledFolder</b>: deletes the custom compiled folder path if it's set.

The following "generate" commands are available in the VS Code command palette or context menu typing "Generate ...":
- <b>generateToString</b>: generates the toString() method based on the selected fields.
- <b>generateWithField</b>: generates the withField() methods based on the selected fields.
- <b>generateEquals</b>: generates the equals() and hashCode() methods based on the selected fields.
- <b>generateAllMethods</b>: generates the toString(), withField(), equals(), and hashCode() methods based on the selected fields.

<br>
<p align="center">
<img src="https://github.com/beffabryan/nerd4J-vscode-extension/blob/dev/img/gif/code_generation.gif" width="80%" height="auto" />
</p>

