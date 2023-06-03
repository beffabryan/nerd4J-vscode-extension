import java.io.File;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class FileAnalyser {

    private Class<?> loadedClass;

    public FileAnalyser(String filePath) throws Exception {

        init(filePath);
    }

    private void init(String filePath) throws Exception {

        // set file from filePath
        File file = new File(filePath);

        if (!file.exists())
            throw new Exception("File does not exist.");

        URLClassLoader classLoader = URLClassLoader.newInstance(new URL[] { file.getParentFile().toURI().toURL() });
        loadedClass = classLoader.loadClass(getClassNameFromFile(file));
    }

    private static String getClassNameFromFile(File file) {
        String fileName = file.getName();
        return fileName.substring(0, fileName.lastIndexOf('.'));
    }

    /**
     * Returns all the fields of the class
     * 
     * @return a list of fields
     */
    public List<String> getClassFields() {
        return Arrays.stream(loadedClass.getDeclaredFields())
                .map(Field::getName)
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
                    parentsClassPublicFields.add(field.getName());
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
        visibleFields.addAll(getClassFields());
        visibleFields.addAll(getParentsVisibleFields());

        return visibleFields;
    }



    public static void main(String[] args) {

        String filePath = "..\\..\\SportCar.java";

        try {
            FileAnalyser fileAnalyser = new FileAnalyser(filePath);

            // get all visible fields
            List<String> visibleFields = fileAnalyser.getVisibleFields();
            for (String field : visibleFields)
                System.out.println(field);


        } catch (Exception e) {
            e.printStackTrace();
        }

    }
}