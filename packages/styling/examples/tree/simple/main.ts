/**
 * Tree Simple Example - TypeScript/Bun port of lipgloss tree/simple/main.go
 * 
 * This example demonstrates a simple tree structure with operating systems.
 */

import { TreeBuilder, TreeNode, print } from '@tui/styling';

function main() {
  // Create Linux subtree
  const linuxTree = {
    ...TreeNode.create('Linux'),
    children: [
      TreeNode.create('NixOS'),
      TreeNode.create('Arch Linux (btw)'),
      TreeNode.create('Void Linux')
    ]
  };

  // Create BSD subtree  
  const bsdTree = {
    ...TreeNode.create('BSD'),
    children: [
      TreeNode.create('FreeBSD'),
      TreeNode.create('OpenBSD')
    ]
  };

  const t = TreeBuilder
    .fromRoot('.')
    .customRoot({
      ...TreeNode.create('.'),
      children: [
        TreeNode.create('macOS'),
        linuxTree,
        bsdTree
      ]
    })
    .build();

  print(TreeBuilder.from(t).render());
}

main();