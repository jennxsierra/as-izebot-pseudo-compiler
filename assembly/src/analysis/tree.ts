import { ASTNode } from '../components/ast';

export class TreeRenderer {
  
  static renderVertical(root: ASTNode): string {
    let lines: string[] = [];
    TreeRenderer.buildTree(root, lines, 0, '', true, true);
    
    let result = '';
    for (let i = 0; i < lines.length; i++) {
      result += lines[i];
      if (i < lines.length - 1) {
        result += '\n';
      }
    }
    return result;
  }

  private static buildTree(
    node: ASTNode, 
    lines: string[], 
    depth: i32,
    prefix: string,
    isLast: bool,
    isRoot: bool
  ): void {
    if (isRoot) {
      // Center the root node
      let nodeName = node.getNodeName();
      let padding = '                                     ';
      lines.push(padding + nodeName);
    } else {
      lines.push(prefix + node.getNodeName());
    }
    
    let childCount = node.children.length;
    if (childCount == 0) return;
    
    // Build connector line for children
    if (isRoot && childCount > 0) {
      let connectorLine = '';
      if (childCount == 1) {
        connectorLine = '                                        │';
      } else if (childCount == 2) {
        connectorLine = '                          ┌────────────┴────────────┐';
      } else if (childCount == 3) {
        connectorLine = '              ┌────────────┬───────────┴────────────┐';
      } else {
        // General case for multiple children
        let leftPad = 37 - (childCount * 6);
        for (let i = 0; i < leftPad; i++) {
          connectorLine += ' ';
        }
        for (let i = 0; i < childCount; i++) {
          if (i == 0) {
            connectorLine += '┌';
          } else if (i == childCount - 1) {
            connectorLine += '┐';
          } else {
            connectorLine += '┬';
          }
          if (i < childCount - 1) {
            connectorLine += '──────────────────────────────────────';
          }
        }
      }
      lines.push(connectorLine);
    }
    
    // Render children
    for (let i = 0; i < childCount; i++) {
      let child = node.children[i];
      let childIsLast = (i == childCount - 1);
      let childPrefix = '';
      
      if (isRoot) {
        // Children of root get special spacing
        if (childCount == 1) {
          childPrefix = '                                        ';
        } else if (childCount == 2) {
          childPrefix = i == 0 ? '                          ' : '                                                  ';
        } else if (childCount == 3) {
          if (i == 0) childPrefix = '              ';
          else if (i == 1) childPrefix = '                                     ';
          else childPrefix = '                                                                        ';
        } else {
          // Distribute children evenly
          let spacing = 80 / (childCount + 1);
          for (let s = 0; s < (i + 1) * spacing - 5; s++) {
            childPrefix += ' ';
          }
        }
      } else {
        if (childIsLast) {
          childPrefix = prefix + '  ';
        } else {
          childPrefix = prefix + '  ';
        }
      }
      
      TreeRenderer.buildTree(child, lines, depth + 1, childPrefix, childIsLast, false);
    }
  }
}
