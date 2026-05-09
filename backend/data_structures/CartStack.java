public class CartStack {
    
    // Internal Node class specifically for the Stack
    private class StackNode {
        MenuItem item;
        StackNode next;
        
        public StackNode(MenuItem item) {
            this.item = item;
            this.next = null;
        }
    }

    private StackNode top;
    private int size;

    public CartStack() {
        this.top = null;
        this.size = 0;
    }

    // Required Core Methods
    public void push(MenuItem item) { /* Logic */ }
    public MenuItem pop() { /* Logic */ }
    public MenuItem peek() { /* Logic */ }
    public boolean isEmpty() { /* Logic */ }
    public int getSize() { return size; }
}