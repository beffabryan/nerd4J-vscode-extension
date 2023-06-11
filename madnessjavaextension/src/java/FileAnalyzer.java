
import java.io.File;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class FileAnalyzer {

    private Class<?> loadedClass;

    public FileAnalyzer(String compiledFilesPath, String className) throws Exception {
        init(compiledFilesPath, className);
    }

    private void init(String compiledFilesPath, String className) throws Exception {

        // check if directory exists
        File directory = new File(compiledFilesPath);
        if (!directory.exists())
            throw new Exception("Directory does not exist.");

        URLClassLoader classLoader = URLClassLoader.newInstance(new URL[] { directory.toURI().toURL() });
        loadedClass = classLoader.loadClass(className);

    }

    /**
     * Returns all the fields of the class
     * 
     * @return a list of fields
     */
    public List<String> getClassFields() {
        return Arrays.stream(loadedClass.getDeclaredFields())
                .map(field -> field.getType().getSimpleName() + " " + field.getName())
                .collect(Collectors.toList());
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

                if (field.getModifiers() == Modifier.PUBLIC || field.getModifiers() == Modifier.PROTECTED)
                    parentsClassPublicFields.add(field.getType().getSimpleName() + " " + field.getName());
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

        //String filePath = args[0];
        //String compiledFilesPath = "C:\\Users\\Bryan\\Desktop\\mvn-project\\target\\classes";
        String compiledFilesPath = args[0];
        String className = args[1];

        try {
            FileAnalyzer fileAnalyzer = new FileAnalyzer(compiledFilesPath, className);

            // get all visible fields
            List<String> visibleFields = fileAnalyzer.getVisibleFields();
            for (String field : visibleFields)
                System.out.println(field);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}