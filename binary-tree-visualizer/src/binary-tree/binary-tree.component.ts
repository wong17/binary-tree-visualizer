import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import cytoscape from 'cytoscape';
import dagre, { DagreLayoutOptions } from 'cytoscape-dagre';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

enum Format {
  PNG, JPG
}

@Component({
  selector: 'app-binary-tree',
  standalone: true,
  imports: [FormsModule, MatMenuModule, MatButtonModule],
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
        'color': '#fff',
        'width': '40px',
        'height': '40px',
        'font-size': '25px',
        'border-width': '1px',
        'border-color': '#fff'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 4,
        'line-color': '#ccc'
      }
    }
  ]
  private readonly cyLayoutOptions: DagreLayoutOptions = {
    name: 'dagre',
    ranker: 'tight-tree'
  };

  readonly exportOptions = [
    { text: 'Export as PNG', format: Format.PNG },
    { text: 'Export as JPG', format: Format.JPG },
  ]

  readonly _orders: string[] = ['Pre-order', 'In-order', 'Post-order']
  selectedOrder: string = 'Pre-order'

  randomButtonDisableFlag: boolean = false
  resetButtonDisableFlag: boolean = false
  visualizeButtonDisableFlag: boolean = false

  readonly minSpeedAnimation: number = 100
  readonly maxSpeedAnimation: number = 1000
  readonly stepAnimation: number = 100
  speedAnimation: number = 500

  /**
   * Inicializa Cytoscape y el árbol binario.
   */
  ngAfterViewInit(): void {
    this.initializeCytoscape();
  }

  /**
   * Inicializa la configuración de Cytoscape y genera un árbol binario aleatorio.
   */
  private initializeCytoscape(): void {
    cytoscape.use(dagre)
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

  /**
   * Genera y muestra un nuevo árbol binario aleatorio en el canvas de Cytoscape.
   */
  newRandomBinaryTree() {
    this.generateRandomBinaryTree();
  }

  /**
   * Elimina cualquier árbol previo en el canvas.
   * Genera un árbol binario aleatorio y lo inserta en Cytoscape.
   */
  private generateRandomBinaryTree() {
    this.cy.elements().remove()

    // Generar nodos de forma aleatoria
    const nodeCount = this.getRandomIntInclusive(20, 100);
    const values: number[] = Array.from({ length: nodeCount }, () => this.getRandomIntInclusive(1, 100));

    // Tomar el primer valor generado como nodo raiz
    const rootId = '1', rootValue = values[0];
    this.cy.add({ data: { id: rootId, value: rootValue } });

    // Generar el arbol insertando valores de forma ordenada para formar un BST
    for (let i = 1; i < values.length; i++) {
      this.insertNode(rootId, values[i]);
    }

    this.cy.layout(this.cyLayoutOptions).run();
    this.cy.fit();
    this.cy.center();
  }

  /**
   * Esta función permite crear un BST https://en.wikipedia.org/wiki/Binary_search_tree
   * para visualizarlo de esa forma tenemos que usar otro layout como 'breadthfirst' ya que
   * el layout actual 'dagre' por alguna razón no respeta el orden y los muestra a como quiere 
   * sin embargo visualmente ofrece una estructura más cercana a la forma de un árbol (ranker: 'tight-tree')
   * 
   * Inserta un nuevo nodo en el árbol binario dado su valor.
   * Se inserta recursivamente en la posición correcta del subárbol izquierdo o derecho.
   * @param currentNodeId ID del nodo actual donde se está evaluando la inserción.
   * @param value Valor del nodo que se va a insertar.
   */
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

  /**
   * Restaura el estilo del árbol a como estaba antes de realizar una animación
   */
  resetBinaryTreeStyle() {
    this.resetNodeStyles()
  }

  /**
   * Restaura el estilo predeterminado de todos los nodos del árbol binario.
   */
  private resetNodeStyles(): void {
    this.cy.nodes().forEach(node => {
      node.style({
        'background-color': '#666',
        'background-fill': 'solid',
        'background-gradient-stop-colors': '',
        'background-gradient-stop-positions': ''
      });
    });
  }

  /**
   * Inicia la visualización del recorrido del árbol binario según el orden seleccionado 
   * (Pre-order, In-order, Post-order).
   */
  visualizeSelectedOrder() {
    this.resetNodeStyles();

    const adjustedSpeed = this.maxSpeedAnimation + this.minSpeedAnimation - this.speedAnimation;

    let index = 0;
    let previousNode: cytoscape.NodeSingular | null = null;
    const highlightNode = (node: cytoscape.NodeSingular) => {
      setTimeout(() => {
        // Nodo anterior
        if (previousNode) {
          previousNode.style("background-fill", "radial-gradient");
          previousNode.style("background-gradient-stop-colors", "cyan magenta");
          previousNode.style("background-gradient-stop-positions", "25 75 80");
        }
        // Nodo actual
        node.style("background-fill", "radial-gradient");
        node.style("background-gradient-stop-colors", "#3dd94a darkgreen");
        node.style("background-gradient-stop-positions", "25 75 80");

        previousNode = node;
      }, adjustedSpeed * index++);
    };

    const rootNodeId = '1'; // El id del nodo raíz
    const rootNode = this.cy.nodes().filter(n => n.id() === rootNodeId)
    switch (this.selectedOrder) {
      case 'Pre-order':
        this.preOrderTraversal(rootNode, highlightNode);
        break;
      case 'In-order':
        this.inOrderTraversal(rootNode, highlightNode);
        break;
      case 'Post-order':
        this.postOrderTraversal(rootNode, highlightNode);
        break;
    }

    // Deshabilitar los botones
    this.randomButtonDisableFlag = this.resetButtonDisableFlag = this.visualizeButtonDisableFlag = true;
    // Calcular duración total de la animación para volver a habilitar los botones
    const totalDuration = adjustedSpeed * index;
    setTimeout(() => {
      // Restablece el color del último nodo una vez finalizada la animación
      if (previousNode) {
        previousNode.style("background-fill", "radial-gradient");
        previousNode.style("background-gradient-stop-colors", "cyan magenta");
        previousNode.style("background-gradient-stop-positions", "25 75 80");
      }
      this.randomButtonDisableFlag = this.resetButtonDisableFlag = this.visualizeButtonDisableFlag = false;
    }, totalDuration);
  }

  /**
   * Obtiene el nodo hijo izquierdo de un nodo dado, asumiendo que el primer 'edge' de salida
   * representa la conexión al hijo izquierdo.
   * @param node Nodo actual para el cual se quiere obtener el hijo izquierdo.
   * @returns El nodo hijo izquierdo si existe, o null si no tiene un hijo izquierdo.
   */
  private getLeftChild(node: cytoscape.NodeSingular): cytoscape.NodeSingular | null {
    const leftEdge = node.outgoers('edge')[0];
    return leftEdge ? leftEdge.target() : null;
  }

  /**
   * Obtiene el nodo hijo derecho de un nodo dado, asumiendo que el segundo 'edge' de salida
   * representa la conexión al hijo derecho.
   * @param node Nodo actual para el cual se quiere obtener el hijo derecho.
   * @returns El nodo hijo derecho si existe, o null si no tiene un hijo derecho.
   */
  private getRightChild(node: cytoscape.NodeSingular): cytoscape.NodeSingular | null {
    const rightEdge = node.outgoers('edge')[1];
    return rightEdge ? rightEdge.target() : null;
  }

  /**
   * Realiza un recorrido en preorden sobre el árbol binario (Root-Left-Right),
   * aplicando una función en cada nodo visitado.
   * @param node Nodo actual desde el cual iniciar el recorrido.
   * @param callback Función que se aplica en cada nodo visitado durante el recorrido.
   */
  private preOrderTraversal(node: cytoscape.NodeSingular | null, callback: (node: cytoscape.NodeSingular) => void): void {
    if (!node) return;

    callback(node);
    this.preOrderTraversal(this.getLeftChild(node), callback);
    this.preOrderTraversal(this.getRightChild(node), callback);
  }

  /**
   * Realiza un recorrido en inorden sobre el árbol binario (Left-Root-Right),
   * aplicando una función en cada nodo visitado.
   * @param node Nodo actual desde el cual iniciar el recorrido.
   * @param callback Función que se aplica en cada nodo visitado durante el recorrido.
   */
  private inOrderTraversal(node: cytoscape.NodeSingular | null, callback: (node: cytoscape.NodeSingular) => void): void {
    if (!node) return;

    this.inOrderTraversal(this.getLeftChild(node), callback);
    callback(node);
    this.inOrderTraversal(this.getRightChild(node), callback);
  }

  /**
   * Realiza un recorrido en postorden sobre el árbol binario (Left-Right-Root),
   * aplicando una función en cada nodo visitado.
   * @param node Nodo actual desde el cual iniciar el recorrido.
   * @param callback Función que se aplica en cada nodo visitado durante el recorrido.
   */
  private postOrderTraversal(node: cytoscape.NodeSingular | null, callback: (node: cytoscape.NodeSingular) => void): void {
    if (!node) return;

    this.postOrderTraversal(this.getLeftChild(node), callback);
    this.postOrderTraversal(this.getRightChild(node), callback);
    callback(node);
  }

  /**
   * Genera un número entero aleatorio en el rango [min, max] (ambos inclusivos).
   * @param min Valor mínimo.
   * @param max Valor máximo.
   * @returns Número aleatorio generado.
   */
  private getRandomIntInclusive(min: number, max: number) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);

    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
  }

  /**
   * Permite exportar el contenido del viewport a una imagen
   * @param format formato a guardar la imagen, PNG o JPG
   */
  exportBinaryTree(format: Format) {
    const options: cytoscape.ExportStringOptions = { full: true, bg: 'black' };
    const image = format === Format.PNG ? this.cy.png(options) : this.cy.jpg(options);

    // Convertir la imagen base64 a un Blob
    fetch(image)
      .then(res => res.blob())
      .then((blob) => {
        const extension = format === Format.PNG ? 'png' : 'jpg';
        const fileName = `binary_tree.${extension}`;

        // Crear un enlace de descarga
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = fileName;

        // Activar la descarga
        downloadLink.click();

        // Liberar el objeto URL después de la descarga
        URL.revokeObjectURL(downloadLink.href);
      })
      .catch(error => {
        console.error("Error al crear la imagen Blob:", error);
      });
  }
}
