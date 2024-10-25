import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
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

  @ViewChild('cy', { static: true }) cyContainer!: ElementRef;
  private cy!: cytoscape.Core;
  private readonly cyStyleOptions: cytoscape.Stylesheet[] = [
    {
      selector: 'node',
      style: {
        'background-color': '#666',
        'label': 'data(value)',
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
  ]
  private readonly cyLayoutOptions: cytoscape.LayoutOptions = {
    name: 'breadthfirst',
    directed: true
  };

  readonly _orders: string[] = ['Pre-order', 'In-order', 'Post-order']
  selectedOrder: string = 'Pre-order'

  ngAfterViewInit(): void {
    this.initializeCytoscape();
  }

  private initializeCytoscape(): void {
    this.cy = cytoscape({
      container: this.cyContainer.nativeElement,
      style: this.cyStyleOptions,
      layout: this.cyLayoutOptions,
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.2
    });
    this.generateRandomBinaryTree();
  }

  newRandomBinaryTree() {
    this.generateRandomBinaryTree();
  }

  private generateRandomBinaryTree() {
    this.cy.elements().remove()

    // Generar nodos de forma aleatoria
    const nodeCount = this.getRandomIntInclusive(10, 100);
    const values: number[] = Array.from({ length: nodeCount }, () => this.getRandomIntInclusive(1, 100));

    // Tomar el primer valor generado como nodo raiz
    const rootValue = values[0];
    this.cy.add({ data: { id: '1', value: rootValue } });

    // Generar el arbol insertando valores de forma ordenada en base al nodo raiz, 
    // a la izquierda los menores y a la derecha los mayores 
    for (let i = 1; i < values.length; i++) {
      this.insertNode('1', values[i]);
    }

    this.cy.layout(this.cyLayoutOptions).run();
  }

  private insertNode(currentNodeId: string, value: number) {
    const currentNode = this.cy.getElementById(currentNodeId)
    const currentNodeValue: number = currentNode.data('value')
    // Si es menor que el valor del nodo raiz
    if (value < currentNodeValue) {
      const leftChildId = `${currentNodeId}L`;
      // Si existe un nodo izquierdo del nodo raiz entonces se continua 
      // al siguiente sub arbol izquierdo
      if (this.cy.getElementById(leftChildId).length) {
        this.insertNode(leftChildId, value)
        return;
      }
      this.cy.add([
        { data: { id: leftChildId, value } },
        { data: { source: currentNodeId, target: leftChildId } }
      ])
    } else if (value > currentNodeValue) {
      const rightChildId = `${currentNodeId}R`
      // Si existe un nodo derecho del nodo raiz entonces se continua 
      // al siguiente sub arbol derecho
      if (this.cy.getElementById(rightChildId).length) {
        this.insertNode(rightChildId, value)
        return;
      }
      this.cy.add([
        { data: { id: rightChildId, value } },
        { data: { source: currentNodeId, target: rightChildId } }
      ])
    }
  }

  clearBinaryTree() {
    this.cy.elements().remove();
  }

  visualizeSelectedOrder() {

  }

  private getRandomIntInclusive(min: number, max: number) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    // The maximum is inclusive and the minimum is inclusive
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
  }
}
