import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"controller", "config", "data_structures", "models"})
public class Application {
    public static void main(String[] args) {
        System.out.println("Starting UM-Dabau application...");
        SpringApplication.run(Application.class, args);
    }
}
