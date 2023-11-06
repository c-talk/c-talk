use super::{Toc, TocRoot, TreeNodeMeta};

#[test]
fn test_toc_new() {
    let mut toc = TocRoot::new();
    let node = toc.add("test", (0, 0), None).unwrap();
    assert_eq!(node.title, "test");
    assert_eq!(node.meta.range, (0, 0));
    assert_eq!(node.parent, None);
    assert_eq!(node.children.len(), 0);
}

#[test]
fn test_toc_add() {
    let mut toc = TocRoot::new();
    let node = toc.add("test", (0, 0), None).unwrap();
    assert_eq!(node.title, "test");
    assert_eq!(node.meta.range, (0, 0));
    assert_eq!(node.parent, None);
    assert_eq!(node.children.len(), 0);
}

#[test]
fn test_toc_add_with_meta() {
    let mut toc = TocRoot::new();
    let node = toc
        .add_with_meta(
            "test",
            Some(TreeNodeMeta {
                words: 0,
                range: (0, 0),
            }),
            None,
        )
        .unwrap();
    assert_eq!(node.title, "test");
    assert_eq!(node.meta.range, (0, 0));
    assert_eq!(node.parent, None);
    assert_eq!(node.children.len(), 0);
}

#[test]
fn test_toc_get() {
    let mut toc = TocRoot::new();
    let node_id = toc.add("test", (0, 0), None).unwrap().id;
    let node = toc.get(node_id).unwrap();
    assert_eq!(node.title, "test");
    assert_eq!(node.meta.range, (0, 0));
    assert_eq!(node.parent, None);
    assert_eq!(node.children.len(), 0);
}

#[test]
fn test_toc_add_with_meta_and_parent() {
    let mut toc = TocRoot::new();
    let node_id = toc
        .add_with_meta(
            "test",
            Some(TreeNodeMeta {
                words: 0,
                range: (0, 0),
            }),
            None,
        )
        .unwrap()
        .id;
    toc.add_with_meta(
        "test2",
        Some(TreeNodeMeta {
            words: 0,
            range: (0, 0),
        }),
        Some(node_id),
    )
    .unwrap();
    let node1 = toc.get(node_id).unwrap();
    let node2 = toc.get(node1.children[0]).unwrap();
    assert_eq!(node2.title, "test2");
    assert_eq!(node2.meta.range, (0, 0));
    assert_eq!(node2.parent, Some(node_id));
    assert_eq!(node2.children.len(), 0);
}

#[test]
fn test_remove() {
    let mut toc = TocRoot::new();
    let node_id = toc
        .add_with_meta(
            "test",
            Some(TreeNodeMeta {
                words: 0,
                range: (0, 0),
            }),
            None,
        )
        .unwrap()
        .id;
    toc.remove(node_id);
    assert!(!toc.contains(node_id));
    assert_eq!(toc.children.len(), 0);
}

#[test]
fn test_move_up() {
    let mut toc = TocRoot::new();
    let node_id = toc
        .add_with_meta(
            "test",
            Some(TreeNodeMeta {
                words: 0,
                range: (0, 0),
            }),
            None,
        )
        .unwrap()
        .id;
    let node_id2 = toc
        .add_with_meta(
            "test2",
            Some(TreeNodeMeta {
                words: 0,
                range: (0, 0),
            }),
            None,
        )
        .unwrap()
        .id;
    toc.move_up(node_id2);
    assert_eq!(toc.children[0], node_id2);
    assert_eq!(toc.children[1], node_id);
}

#[test]
fn test_move_down() {
    let mut toc = TocRoot::new();
    let node_id = toc
        .add_with_meta(
            "test",
            Some(TreeNodeMeta {
                words: 0,
                range: (0, 0),
            }),
            None,
        )
        .unwrap()
        .id;
    let node_id2 = toc
        .add_with_meta(
            "test2",
            Some(TreeNodeMeta {
                words: 0,
                range: (0, 0),
            }),
            None,
        )
        .unwrap()
        .id;
    toc.move_down(node_id);
    assert_eq!(toc.children[0], node_id2);
    assert_eq!(toc.children[1], node_id);
}

#[test]
fn test_move_right() {
    let mut toc = TocRoot::new();
    let node_id = toc
        .add_with_meta(
            "test",
            Some(TreeNodeMeta {
                words: 0,
                range: (0, 0),
            }),
            None,
        )
        .unwrap()
        .id;
    let node_id2 = toc
        .add_with_meta(
            "test2",
            Some(TreeNodeMeta {
                words: 0,
                range: (0, 0),
            }),
            Some(node_id),
        )
        .unwrap()
        .id;
    toc.move_right(node_id2);
    let node = toc.get(node_id2).unwrap();
    assert_eq!(node.parent, None);
    assert_eq!(toc.children.len(), 2);
    assert_eq!(toc.children[0], node_id);
    assert_eq!(toc.children[1], node_id2);
}

#[test]
fn test_move_left() {
    let mut toc = TocRoot::new();
    let node_id = toc
        .add_with_meta(
            "test",
            Some(TreeNodeMeta {
                words: 0,
                range: (0, 0),
            }),
            None,
        )
        .unwrap()
        .id;
    let node_id2 = toc
        .add_with_meta(
            "test2",
            Some(TreeNodeMeta {
                words: 0,
                range: (0, 0),
            }),
            Some(node_id),
        )
        .unwrap()
        .id;
    toc.move_left(node_id2);
    let node = toc.get(node_id2).unwrap();
    assert_eq!(node.parent, Some(node_id));
    assert_eq!(toc.children.len(), 1);
    assert_eq!(toc.children[0], node_id);
    assert_eq!(toc.get(node_id).unwrap().children[0], node_id2);
}

///
/// Test move_before fn with 5 nodes,  Move node5 before node1
/// Before move:
/// - node1
/// - node2 - node3 - node5
///         - node4
///
/// After move:
/// - node5
/// - node1
/// - node2 - node3
///         - node4
///
#[test]
fn test_move_before() {
    let mut toc = TocRoot::new();
    let node_id1 = toc.add("node1", (0, 0), None).unwrap().id;
    let node_id2 = toc.add("node2", (0, 0), None).unwrap().id;
    let node_id3 = toc.add("node3", (0, 0), Some(node_id2)).unwrap().id;
    let node_id4 = toc.add("node4", (0, 0), Some(node_id2)).unwrap().id;
    let node_id5 = toc.add("node5", (0, 0), Some(node_id3)).unwrap().id;
    toc.move_before(node_id5, node_id1);
    assert_eq!(toc.children.len(), 3);
    assert_eq!(toc.children[0], node_id5);
    assert_eq!(toc.children[1], node_id1);
    assert_eq!(toc.children[2], node_id2);
    assert_eq!(toc.get(node_id5).unwrap().parent, None);
    assert_eq!(toc.get(node_id2).unwrap().children.len(), 2);
    assert_eq!(toc.get(node_id2).unwrap().children[0], node_id3);
    assert_eq!(toc.get(node_id2).unwrap().children[1], node_id4);
    assert_eq!(toc.get(node_id3).unwrap().children.len(), 0);
}

///
/// Test move_after fn with 5 nodes,  Move node5 after node2
/// Before move:
/// - node1
/// - node2 - node3 - node5
///         - node4
///
/// After move:
/// - node1
/// - node2 - node3
///         - node4
/// - node5
///
#[test]
fn test_move_after() {
    let mut toc = TocRoot::new();
    let node_id1 = toc.add("node1", (0, 0), None).unwrap().id;
    let node_id2 = toc.add("node2", (0, 0), None).unwrap().id;
    let node_id3 = toc.add("node3", (0, 0), Some(node_id2)).unwrap().id;
    let node_id4 = toc.add("node4", (0, 0), Some(node_id2)).unwrap().id;
    let node_id5 = toc.add("node5", (0, 0), Some(node_id3)).unwrap().id;
    toc.move_after(node_id5, node_id2);
    assert_eq!(toc.children.len(), 3);
    assert_eq!(toc.children[0], node_id1);
    assert_eq!(toc.children[1], node_id2);
    assert_eq!(toc.children[2], node_id5);
    assert_eq!(toc.get(node_id5).unwrap().parent, None);
    assert_eq!(toc.get(node_id2).unwrap().children.len(), 2);
    assert_eq!(toc.get(node_id2).unwrap().children[0], node_id3);
    assert_eq!(toc.get(node_id2).unwrap().children[1], node_id4);
    assert_eq!(toc.get(node_id3).unwrap().children.len(), 0);
}

///
/// Test move_belong_to fn with 5 nodes,  Move node2 belong to node1
/// Before move:
/// - node1
/// - node2 - node3 - node5
///         - node4
///
/// After move:
/// - node1 - node2 - node3 - node5
///                 - node4
///
#[test]
fn test_move_belong_to() {
    let mut toc = TocRoot::new();
    let node_id1 = toc.add("node1", (0, 0), None).unwrap().id;
    let node_id2 = toc.add("node2", (0, 0), None).unwrap().id;
    let node_id3 = toc.add("node3", (0, 0), Some(node_id2)).unwrap().id;
    let node_id4 = toc.add("node4", (0, 0), Some(node_id2)).unwrap().id;
    let node_id5 = toc.add("node5", (0, 0), Some(node_id3)).unwrap().id;
    toc.move_belong_to(node_id2, node_id1);
    assert_eq!(toc.children.len(), 1);
    assert_eq!(toc.children[0], node_id1);
    assert_eq!(toc.get(node_id1).unwrap().children.len(), 1);
    assert_eq!(toc.get(node_id1).unwrap().children[0], node_id2);
    assert_eq!(toc.get(node_id2).unwrap().children.len(), 2);
    assert_eq!(toc.get(node_id2).unwrap().children[0], node_id3);
    assert_eq!(toc.get(node_id2).unwrap().children[1], node_id4);
    assert_eq!(toc.get(node_id2).unwrap().parent, Some(node_id1));
    assert_eq!(toc.get(node_id5).unwrap().parent, Some(node_id3));
}

#[test]
fn test_get_mut() {
    let mut toc = TocRoot::new();
    let node_id = toc.add("test", (0, 0), None).unwrap().id;
    let node = toc.get_mut(node_id).unwrap();
    node.title = "test2".to_string();
    assert_eq!(node.title, "test2");
}

#[test]
fn test_get_root() {
    let mut toc = TocRoot::new();
    let node_id = toc.add("test", (0, 0), None).unwrap().id;
    let root = toc.get_root();
    assert_eq!(root.children[0], node_id);
}

#[test]
fn test_contains() {
    let mut toc = TocRoot::new();
    let node_id = toc.add("test", (0, 0), None).unwrap().id;
    assert!(toc.contains(node_id));
}

#[test]
fn test_dump() {
    let mut toc = TocRoot::new();
    toc.add("test", (0, 0), None).unwrap();
    let buf = toc.dump().unwrap();
    assert_eq!(buf, "[{\"id\":0,\"title\":\"test\",\"patch\":null,\"meta\":{\"words\":0,\"range\":[0,0]},\"children\":[]}]");
}
