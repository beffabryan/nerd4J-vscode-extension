import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class WithersSettersAnalyzer {

    class CustomField {
        private final String type;
        private final String name;
        public boolean existingMethod = false;

        public CustomField(String name, String type) {
            this.name = name;
            this.type = type;
        }

        private void setExistingMethod(boolean existingMethod) {
            this.existingMethod = existingMethod;
        }
    }

    public final Class<?> loadedClass;
    public WithersSettersAnalyzer(String compiledFilesFolder, String className)
            throws Exception {

        super();

        this.loadedClass = init(compiledFilesFolder, className);

    }

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

    private static String toOutputForm(CustomField field) {
        return field.type + " " + field.name + " " + field.existingMethod;
    }

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

    public List<CustomField> getFieldsAccessibleByInheritance() {

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
                 * We skip all the final fields.
                 */
                if (Modifier.isFinal(mods))
                    continue;

                /* Otherwise, we collect the field. */
                accessibleByInheritance.add(new CustomField(field.getName(), field.getType().getSimpleName()));

            }

            /* We move to the next ancestor. */
            parent = parent.getSuperclass();

        }

        return accessibleByInheritance;

    }

    public List<CustomField> checkIfMethodsAreOverridden(boolean withersOnly) {

        final String prefix = withersOnly ? "with" : "set";

        final List<CustomField> accessibleFields = new ArrayList<>();
        accessibleFields.addAll(getFieldsAccessibleByInheritance());

        /* Get all the accessible methods of the ancestor classes. */
        Class<?> parent = loadedClass.getSuperclass();
        while (!parent.equals(Object.class)) {

            /* check if the whitter method already exists */
            final Method[] methods = parent.getDeclaredMethods();

            for (Method method : methods) {

                for (CustomField accessibleField : accessibleFields) {
                    
                    /* create regular expression */
                    final String methodName = prefix + accessibleField.name;
                    
                    /* set the custom field flag to true if the method matches */
                    if(methodName.equalsIgnoreCase(method.getName()))
                        accessibleField.setExistingMethod(true);    
                }

            }

            parent = parent.getSuperclass();

        }

        return accessibleFields;
    }

    public List<CustomField> getNonStaticClassFields(  )
    {

        final Field[] declaredFields = loadedClass.getDeclaredFields();
        final List<CustomField> fields = new ArrayList<>( declaredFields.length );

        for( Field field : declaredFields )
        {

            /* 
             * We are interested only in instance fields.
             * Therefore, we skip all static fields.
             */
            final int mods = field.getModifiers();
            if( Modifier.isStatic(mods) )
                continue;
            
            /* 
             * If the fields are required to be modifiable
             * we skip all the final fields.
             */
            if( Modifier.isFinal(mods) )
                continue;

            /* Otherwise, we collect the field. */
            fields.add(new CustomField(field.getName(), field.getType().getSimpleName()) );
            
        }

        return fields;

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
    public List<CustomField> getAccessibleFields(boolean withersOnly) {

        final List<CustomField> accessibleFields = new ArrayList<>();
        accessibleFields.addAll(getNonStaticClassFields());
        accessibleFields.addAll(checkIfMethodsAreOverridden(withersOnly));
        return accessibleFields;

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

        if (args.length < 3) {
            System.err.print("Usage: java WhittersSetterAnalyzer <compiledFilesBasePath> <className> <modifiableFields>");
            return;
        }

        try {

            /* Get the arguments. */
            final String compiledFilesBasePath = args[0];
            final String className = args[1];
            final boolean withersOnly = Boolean.parseBoolean(args[2]);

            /* Create the file analyzer. */
            final WithersSettersAnalyzer whittersSetterAnalyzer = new WithersSettersAnalyzer(compiledFilesBasePath,
                    className);

            /* Get all accessible fields. */
            final List<CustomField> accessibleFields = whittersSetterAnalyzer.getAccessibleFields(withersOnly);

            System.out.println(whittersSetterAnalyzer.loadedClass.getSimpleName());
            accessibleFields.stream()
                    .map(WithersSettersAnalyzer::toOutputForm)
                    .forEach(System.out::println);

        } catch (UnsupportedClassVersionError ex) {
            System.err.println("Unsupported class version");
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
    }

}
