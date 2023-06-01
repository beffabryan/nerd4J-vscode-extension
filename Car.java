public class Car  {

    int nome = 2;
    String cognome = "";	


@Override
public String toString() {
	return ToString.of(this)
		.print("name", name)
		.print("id", id)
		.like(new ToString.Printer() {
        
            @Override
            public String apply(ToString.Configuration configuration) {
        
                String separator = ",";
                String firstDelimeter = "<";
                String lastDelimeter = ">";
                String equalityOperator = ":";
                StringBuilder sb = new StringBuilder();
        
                // get the class name
                if (configuration.customClassName() != null)
                    sb.append(configuration.customClassName());
                else if (configuration.fullClassPath())
                    sb.append(configuration.target().getClass().getCanonicalName());
                else
                    sb.append(configuration.target().getClass().getSimpleName());
                sb.append(firstDelimeter);
                Iterator<ToString.Configuration.Field> fields = configuration.fields().iterator();
        
                while (fields.hasNext()) {
        
                    ToString.Configuration.Field field = fields.next();
                    sb.append(field.name).append(equalityOperator).append(field.value);
        
                    // Add separator if there are more fields
                    if (fields.hasNext())
                        sb.append(separator);
                }
                sb.append(lastDelimeter);
                return sb.toString();
            }
        });
}


    public static void main(String[] args) {
        Car p = new Car();
        System.out.println(p);

        
    }
}