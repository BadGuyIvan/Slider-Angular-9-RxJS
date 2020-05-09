import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { fromEvent, merge, Subscription } from 'rxjs';
import {takeUntil, switchMap, repeat, map, distinctUntilKeyChanged } from 'rxjs/operators';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnInit, OnDestroy {
  constructor(private renderer: Renderer2) { }

  @Output() value: EventEmitter<number> = new EventEmitter();
  @ViewChild('track', { static: true }) track: ElementRef;
  @ViewChild('activeTrack', { static: true }) activeTrack: ElementRef;
  @ViewChild('thumb', { static: true }) thumb: ElementRef;
  @Input() min: number;
  @Input() max: number;

  private sliderSubscription: Subscription;

  mouseEventToCoordinate = (mouseEvent: MouseEvent, track: HTMLElement) => {
    mouseEvent.preventDefault();
    const { left, right, width } = track.getBoundingClientRect();

    const widthThumb = this.thumb.nativeElement.clientWidth;
    const isLeft = mouseEvent.x - widthThumb / 2 <= left;
    const isRight = mouseEvent.x + widthThumb / 2 >= right;
    const position = mouseEvent.x - widthThumb / 2 - left;
    const rightPositionTrack = width - widthThumb;

    return {
      position: isLeft ? 0 : isRight ? rightPositionTrack : position,
      trackWidth: width
    };
  }

  ngOnInit(): void {
    const mouseUp = fromEvent(document, 'mouseup');

    const mouseMove = fromEvent(document, 'mousemove').pipe(
      map((item: MouseEvent) => this.mouseEventToCoordinate(item, this.track.nativeElement)),
      distinctUntilKeyChanged('position')
    );
    const activeTrackClick = fromEvent(this.activeTrack.nativeElement, 'click').pipe(
      map((item: MouseEvent) => this.mouseEventToCoordinate(item, this.track.nativeElement)),
    );
    const trackClick = fromEvent(this.track.nativeElement, 'click').pipe(
      map((item: MouseEvent) => this.mouseEventToCoordinate(item, this.track.nativeElement)),
    );
    const mouseDown = fromEvent(this.thumb.nativeElement, 'mousedown').pipe(switchMap(() => mouseMove));

    this.sliderSubscription = merge(mouseDown, trackClick, activeTrackClick)
      .pipe(
        takeUntil(mouseUp),
        repeat(),
      )
      .subscribe((item: any) => {
        const currentPosition = (item.position / item.trackWidth) * 100;
        const activeTrackWith = ((item.position + this.thumb.nativeElement.clientWidth) / item.trackWidth) * 100;
        const maxValue = this.max - this.min;
        const value = Math.round(this.min + (item.position / (item.trackWidth - this.thumb.nativeElement.clientWidth)) * maxValue);
        this.renderer.setStyle(this.thumb.nativeElement, 'left', currentPosition.toString() + '%');
        this.renderer.setStyle(this.activeTrack.nativeElement, 'width', (activeTrackWith).toString() + '%');
        this.value.emit(value);
      }
    );
  }

  ngOnDestroy(): void {
    this.sliderSubscription.unsubscribe();
  }
}
