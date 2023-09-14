import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * This class analyzes a compiled file and returns all the accessible fields
 * Usage:
 * {@code java ClassAnalyzer <compiledFilesPath> <className> <modifiableFields>}
 * 
 * @author Bryan Beffa
 */
public class ClassAnalyzer {

    /**
     * This class represents a customizable field of a class.
     */
    class CustomField {

        /* The type of the field. */
        private final Class<?> type;

        /* The name of the field. */
        private final String name;

        /**
         * Method code that indicates if the field has a getter/setter/wither method
         * 0 = no method
         * 1 = method in the current class
         * 2 = method in the parent class
         */
        private int methodCode = 0;

        /**
         * Constructor with parameters.
         * 
         * @param name The name of the field.
         * @param type The type of the field.
         */
        public CustomField(String name, Class<?> type) {
            this.name = name;
            this.type = type;
        }

        /**
         * Set methodCode
         * 
         * @param name int value that indicates the method code
         */
        private void setMethodCode(int methodCode) {
            this.methodCode = methodCode;
        }
    }

    /* The list of fields of the class. */
    public static final String[] PREFIXES = { "set", "with", "get" };

    /* Method codes */
    public static final int NO_METHOD = 0;
    public static final int CURRENT_CLASS = 1;
    public static final int PARENT_CLASS = 2;

    /** The class to analyze. */
    public final Class<?> loadedClass;

    /* The prefix to use for the methods */
    public final String prefix;

    /**
     * Constructor that initializes the class.
     * 
     * @param compiledFilesFolder the path of the compiled files
     * @param className           the name of the class to analyze
     * @throws Exception if the given folder or class do not exist
     */
    public ClassAnalyzer(String compiledFilesFolder, String className, String prefix)
            throws Exception {

        super();

        /* set classes and prefix */
        this.loadedClass = init(compiledFilesFolder, className);
        boolean validPrefix = Arrays.stream(PREFIXES).anyMatch(p -> p.equals(prefix));
        this.prefix = (validPrefix) ? prefix : "";

    }

    /**
     * Initializes the class.
     * 
     * @param compiledFilesFolder the path of the compiled files
     * @param className           the name of the class to analyze
     * @throws Exception if the given folder or class do not exist
     */
    private Class<?> init(String compiledFilesFolder, String className)
            throws Exception {

        /* Check if the directory exists. */
        final Path compiledFiles = Paths.get(compiledFilesFolder);
        if (!Files.exists(compiledFiles))
            throw new NoSuchFileException("The given folder '" + compiledFilesFolder + "' does not exist");

        /* Load the class. */
        final URL[] compiledFilesURL = { compiledFiles.toUri().toURL() };
        final URLClassLoader classLoader = URLClassLoader.newInstance(compiledFilesURL);

        return classLoader.loadClass(className);

    }

    /**
     * Returns the output form of the given field.
     * 
     * @param field the field to transform
     * @return the text to output
     */
    private static String toOutputForm(CustomField field) {
        return field.type.getSimpleName() + " " + field.name + " " + field.methodCode;
    }

    /**
     * Tells if the given field, belonging to the ancestor class, is accessible by
     * the current class.
     * This method is interested only in instance fields. Therefore, all static
     * fields will return {@code false}.
     * <p>
     * A field is accessible by an extending class in three cases:
     * <ol>
     * <li>The field is declared as {@code public}.</li>
     * <li>The field is declared as {@code protected}.</li>
     * <li>The field is declared as package private and the current class is in the
     * same package as the ancestor class.</li>
     * </ol>
     * *
     * 
     * @param field         the modifiers of the field to check
     * @param classPackage  the package of the current class
     * @param parentPackage the package of the ancestor class
     * @return {@code true} if the field is accessible by the current class
     */
    private boolean isAccessibleAndNotStatic(int field, Package classPackage, Package parentPackage) {

        /* Private fields are not visible and we are not interested in static fields. */
        if (Modifier.isStatic(field) || Modifier.isPrivate(field))
            return false;

        /* Public and protected fields are visible by inheritance. */
        if (Modifier.isPublic(field) || Modifier.isProtected(field))
            return true;

        /*
         * At this point, the fields must be declared as package private.
         * Therefore, it is visible only if the current class is in the
         * same package as the parent class.
         */
        return classPackage.equals(parentPackage);

    }

    /**
     * Returns all the fields declared inside the current class.
     * <p>
     * If the fields are required to be modifiable, this method
     * returns only the non final fields.
     * 
     * @param modifialbleOnly tells to return only modifiable fields
     * @return a list of fields
     */
    public List<CustomField> getNonStaticClassFields(boolean modifialbleOnly) {

        final Field[] declaredFields = loadedClass.getDeclaredFields();
        final List<CustomField> fields = new ArrayList<>(declaredFields.length);

        for (Field field : declaredFields) {

            /*
             * We are interested only in instance fields.
             * Therefore, we skip all static fields.
             */
            final int mods = field.getModifiers();
            if (Modifier.isStatic(mods))
                continue;

            /*
             * If the fields are required to be modifiable
             * we skip all the final fields.
             */
            if (modifialbleOnly && Modifier.isFinal(mods))
                continue;

            /* Otherwise, we collect the field. */
            fields.add(new CustomField(field.getName(), field.getType()));

        }

        return fields;

    }

    /**
     * Returns all the fields inherited from ancestor classes.
     * <p>
     * If the fields are required to be modifiable, this method
     * returns only the non final fields.
     * 
     * @param modifialbleOnly tells to return only modifiable fields
     * @return a list of inherited fields
     */
    public List<CustomField> getFieldsAccessibleByInheritance(boolean modifiableOnly) {

        final List<CustomField> accessibleByInheritance = new ArrayList<>();

        /* We need the class package to check package visibility. */
        final Package classPackage = loadedClass.getPackage();

        /* Get all the accessible fields of the ancestor classes. */
        Class<?> parent = loadedClass.getSuperclass();
        while (!parent.equals(Object.class)) {

            /* Get all fields of the parent class. */
            final Field[] fields = parent.getDeclaredFields();
            for (Field field : fields) {

                /* We get the modifiers to check. */
                final int mods = field.getModifiers();

                /* If the field is not accessible we skip it. */
                if (!isAccessibleAndNotStatic(mods, classPackage, parent.getPackage()))
                    continue;

                /*
                 * If the fields are required to be modifiable
                 * we skip all the final fields.
                 */
                if (modifiableOnly && Modifier.isFinal(mods))
                    continue;

                /* Otherwise, we collect the field. */
                accessibleByInheritance.add(new CustomField(field.getName(), field.getType()));

            }

            /* We move to the next ancestor. */
            parent = parent.getSuperclass();

        }

        return accessibleByInheritance;

    }

    /**
     * Returns all the fields accessible from the class.
     * <p>
     * The returned fields comprise those defined in the class
     * and those inherited from ancestor classes.
     * 
     * @param modifialbleOnly tells to return only modifiable fields
     * @return a list of accessible fields
     */
    public List<CustomField> getAccessibleFields(boolean modifialbleOnly) {

        final List<CustomField> accessibleFields = new ArrayList<>();

        /* Get fields */
        accessibleFields.addAll(getNonStaticClassFields(modifialbleOnly));
        accessibleFields.addAll(getFieldsAccessibleByInheritance(modifialbleOnly));

        if (prefix.equals(""))
            return accessibleFields;

        // check if getter/setter/wither methods exist in the current class */
        checkIfMethodExists(accessibleFields);

        // check if getter/setter/wither methods exist in the parent class */
        checkIfMethodsAreOverridden(accessibleFields);

        return accessibleFields;

    }

    /**
     * Checks if the wither/setter methods are overridden by the current class.
     * 
     * @param withersOnly tells if we are interested only in wither methods or
     *                    setter methods. True means wither methods.
     * @returs a list of modifiable fields with the flag set to true if the method
     *         is overridden
     */
    public void checkIfMethodsAreOverridden(List<CustomField> fields) {

        /* Get all the accessible methods of the ancestor classes. */
        Class<?> parent = loadedClass.getSuperclass();

        for (CustomField field : fields) {

            /* Create method name */
            final String methodName = prefix + field.name.substring(0, 1).toUpperCase() + field.name.substring(1);

            try {
                /* Check if method exists */
                if (prefix.equals("set") || prefix.equals("with"))
                    parent.getMethod(methodName, field.type);
                else
                    parent.getMethod(methodName);

                field.setMethodCode(PARENT_CLASS);

            } catch (Exception e) {
                continue;
            }
        }
    }

    public void checkIfMethodExists(List<CustomField> fields) {

        for (CustomField field : fields) {

            /* Create method name */
            final String methodName = prefix + field.name.substring(0, 1).toUpperCase() + field.name.substring(1);

            /* Check if method exists */
            try {

                if (prefix.equals("set") || prefix.equals("with"))
                    loadedClass.getDeclaredMethod(methodName, field.type);
                else
                    loadedClass.getDeclaredMethod(methodName);

                /* set method code to CURRENT_CLASS */
                field.setMethodCode(CURRENT_CLASS);

            } catch (Exception e) {
                continue;
            }
        }

    }

    /* ************* */
    /* ENTRY POINT */
    /* ************* */

    /**
     * Entry point for the class execution.
     * <p>
     * This method expects three arguments:
     * <ol>
     * <li>base path where to find the compiled classes.</li>
     * <li>fully qualified name of the class to analyze.</li>
     * <li>{@code boolean} value telling if the fields to return must be
     * modifiable.</li>
     * </ol>
     * The method prints a list of fields one per line.
     * 
     * @param args the three arguments
     */
    public static void main(String[] args) {

        if (args.length < 2) {
            System.err.print("Usage: java ClassAnalyzer <compiledFilesBasePath> <className> <prefix>");
            return;
        }

        try {

            /* Get the arguments. */
            final String compiledFilesBasePath = args[0];
            final String className = args[1];
            final String prefix = (args.length == 2) ? "" : args[2];

            final boolean modifiableOnly = (prefix.equalsIgnoreCase("set") || prefix.equalsIgnoreCase("with"));

            /* Create the file analyzer. */
            final ClassAnalyzer classAnalyzer = new ClassAnalyzer(compiledFilesBasePath, className, prefix);

            /* Get all accessible fields. */
            final List<CustomField> accessibleFields = classAnalyzer.getAccessibleFields(modifiableOnly);

            System.out.println(classAnalyzer.loadedClass.getSimpleName());
            accessibleFields.stream()
                    .map(ClassAnalyzer::toOutputForm)
                    .forEach(System.out::println);

        } catch (UnsupportedClassVersionError ex) {
            System.err.println(ex);
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
    }

}
