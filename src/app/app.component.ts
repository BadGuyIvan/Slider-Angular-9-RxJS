import { Component } from '@angular/core';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  min = 10;
  max = 50;
  count: number = this.min;
  setCount(value: number) {
    this.count = value;
  }

}
