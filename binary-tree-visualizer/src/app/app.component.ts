import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BinaryTreeComponent } from "../binary-tree/binary-tree.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BinaryTreeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
