
import java.io.File;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.NoSuchFileException;
import java.util.ArrayList;
import java.util.List;

/**
 * This class analyzes a compiled file and returns all the visible fields
 * Usage: java FileAnalyzer <compiledFilesPath> <className> <editableFields>
 * 
 * @author Bryan Beffa
 * @version 12.06.2023
 */
public class FileAnalyzer {

    // the class to analyze
    private Class<?> loadedClass;

    // defines if the fields can be edited
    private final boolean editableFields;

    /**
     * Constructor that initializes the class
     * 
     * @param compiledFilesPath the path of the compiled files
     * @param className         the name of the class to analyze
     * @param editableFields    true if the fields can be edited
     * @throws Exception if the directory does not exist
     */
    public FileAnalyzer(String compiledFilesPath, String className, boolean editableFields) throws Exception {
        this.editableFields = editableFields;
        init(compiledFilesPath, className);
    }

    /**
     * Initializes the class
     * 
     * @param compiledFilesPath the path of the compiled files
     * @param className         the name of the class to analyze
     * @throws Exception if the directory does not exist
     */
    private void init(String compiledFilesPath, String className) throws Exception {

        // check if directory exists
        File directory = new File(compiledFilesPath);
        if (!directory.exists())
            throw new NoSuchFileException("Directory does not exist");

        // load the class
        URLClassLoader classLoader = URLClassLoader.newInstance(new URL[] { directory.toURI().toURL() });
        loadedClass = classLoader.loadClass(className);

    }

    /**
     * Returns true if the field is visible
     * 
     * @param field the field to check
     * @return true if the field is visible
     */
    private boolean isVisibleField(Field field) {
        return (Modifier.isPublic(field.getModifiers()) || Modifier.isProtected(field.getModifiers()))
                && !Modifier.isStatic(field.getModifiers());
    }

    /**
     * Returns all the fields of the class
     * 
     * @return a list of fields
     */
    public List<String> getClassFields() {

        List<String> fields = new ArrayList<String>();

        Field[] declaredFields = loadedClass.getDeclaredFields();
        for (Field field : declaredFields) {
            if (!Modifier.isStatic(field.getModifiers())) {

                // check if the field is final
                if (editableFields) {
                    if (!Modifier.isFinal(field.getModifiers()))
                        fields.add(field.getType().getSimpleName() + " " + field.getName());
                } else
                    fields.add(field.getType().getSimpleName() + " " + field.getName());
            }
        }
        return fields;
    }

    /**
     * Returns all the public fields of the parent classes
     * 
     * @return a list of public fields
     */
    public List<String> getParentsVisibleFields() {

        List<String> parentsClassPublicFields = new ArrayList<String>();
        Class<?> clazz = loadedClass;

        // get all the public fields of the parent classes
        while (!clazz.getSuperclass().equals(Object.class)) {

            // get all the fields of the parent classs
            clazz = clazz.getSuperclass();

            Field[] fields = clazz.getDeclaredFields();
            for (Field field : fields) {

                if (isVisibleField(field) && !Modifier.isPrivate(field.getModifiers())) {

                    // check if the field is final
                    if (editableFields) {
                        if (!Modifier.isFinal(field.getModifiers()))
                            parentsClassPublicFields.add(field.getType().getSimpleName() + " " + field.getName());

                    } else
                        parentsClassPublicFields.add(field.getType().getSimpleName() + " " + field.getName());
                }
            }
        }
        return parentsClassPublicFields;
    }

    /**
     * Returns all the visible fields of the class
     * 
     * @return a list of visible fields
     */
    public List<String> getVisibleFields() {

        List<String> visibleFields = new ArrayList<String>();
        visibleFields.add(loadedClass.getSimpleName());
        visibleFields.addAll(getClassFields());
        visibleFields.addAll(getParentsVisibleFields());

        return visibleFields;
    }

    public static void main(String[] args) {

        if (args.length < 3) {
            System.err.print("Usage: java FileAnalyzer <compiledFilesPath> <className> <editableFields>");
            return;
        }

        try {
            
            // get the arguments
            String compiledFilesPath = args[0];
            String className = args[1];
            boolean editableFields = Boolean.parseBoolean(args[2]);

            // create the file analyzer
            FileAnalyzer fileAnalyzer = new FileAnalyzer(compiledFilesPath, className, editableFields);

            // get all visible fields
            List<String> visibleFields = fileAnalyzer.getVisibleFields();
            for (String field : visibleFields)
                System.out.println(field);

        } catch (UnsupportedClassVersionError e) {
            System.err.println("Unsupported class version");
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
    }
}