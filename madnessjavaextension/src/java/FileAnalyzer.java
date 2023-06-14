
import java.io.File;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.net.URLClassLoader;
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

    private Class<?> loadedClass;
    private final boolean editableField;

    public FileAnalyzer(String compiledFilesPath, String className, boolean editableField) throws Exception {
        this.editableField = editableField;
        init(compiledFilesPath, className);
    }

    private void init(String compiledFilesPath, String className) throws Exception {

        // check if directory exists
        File directory = new File(compiledFilesPath);
        if (!directory.exists())
            throw new Exception("Directory does not exist");

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
        return Modifier.isPublic(field.getModifiers()) || Modifier.isProtected(field.getModifiers())
                || Modifier.isFinal(field.getModifiers());
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

            // check if the field is final
            if (editableField) {
                if (!Modifier.isFinal(field.getModifiers()))
                    fields.add(field.getType().getSimpleName() + " " + field.getName());
            } else
                fields.add(field.getType().getSimpleName() + " " + field.getName());
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

            // get all the fields of the parent class
            clazz = clazz.getSuperclass();

            Field[] fields = clazz.getDeclaredFields();
            for (Field field : fields) {

                if (isVisibleField(field) && !Modifier.isPrivate(field.getModifiers())) {

                    // check if the field is final
                    if (editableField) {
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
            System.out.println("Usage: java FileAnalyzer <compiledFilesPath> <className> <editableFields>");
            System.exit(1);
        }

        String compiledFilesPath = args[0];
        String className = args[1];
        boolean editableFields = Boolean.parseBoolean(args[2]);

        FileAnalyzer fileAnalyzer;
        try {
            fileAnalyzer = new FileAnalyzer(compiledFilesPath, className, editableFields);

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