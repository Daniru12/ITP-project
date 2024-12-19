// Sample.java
public class Sample {
    // Instance variable
    private String message;

    // Constructor
    public Sample(String message) {
        this.message = message;
    }

    // Getter method
    public String getMessage() {
        return message;
    }

    // Setter method
    public void setMessage(String message) {
        this.message = message;
    }

    // Method to display the message
    public void displayMessage() {
        System.out.println("Message: " + message);
    }

    // Main method
    public static void main(String[] args) {
        // Create an object of Sample class
        Sample sample = new Sample("Hello, Java!");

        // Display the message
        sample.displayMessage();

        // Update the message
        sample.setMessage("Java is awesome!");

        // Display the updated message
        sample.displayMessage();
    }
}
