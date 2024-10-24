import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import cytoscape from 'cytoscape';

@Component({
  selector: 'app-binary-tree',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './binary-tree.component.html',
  styleUrl: './binary-tree.component.css'
})
export class BinaryTreeComponent implements AfterViewInit {

  readonly _orders: string[] = ['Pre-order', 'In-order', 'Post-order']
  selectedOrder: string = 'Pre-order'
  private cy: cytoscape.Core | undefined;

  ngAfterViewInit(): void {
    this.initializeCytoscape();
  }

  private initializeCytoscape(): void {
    this.cy = cytoscape({
      container: document.getElementById('cy'),
      elements: [
        { data: { id: 'a' } },
        { data: { id: 'b' } },
        { data: { id: 'c' } },
        { data: { source: 'a', target: 'b' } },
        { data: { source: 'a', target: 'c' } }
      ],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(id)',
            'color': '#fff'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc'
          }
        }
      ],
      layout: {
        name: 'grid',
        rows: 2
      }
    });
  }

  newRandomBinaryTree() {
    
  }

}
