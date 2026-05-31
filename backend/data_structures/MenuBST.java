package com.umdabau.datastructures;
import com.umdabau.models.MenuItem;

public class MenuBST {

    private static class AVLNode {
        MenuItem item;
        int height;
        AVLNode left, right;

        public AVLNode(MenuItem item) {
            this.item = item;
            this.height = 1; 
        }
    }

    private AVLNode root;

    private int height(AVLNode node) {
        return (node == null) ? 0 : node.height;
    }

    private int getBalance(AVLNode node) {
        return (node == null) ? 0 : height(node.left) - height(node.right);
    }

    private AVLNode rightRotate(AVLNode y) {
        AVLNode x = y.left;
        AVLNode T2 = x.right;
        x.right = y;
        y.left = T2;
        y.height = Math.max(height(y.left), height(y.right)) + 1;
        x.height = Math.max(height(x.left), height(x.right)) + 1;
        return x;
    }

    private AVLNode leftRotate(AVLNode x) {
        AVLNode y = x.right;
        AVLNode T2 = y.left;
        y.left = x;
        x.right = T2;
        x.height = Math.max(height(x.left), height(x.right)) + 1;
        y.height = Math.max(height(y.left), height(y.right)) + 1;
        return y;
    }

    public void insert(MenuItem item) {
        root = insertRec(root, item);
    }

    private AVLNode insertRec(AVLNode node, MenuItem item) {
        if (node == null) return new AVLNode(item);

        // Sorts alphabetically by the exact 'name' field expected by frontend
        int cmp = item.getName().compareToIgnoreCase(node.item.getName());
        if (cmp < 0) {
            node.left = insertRec(node.left, item);
        } else if (cmp > 0) {
            node.right = insertRec(node.right, item);
        } else {
            return node; 
        }

        node.height = 1 + Math.max(height(node.left), height(node.right));
        int balance = getBalance(node);

        if (balance > 1 && cmp < 0) return rightRotate(node); 
        if (balance < -1 && cmp > 0) return leftRotate(node); 
        if (balance > 1 && cmp > 0) { 
            node.left = leftRotate(node.left);
            return rightRotate(node);
        }
        if (balance < -1 && cmp < 0) { 
            node.right = rightRotate(node.right);
            return leftRotate(node);
        }

        return node;
    }

    public MenuItem searchByName(String name) {
        AVLNode res = searchRec(root, name);
        return (res != null) ? res.item : null;
    }

    private AVLNode searchRec(AVLNode node, String name) {
        if (node == null || node.item.getName().equalsIgnoreCase(name)) return node;
        
        if (node.item.getName().compareToIgnoreCase(name) > 0) {
            return searchRec(node.left, name);
        }
        return searchRec(node.right, name);
    }
}
