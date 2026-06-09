package com.umdabau.data_structures;

import java.util.ArrayList;
import java.util.List;

import com.umdabau.models.MenuItem;

/**
 * AVL-style binary search tree for menu items.
 * Items are ordered by menu name so search and sorted display stay tied to the same structure.
 */
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

    // Right rotation fixes a tree that became too heavy on the left side.
    private AVLNode rightRotate(AVLNode y) {
        AVLNode x = y.left;
        AVLNode T2 = x.right;
        x.right = y;
        y.left = T2;
        y.height = Math.max(height(y.left), height(y.right)) + 1;
        x.height = Math.max(height(x.left), height(x.right)) + 1;
        return x;
    }

    // Left rotation fixes a tree that became too heavy on the right side.
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

        // Compare by name so the tree can be searched alphabetically.
        int cmp = item.getName().compareToIgnoreCase(node.item.getName());
        if (cmp < 0) {
            node.left = insertRec(node.left, item);
        } else if (cmp > 0) {
            node.right = insertRec(node.right, item);
        } else {
            return node; // Duplicate names are not inserted
        }

        node.height = 1 + Math.max(height(node.left), height(node.right));
        int balance = getBalance(node);

        // The four AVL cases below keep the tree from becoming a plain linked list.
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
        
        // Because the tree is sorted by name, only one side needs to be searched.
        if (node.item.getName().compareToIgnoreCase(name) > 0) {
            return searchRec(node.left, name);
        }
        return searchRec(node.right, name);
    }

    // Spring can return this List as JSON, while the menu order still comes from the tree.
    public List<MenuItem> inOrderTraversal() {
        List<MenuItem> sortedList = new ArrayList<>();
        inOrderRec(root, sortedList);
        return sortedList;
    }

    private void inOrderRec(AVLNode node, List<MenuItem> list) {
        if (node != null) {
            inOrderRec(node.left, list);  // 1. Go Left (A-Z)
            list.add(node.item);          // 2. Grab the Item
            inOrderRec(node.right, list); // 3. Go Right
        }
    }
}
