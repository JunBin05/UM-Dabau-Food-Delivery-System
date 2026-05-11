package data_structures;

import models.MenuItem;

public class MenuBST {

    // Internal Node for the Tree
    private class BSTNode {
        MenuItem item;
        BSTNode left;
        BSTNode right;

        public BSTNode(MenuItem item) {
            this.item = item;
            this.left = null;
            this.right = null;
        }
    }

    private BSTNode root;

    public MenuBST() {
        this.root = null;
    }

    // Required Core Methods
    public void insert(MenuItem item) { /* Logic */ }
    public MenuItem search(String itemName) { /* Logic */ }
    
    // Used to return the entire menu sorted alphabetically for the frontend
    public MenuItem[] getSortedMenu() { /* Logic wrapping inOrderTraversal */ }
    private void inOrderTraversal(BSTNode node) { /* Recursive Logic */ }
}