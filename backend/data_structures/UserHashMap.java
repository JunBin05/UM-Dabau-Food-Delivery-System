public class UserHashMap {
    // Internal Node for handling collisions via Chaining
    private class HashNode {
        String key;     // The userId
        User value;     // The User object
        HashNode next;
        
        public HashNode(String key, User value) {
            this.key = key;
            this.value = value;
            this.next = null;
        }
    }

    private HashNode[] buckets;
    private int capacity;
    private int size;

    public UserHashMap(int capacity) { /* Logic */ }
    private int getHash(String key) { /* Custom hash logic */ }
    public void put(String key, User user) { /* Logic */ }
    public User get(String key) { /* Logic */ }
}