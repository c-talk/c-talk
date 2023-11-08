use anyhow::Result;
use serde::{Deserialize, Serialize};

use super::{Toc, TocNode, TocRoot, TreeNodeMeta};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JSONNode {
    pub id: usize,
    pub title: String,
    pub patch: Option<String>, // git-diff like patch content, to be applied while document is split.
    pub meta: TreeNodeMeta,
    pub children: Vec<JSONNode>,
}

pub type JSONRoot = Vec<JSONNode>;

impl From<&TocRoot> for JSONRoot {
    fn from(toc: &TocRoot) -> Self {
        let mut root = JSONRoot::new();
        for child_id in toc.children.iter() {
            root.push(JSONNode::from_toc_node(toc, toc.get(*child_id).unwrap()));
        }
        root
    }
}

// impl From<JSONRoot> for TocRoot {
//     fn from(json: JSONRoot) -> Self {
//         let mut toc = TocRoot::new();
//         // 1. iterate all nodes and insert them into the toc
//         for json_node in json.iter() {
//             toc.add_with_meta(&json_node.title, Some(json_node.meta.clone()), None);
//         }
//         toc
//     }
// }

impl JSONNode {
    fn from_toc_node(toc: &TocRoot, toc_node: &TocNode) -> Self {
        let mut node = JSONNode {
            id: toc_node.id,
            title: toc_node.title.clone(),
            patch: toc_node.patch.clone(),
            meta: toc_node.meta.clone(),
            children: Vec::new(),
        };
        for child_id in toc_node.children.iter() {
            node.children
                .push(JSONNode::from_toc_node(toc, toc.get(*child_id).unwrap()));
        }
        node
    }

    // fn to_toc_node(toc: &mut TocRoot, node: &Self) -> TocNode {
    //     toc.container.insert(val)
    // }
}

impl Serialize for TocRoot {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        JSONRoot::from(self).serialize(serializer)
    }
}

impl TocRoot {
    pub fn dump(&self) -> Result<String> {
        let buf = simd_json::to_string(self)?;
        Ok(buf)
    }
}
