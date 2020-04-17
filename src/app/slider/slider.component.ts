import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { fromEvent, defer, of, combineLatest, from, concat, Subscribable, Subscriber } from "rxjs";
import {
  takeUntil,
  switchMap,
  merge,
  repeat,
  map,
  tap,
  endWith,
  takeWhile,
  concatAll,
  take,
  first,
  repeatWhen,
  filter,
  mergeMap,
  startWith,
  distinctUntilChanged,
  distinct,
  distinctUntilKeyChanged,
  withLatestFrom,
  debounceTime,
  concatMap,
  exhaustMap,
  takeLast,
  exhaust,
  finalize,
} from "rxjs/operators";

@Component({
  selector: "app-slider",
  templateUrl: "./slider.component.html",
  styleUrls: ["./slider.component.scss"],
})
export class SliderComponent implements OnInit {
  constructor() { }

  @Output() value: EventEmitter<number> = new EventEmitter();
  @Input() min: number;
  @Input() max: number;

  mouseEventToCoordinate = (mouseEvent, track, event) => {
    mouseEvent.preventDefault();
    const { left, right, width } = track.getBoundingClientRect();

    const widthThumb = 25;
    const isLeft = mouseEvent.x - widthThumb / 2 <= left;
    const isRight = mouseEvent.x + widthThumb / 2 >= right;
    const position = mouseEvent.x - widthThumb / 2 - left;
    const rightPositionTrack = width - widthThumb;

    return {
      position: isLeft ? 0 : isRight ? rightPositionTrack : position,
      trackWidth: width,
      event
    };
  };

  ngOnInit(): void {
    const thumb = document.getElementById("thumb");
    const track: HTMLElement = document.getElementById("track");
    const activeTrack = document.getElementById("active-track");
    const mouseUp = fromEvent(document, "mouseup")

    const mouseMove = fromEvent(document, "mousemove").pipe(
      map((item) => this.mouseEventToCoordinate(item, track, 'mouseMove')),
      distinctUntilKeyChanged('position')
    )
    const activeTrackClick = fromEvent(activeTrack, "click").pipe(
      map((item) => this.mouseEventToCoordinate(item, track, 'activeTrack')),
    );
    const trackClick = fromEvent(track, "click").pipe(
      map((item) => this.mouseEventToCoordinate(item, track, 'trackClick')),
    );
    const mouseDown = fromEvent(thumb, "mousedown");

    mouseDown
      .pipe(
        switchMap(() => mouseMove),
        merge(trackClick, activeTrackClick),
        takeUntil(mouseUp),
        repeat(),
      )
      .subscribe((item: any) => {
        console.log('wwwwwwwwwwwwwww', item);

        const newX = (item.position / item.trackWidth) * 100;
        activeTrack.style.width = (newX + 1).toString() + "%";
        thumb.style.left = newX.toString() + "%";
        this.value.emit(Math.round(this.min + (((item.position) / (item.trackWidth - 25))) * this.max))
      }
      );
  }
}
