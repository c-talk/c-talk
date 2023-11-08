// A toc is a vector of TreeNodes. Each TreeNode has a title, a range, and a vector of children.
// All node can swap places with their siblings, and can be moved up or down in the tree.

use slab::Slab;

use serde::{Deserialize, Serialize};

use self::error::TocError;

mod encoding;
mod error;

#[cfg(test)]
mod tests;

// Meta info for a node
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TreeNodeMeta {
    pub words: u128,
    pub range: (u128, u128), // a triple of (start, end)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TocNode {
    pub id: usize, // id is the index of the node in the slab
    pub title: String,
    pub patch: Option<String>, // git-diff like patch content, to be applied while document is split.
    pub meta: TreeNodeMeta,
    #[serde(skip_serializing)]
    // No need to serialize parent, it's a weak reference, should rebuild on data load.
    pub parent: Option<usize>,
    pub children: Vec<usize>,
}

#[derive(Debug)]
pub struct TocRoot {
    children: Vec<usize>,
    container: Slab<TocNode>,
}

pub trait Toc {
    fn new() -> Self;
    fn add(
        &mut self,
        title: &str,
        range: (u128, u128),
        parent: Option<usize>,
    ) -> Result<&TocNode, TocError>;
    fn add_with_meta(
        &mut self,
        title: &str,
        meta: Option<TreeNodeMeta>,
        parent: Option<usize>,
    ) -> Result<&TocNode, TocError>;
    fn remove(&mut self, id: usize);
    fn move_up(&mut self, id: usize);
    fn move_down(&mut self, id: usize);
    fn move_left(&mut self, id: usize);
    fn move_right(&mut self, id: usize);
    fn move_belong_to(&mut self, id: usize, parent: usize);
    fn move_before(&mut self, id: usize, target_node: usize);
    fn move_after(&mut self, id: usize, target_node: usize);
    fn get(&self, id: usize) -> Option<&TocNode>;
    fn get_mut(&mut self, id: usize) -> Option<&mut TocNode>;
    fn get_root(&self) -> &TocRoot;
    fn contains(&self, id: usize) -> bool;
}

impl Toc for TocRoot {
    fn new() -> Self {
        TocRoot {
            children: Vec::new(),
            container: Slab::new(),
        }
    }

    fn add(
        &mut self,
        title: &str,
        range: (u128, u128),
        parent: Option<usize>,
    ) -> Result<&TocNode, TocError> {
        self.add_with_meta(title, Some(TreeNodeMeta { words: 0, range }), parent)
    }

    fn add_with_meta(
        &mut self,
        title: &str,
        meta: Option<TreeNodeMeta>,
        parent: Option<usize>,
    ) -> Result<&TocNode, TocError> {
        if parent.is_some_and(|x| !self.contains(x)) {
            return Err(TocError::NodeParentNotFound(parent.unwrap()));
        }
        let id = {
            let entry = self.container.vacant_entry();
            let key = entry.key();
            self.container.insert(TocNode {
                id: key,
                title: title.to_string(),
                patch: None,
                meta: match meta {
                    Some(meta) => meta,
                    None => TreeNodeMeta {
                        words: 0,
                        range: (0, 0),
                    },
                },
                parent,
                children: Vec::new(),
            });
            key
        };
        if let Some(parent_id) = parent {
            let parent = self.container.get_mut(parent_id).unwrap();
            parent.children.push(id);
        } else {
            self.children.push(id);
        }
        Ok(self.container.get(id).unwrap())
    }

    fn remove(&mut self, id: usize) {
        if !self.contains(id) {
            return;
        }
        let node = self.container.remove(id);
        // Remove node children
        for child_id in node.children.iter() {
            self.remove(*child_id);
        }
        if let Some(parent_id) = node.parent {
            let parent = self.get_mut(parent_id).unwrap();
            parent.children.retain(|&x| x != id);
        } else {
            self.children.retain(|&x| x != id);
        }
    }

    fn move_up(&mut self, id: usize) {
        if !self.contains(id) {
            return;
        }
        let node = self.get_mut(id).unwrap();
        if let Some(parent_id) = node.parent {
            let parent = self.get_mut(parent_id).unwrap();
            let index = parent.children.iter().position(|&x| x == id).unwrap();
            if index > 0 {
                parent.children.swap(index, index - 1);
            }
        } else {
            let index = self.children.iter().position(|&x| x == id).unwrap();
            if index > 0 {
                self.children.swap(index, index - 1);
            }
        }
    }

    fn move_down(&mut self, id: usize) {
        if !self.contains(id) {
            return;
        }
        let node = self.get_mut(id).unwrap();
        if let Some(parent_id) = node.parent {
            let parent = self.get_mut(parent_id).unwrap();
            let index = parent.children.iter().position(|&x| x == id).unwrap();
            if index < parent.children.len() - 1 {
                parent.children.swap(index, index + 1);
            }
        } else {
            let index = self.children.iter().position(|&x| x == id).unwrap();
            if index < self.children.len() - 1 {
                self.children.swap(index, index + 1);
            }
        }
    }

    // Move node to the parent level of its parent
    fn move_right(&mut self, id: usize) {
        if !self.contains(id) {
            return;
        }
        let node = self.get(id).unwrap().clone();
        if node.parent.is_none() {
            return; // Root node, no parent, do nothing
        }
        let parent_id = node.parent.unwrap();
        let parent = self.container.get_mut(parent_id).unwrap();
        parent.children.retain(|&x| x != id);
        let grand_parent_id = parent.parent;
        let new_parent_id = {
            if grand_parent_id.is_none() {
                // node's parent is a child of root node
                let root_children: &mut Vec<usize> = self.children.as_mut();
                root_children.push(id);
                None
            } else {
                let grand_parent = self.get_mut(grand_parent_id.unwrap()).unwrap();
                grand_parent.children.push(id);
                grand_parent_id
            }
        };
        let node = self.get_mut(id).unwrap();
        node.parent = new_parent_id;
    }

    // Move node to the first child of its previous sibling
    fn move_left(&mut self, id: usize) {
        if !self.contains(id) {
            return;
        }
        let node = self.get(id).unwrap().clone();
        let parent_children: &mut Vec<usize> = match node.parent {
            Some(parent_id) => self.get_mut(parent_id).unwrap().children.as_mut(),
            None => self.children.as_mut(),
        };
        let index = parent_children.iter().position(|&x| x == id).unwrap();
        if index == 0 {
            return; // node is the first child, do nothing
        }
        parent_children.retain(|&x| x != id);
        let prev_sibling_id = parent_children[index - 1];
        let prev_sibling = self.get_mut(prev_sibling_id).unwrap();
        prev_sibling.children.push(id);
        let node = self.get_mut(id).unwrap();
        node.parent = Some(prev_sibling_id);
    }

    // Move node before another node
    fn move_before(&mut self, id: usize, target_node: usize) {
        if !self.contains(id) || !self.contains(target_node) {
            return;
        }
        let node = self.get(id).unwrap().clone();
        let parent_children: &mut Vec<usize> = match node.parent {
            Some(parent_id) => self.get_mut(parent_id).unwrap().children.as_mut(),
            None => self.children.as_mut(),
        };
        parent_children.retain(|&x| x != id);

        let target_node = self.get(target_node).unwrap().clone();
        let target_parent_children: &mut Vec<usize> = match target_node.parent {
            Some(parent_id) => self.get_mut(parent_id).unwrap().children.as_mut(),
            None => self.children.as_mut(),
        };
        let index = target_parent_children
            .iter()
            .position(|&x| x == target_node.id)
            .unwrap();
        target_parent_children.insert(index, id);
        let node = self.get_mut(id).unwrap();
        node.parent = target_node.parent;
    }

    // Move node after another node
    fn move_after(&mut self, id: usize, target_node: usize) {
        if !self.contains(id) || !self.contains(target_node) {
            return;
        }
        let node = self.get(id).unwrap().clone();
        let parent_children: &mut Vec<usize> = match node.parent {
            Some(parent_id) => self.get_mut(parent_id).unwrap().children.as_mut(),
            None => self.children.as_mut(),
        };
        parent_children.retain(|&x| x != id);

        let target_node = self.get(target_node).unwrap().clone();
        let target_parent_children: &mut Vec<usize> = match target_node.parent {
            Some(parent_id) => self.get_mut(parent_id).unwrap().children.as_mut(),
            None => self.children.as_mut(),
        };
        let index = target_parent_children
            .iter()
            .position(|&x| x == target_node.id)
            .unwrap();
        target_parent_children.insert(index + 1, id);
        let node = self.get_mut(id).unwrap();
        node.parent = target_node.parent;
    }

    ///
    /// Move node to the children of another node
    ///
    fn move_belong_to(&mut self, id: usize, parent: usize) {
        if !self.contains(id) || !self.contains(parent) {
            return;
        }
        let node = self.get(id).unwrap().clone();
        let parent_children: &mut Vec<usize> = match node.parent {
            Some(parent_id) => self.get_mut(parent_id).unwrap().children.as_mut(),
            None => self.children.as_mut(),
        };
        parent_children.retain(|&x| x != id);

        let parent_node = self.get_mut(parent).unwrap();
        parent_node.children.push(id);
        let node = self.get_mut(id).unwrap();
        node.parent = Some(parent);
    }

    fn get(&self, id: usize) -> Option<&TocNode> {
        self.container.get(id)
    }

    fn get_mut(&mut self, id: usize) -> Option<&mut TocNode> {
        self.container.get_mut(id)
    }

    fn get_root(&self) -> &TocRoot {
        self
    }

    fn contains(&self, id: usize) -> bool {
        self.container.contains(id)
    }
}
