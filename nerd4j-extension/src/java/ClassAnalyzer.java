import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * This class analyzes a compiled file and returns all the accessible fields
 * Usage: {@code java ClassAnalyzer <compiledFilesPath> <className> <modifiableFields>}
 * 
 * @author Bryan Beffa
 */
public class ClassAnalyzer
{


    /** The class to analyze. */
    public final Class<?> loadedClass;


    /**
     * Constructor that initializes the class.
     * 
     * @param compiledFilesFolder  the path of the compiled files
     * @param className            the name of the class to analyze
     * @throws Exception           if the given folder or class do not exist
     */
    public ClassAnalyzer( String compiledFilesFolder, String className )
    throws Exception
    {

        super();
    
        this.loadedClass = init( compiledFilesFolder, className );

    }

    /**
     * Initializes the class.
     * 
     * @param compiledFilesFolder  the path of the compiled files
     * @param className            the name of the class to analyze
     * @throws Exception           if the given folder or class do not exist
     */
    private Class<?> init( String compiledFilesFolder, String className )
    throws Exception
    {

        /* Check if the directory exists. */
        final Path compiledFiles = Paths.get( compiledFilesFolder );
        if( ! Files.exists(compiledFiles) )
            throw new NoSuchFileException( "The given folder '" + compiledFilesFolder + "' does not exist" );

        /* Load the class. */
        final URL[] compiledFilesURL = { compiledFiles.toUri().toURL() };
        final URLClassLoader classLoader = URLClassLoader.newInstance( compiledFilesURL );

       return classLoader.loadClass( className );

    }


    /**
     * Returns the output form of the given field.
     * 
     * @param field the field to transform
     * @return the text to output
     */
    private static String toOutputForm( Field field )
    {

        return field.getType().getSimpleName() + " " + field.getName();

    }


    /**
     * Tells if the given field, belonging to the ancestor class, is accessible by the current class.
     * This method is interested only in instance fields. Therefore, all static fields will return {@code false}.
     * <p>
     * A field is accessible by an extending class in three cases:
     * <ol>
     *  <li>The field is declared as {@code public}.</li>
     *  <li>The field is declared as {@code protected}.</li>
     *  <li>The field is declared as package private and the current class is in the same package as the ancestor class.</li>
     * </ol>
     *      * 
     * @param field          the modifiers of the field to check
     * @param classPackage   the package of the current class
     * @param parentPackage  the package of the ancestor class
     * @return {@code true} if the field is accessible by the current class
     */
    private boolean isAccessibleAndNotStatic( int field, Package classPackage, Package parentPackage )
    {

        /* Private fields are not visible and we are not interested in static fields. */
        if( Modifier.isStatic(field) || Modifier.isPrivate(field) )
            return false;

        /* Public and protected fields are visible by inheritance. */
        if( Modifier.isPublic(field) || Modifier.isProtected(field) )
            return true;

        /*
         * At this point, the fields must be declared as package private.
         * Therefore, it is visible only if the current class is in the
         * same package as the parent class.
         */
        return classPackage.equals( parentPackage );

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
    public List<Field> getNonStaticClassFields( boolean modifialbleOnly )
    {

        final Field[] declaredFields = loadedClass.getDeclaredFields();
        final List<Field> fields = new ArrayList<>( declaredFields.length );

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
            if( modifialbleOnly && Modifier.isFinal(mods) )
                continue;

            /* Otherwise, we collect the field. */
            fields.add( field );
            
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
    public List<Field> getFieldsAccessibleByInheritance( boolean modifiableOnly )
    {

        final List<Field> accessibleByInheritance = new ArrayList<>();

        /* We need the class package to check package visibility. */
        final Package classPackage = loadedClass.getPackage();
        
        /* Get all the accessible fields of the ancestor classes. */
        Class<?> parent = loadedClass.getSuperclass();
        while( ! parent.equals(Object.class) )
        {

            /* Get all fields of the parent class. */
            final Field[] fields = parent.getDeclaredFields();
            for( Field field : fields )
            {

                /* We get the modifiers to check. */
                final int mods = field.getModifiers();

                /* If the field is not accessible we skip it. */
                if( ! isAccessibleAndNotStatic(mods,classPackage,parent.getPackage()) )
                    continue;

                /* 
                 * If the fields are required to be modifiable
                 * we skip all the final fields.
                 */
                if( modifiableOnly && Modifier.isFinal(mods) )
                    continue;

                /* Otherwise, we collect the field. */
                accessibleByInheritance.add( field );
                
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
    public List<Field> getAccessibleFields( boolean modifialbleOnly )
    {

        final List<Field> accessibleFields = new ArrayList<>();

        accessibleFields.addAll( getNonStaticClassFields(modifialbleOnly) );
        accessibleFields.addAll( getFieldsAccessibleByInheritance(modifialbleOnly) );

        return accessibleFields;

    }


    /* ************* */
    /*  ENTRY POINT  */
    /* ************* */


    /**
     * Entry point for the class execution.
     * <p>
     * This method expects three arguments:
     * <ol>
     *  <li>base path where to find the compiled classes.</li>
     *  <li>fully qualified name of the class to analyze.</li>
     *  <li>{@code boolean} value telling if the fields to return must be modifiable.</li>
     * </ol>
     * The method prints a list of fields one per line.
     * 
     * @param args the three arguments
     */
    public static void main( String[] args )
    {

        if (args.length < 3) {
            System.err.print("Usage: java ClassAnalyzer <compiledFilesBasePath> <className> <modifiableFields>");
            return;
        }

        try {
            
            /* Get the arguments. */
            final String compiledFilesBasePath = args[0];
            final String className             = args[1];
            final boolean modifiableOnly       = Boolean.parseBoolean(args[2]);

            /* Create the file analyzer. */
            final ClassAnalyzer classAnalyzer = new ClassAnalyzer( compiledFilesBasePath, className );

            /* Get all accessible fields. */
            final List<Field> accessibleFields = classAnalyzer.getAccessibleFields( modifiableOnly );
            
            System.out.println( classAnalyzer.loadedClass.getSimpleName() );
            accessibleFields.stream()
                .map( ClassAnalyzer::toOutputForm )
                .forEach( System.out::println );
            
        } catch ( UnsupportedClassVersionError ex ) {
            System.err.println( "Unsupported class version" );
        } catch ( Exception e ){
            System.err.println( e.getMessage() );
        }
    }

}
