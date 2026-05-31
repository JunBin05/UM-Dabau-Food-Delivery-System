package data_structures;
import models.User; 

public class UserHashMap {
    
    private static class HashNode {
        String key; // Will hold the 'userId' (e.g. "U-1001")
        User user;
        HashNode next;

        public HashNode(String key, User user) {
            this.key = key;
            this.user = user;
        }
    }

    private HashNode[] buckets;
    private int size;
    private int capacity;
    
    private static final double LOAD_FACTOR_THRESHOLD = 0.75;

    public UserHashMap(int initialCapacity) {
        this.capacity = initialCapacity;
        this.buckets = new HashNode[capacity];
        this.size = 0;
    }

    private int getBucketIndex(String key) {
        return (key.hashCode() & 0x7fffffff) % capacity;
    }

    public void put(String key, User user) {
        int index = getBucketIndex(key);
        HashNode head = buckets[index];

        while (head != null) {
            if (head.key.equals(key)) {
                head.user = user; 
                return;
            }
            head = head.next;
        }

        size++;
        head = buckets[index];
        HashNode newNode = new HashNode(key, user);
        newNode.next = head;
        buckets[index] = newNode;

        if ((1.0 * size) / capacity >= LOAD_FACTOR_THRESHOLD) {
            resize();
        }
    }

    public User get(String key) {
        int index = getBucketIndex(key);
        HashNode head = buckets[index];

        while (head != null) {
            if (head.key.equals(key)) {
                return head.user;
            }
            head = head.next;
        }
        return null; 
    }

    private void resize() {
        HashNode[] oldBuckets = buckets;
        capacity = capacity * 2; 
        buckets = new HashNode[capacity];
        size = 0;

        for (HashNode headNode : oldBuckets) {
            while (headNode != null) {
                put(headNode.key, headNode.user);
                headNode = headNode.next;
            }
        }
    }
}
