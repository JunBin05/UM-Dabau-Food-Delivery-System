public class OrderQueue {

    // Internal Node class specifically for the Queue
    private class QueueNode {
        Order order;
        QueueNode next;

        public QueueNode(Order order) {
            this.order = order;
            this.next = null;
        }
    }

    private QueueNode front;
    private QueueNode rear;
    private int size;

    public OrderQueue() {
        this.front = null;
        this.rear = null;
        this.size = 0;
    }

    // Required Core Methods
    public void enqueue(Order o) { /* Logic */ }
    public Order dequeue() { /* Logic */ }
    public Order peek() { /* Logic */ }
    public boolean isEmpty() { /* Logic */ }
}