// Parse Tree Visualization Module
// Renders a vertical ASCII parse tree from an AST. The renderer computes
// layout (width/depth) then paints labels and connecting characters into
// a simple 2D grid before flattening to lines.
import { ASTNode } from '../components/ast';

// Constants for vertical tree rendering
const SIBLING_SPACING: i32 = 2;    // Horizontal space between sibling nodes
const LEVEL_ROW_HEIGHT: i32 = 2;   // Vertical space between tree levels

// Tree drawing characters
const VERTICAL_LINE: string = '│';
const HORIZONTAL_LINE: string = '─'; 
const JUNCTION_DOWN: string = '┬';
const JUNCTION_UP: string = '┴';
const CORNER_LEFT: string = '┌';
const CORNER_RIGHT: string = '┐';
const JUNCTION: string = '┼';

export class TreeRenderer {
  
  /* Render parse tree as vertical ASCII art
   * Converts the hierarchical tree structure into a traditional vertical tree
   * representation */
  static renderVertical(root: ASTNode): string {
    let w = TreeRenderer.measureWidth(root);
    let h = TreeRenderer.measureDepth(root) * LEVEL_ROW_HEIGHT + 1;
    
    if (w < 1) w = 1;
    if (h < 1) h = 1;
    
    // Create 2D grid for rendering
    let grid: string[][] = [];
    for (let i: i32 = 0; i < h; i++) {
      let row: string[] = [];
      for (let j: i32 = 0; j < w; j++) {
        row.push(' ');
      }
      grid.push(row);
    }
    
    // Render tree into grid
    TreeRenderer.renderNode(grid, root, 0, 0);
    
    // Convert grid to string, removing empty trailing lines
    let result: string[] = [];
    for (let i: i32 = 0; i < grid.length; i++) {
      let row = grid[i];
      let line = '';
      for (let j: i32 = 0; j < row.length; j++) {
        line += row[j];
      }
      line = line.trimEnd();
      if (line.length > 0 || result.length > 0) {
        result.push(line);
      }
    }
    
    // Remove trailing empty lines
    while (result.length > 0 && result[result.length - 1] == '') {
      result.pop();
    }
    
    return result.join('\n');
  }

  // Measure the width required for a node and its subtree
  private static measureWidth(node: ASTNode): i32 {
    let labelWidth: i32 = node.getNodeName().length;
    if (labelWidth == 0) {
      labelWidth = 1;
    }
    
    // Leaf node - width is just the label width
    if (node.children.length == 0) {
      return labelWidth;
    }
    
    // Internal node - width is sum of children widths plus spacing
    let childrenWidth: i32 = 0;
    for (let i: i32 = 0; i < node.children.length; i++) {
      childrenWidth += TreeRenderer.measureWidth(node.children[i]);
      if (i < node.children.length - 1) {
        childrenWidth += SIBLING_SPACING;
      }
    }
    
    // Return the maximum of label width and children width
    return childrenWidth > labelWidth ? childrenWidth : labelWidth;
  }

  // Measure the depth (height) of a node's subtree
  private static measureDepth(node: ASTNode): i32 {
    if (node.children.length == 0) {
      return 1;
    }
    
    let maxChildDepth: i32 = 0;
    for (let i: i32 = 0; i < node.children.length; i++) {
      let childDepth = TreeRenderer.measureDepth(node.children[i]);
      if (childDepth > maxChildDepth) {
        maxChildDepth = childDepth;
      }
    }
    
    return 1 + maxChildDepth;
  }

  // Render a node and its subtree into the grid
  private static renderNode(grid: string[][], node: ASTNode, startX: i32, y: i32): i32 {
    let w = TreeRenderer.measureWidth(node);
    if (w <= 0) {
      return 0;
    }
    
    // Calculate label position (centered)
    let label = node.getNodeName();
    let labelX = startX + (w - label.length) / 2;
    
    // Draw the label
    for (let i: i32 = 0; i < label.length; i++) {
      if (y >= 0 && y < grid.length && labelX + i >= 0 && labelX + i < grid[0].length) {
        grid[y][labelX + i] = label.charAt(i);
      }
    }
    
    // If leaf node, we're done
    if (node.children.length == 0) {
      return w;
    }
    
    // Calculate parent center for connecting lines
    let parentCenter = labelX + (label.length - 1) / 2;
    
    // Draw vertical line down from parent (only if not already occupied)
    if (y + 1 < grid.length && parentCenter >= 0 && parentCenter < grid[0].length) {
      if (grid[y + 1][parentCenter] == ' ') {
        grid[y + 1][parentCenter] = VERTICAL_LINE;
      }
    }
    
    // Precompute child widths and total width (including spacing)
    let childWidths: i32[] = [];
    let childrenTotal: i32 = 0;
    for (let i: i32 = 0; i < node.children.length; i++) {
      let cw = TreeRenderer.measureWidth(node.children[i]);
      if (cw < 1) cw = 1;
      childWidths.push(cw);
      childrenTotal += cw;
      if (i < node.children.length - 1) {
        childrenTotal += SIBLING_SPACING;
      }
    }

    // Center the entire children block under this node
    let childStart = startX + (w - childrenTotal) / 2;

    // Child centers, based on the centered start
    let childCenters: i32[] = [];
    for (let i: i32 = 0; i < childWidths.length; i++) {
      childCenters.push(childStart + (childWidths[i] - 1) / 2);
      childStart += childWidths[i] + SIBLING_SPACING;
    }
    
    // Draw horizontal connecting line and junctions
    if (y + 1 < grid.length && childCenters.length > 0) {
      if (childCenters.length == 1) {
        // Single child - just continue the vertical line, no horizontal connections needed
      } else {
        // Multiple children - draw horizontal line spanning all elements
        let minX = parentCenter;
        let maxX = parentCenter;
        
        for (let i: i32 = 0; i < childCenters.length; i++) {
          if (childCenters[i] < minX) minX = childCenters[i];
          if (childCenters[i] > maxX) maxX = childCenters[i];
        }
        
        // Draw horizontal line
        for (let x: i32 = minX; x <= maxX; x++) {
          if (x >= 0 && x < grid[0].length) {
            grid[y + 1][x] = HORIZONTAL_LINE;
          }
        }
        
        // Draw parent junction (T-junction pointing up to connect to parent above)
        if (parentCenter >= 0 && parentCenter < grid[0].length) {
          grid[y + 1][parentCenter] = JUNCTION_UP;
        }
        
        // Draw child junctions with proper corner connections
        for (let i: i32 = 0; i < childCenters.length; i++) {
          let center = childCenters[i];
          if (center >= 0 && center < grid[0].length) {
            if (center == parentCenter) {
              // Parent and child at same position - use four-way junction
              grid[y + 1][center] = JUNCTION;
            } else if (i == 0) {
              // Leftmost child - use top-left corner
              grid[y + 1][center] = CORNER_LEFT;
            } else if (i == childCenters.length - 1) {
              // Rightmost child - use top-right corner
              grid[y + 1][center] = CORNER_RIGHT;
            } else {
              // Middle child - use T-junction pointing down
              grid[y + 1][center] = JUNCTION_DOWN;
            }
          }
        }
      }
    }
    
    // Recursively render children at the same x positions
    childStart = startX + (w - childrenTotal) / 2;
    for (let i: i32 = 0; i < node.children.length; i++) {
      TreeRenderer.renderNode(grid, node.children[i], childStart, y + LEVEL_ROW_HEIGHT);
      childStart += childWidths[i] + SIBLING_SPACING;
    }
    
    return w;
  }
}
