public class RestaurantList {
    private RestaurantNode head;
    private RestaurantNode tail;
    private int size;

    private static class RestaurantNode {
        private Restaurant data;
        private RestaurantNode next;

        private RestaurantNode(Restaurant data) {
            this.data = data;
            this.next = null;
        }
    }

    public RestaurantList() {
        head = null;
        tail = null;
        size = 0;
    }

    // Add at the end using tail: O(1), after duplicate ID checking: O(n)
    public boolean addRestaurant(Restaurant restaurant) {
        if (restaurant == null || restaurant.getRestaurantId() == null) {
            return false;
        }

        if (findRestaurantById(restaurant.getRestaurantId()) != null) {
            return false;
        }

        RestaurantNode newNode = new RestaurantNode(restaurant);

        if (isEmpty()) {
            head = newNode;
            tail = newNode;
        } else {
            tail.next = newNode;
            tail = newNode;
        }

        size++;
        return true;
    }

    // Find/search by ID: O(n)
    public Restaurant findRestaurantById(String restaurantId) {
        if (restaurantId == null) {
            return null;
        }

        RestaurantNode current = head;

        while (current != null) {
            if (restaurantId.equals(current.data.getRestaurantId())) {
                return current.data;
            }
            current = current.next;
        }

        return null;
    }

    // Update by ID: O(n)
    public boolean updateRestaurant(Restaurant updatedRestaurant) {
        if (updatedRestaurant == null || updatedRestaurant.getRestaurantId() == null) {
            return false;
        }

        RestaurantNode current = head;

        while (current != null) {
            if (updatedRestaurant.getRestaurantId().equals(current.data.getRestaurantId())) {
                current.data = updatedRestaurant;
                return true;
            }
            current = current.next;
        }

        return false;
    }

    // Delete by ID: O(n)
    public boolean deleteRestaurant(String restaurantId) {
        if (restaurantId == null || isEmpty()) {
            return false;
        }

        RestaurantNode current = head;
        RestaurantNode previous = null;

        while (current != null) {
            if (restaurantId.equals(current.data.getRestaurantId())) {
                if (previous == null) {
                    head = current.next;
                } else {
                    previous.next = current.next;
                }

                if (current == tail) {
                    tail = previous;
                }

                size--;
                return true;
            }

            previous = current;
            current = current.next;
        }

        return false;
    }

    // Display all restaurants from head to tail: O(n)
    public void displayRestaurants() {
        if (isEmpty()) {
            System.out.println("No restaurants found.");
            return;
        }

        RestaurantNode current = head;

        while (current != null) {
            System.out.println(current.data);
            current = current.next;
        }
    }

    // isEmpty: O(1)
    public boolean isEmpty() {
        return size == 0;
    }

    // getSize: O(1)
    public int getSize() {
        return size;
    }

    // Clear the list by removing references to the first and last node: O(1)
    public void clear() {
        head = null;
        tail = null;
        size = 0;
    }
}
