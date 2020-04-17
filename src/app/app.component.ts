import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  count: number;

  setCount(value) {
    console.log("value ", value)
    this.count = value
  }
  
}
