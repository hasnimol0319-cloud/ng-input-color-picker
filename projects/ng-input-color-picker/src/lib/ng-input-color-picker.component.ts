import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldAppearance, MatFormFieldModule } from '@angular/material/form-field';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NgControl,
  ReactiveFormsModule
} from '@angular/forms';
import {
  ConnectedPosition,
  Overlay,
  OverlayModule,
  OverlayRef
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

export interface HsvaColor {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
  a: number; // 0-100
}

@Component({
  selector: 'ng-input-color-picker',
  templateUrl: './ng-input-color-picker.component.html',
  styleUrls: ['./ng-input-color-picker.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    OverlayModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class NgInputColorPickerComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() isRequired: boolean = false;
  @Input() isReadOnly: boolean = false;
  @Input() isAutoFocus: boolean = false;
  @Input() appearance: MatFormFieldAppearance = 'outline';
  @Input() presetColors: string[] = [
    '#E11D1D', '#F97316', '#F5B90B', '#84CC16',
    '#22C55E', '#14B8A6', '#0EA5E9', '#3B82F6',
    '#6366F1', '#8B5CF6', '#D946EF', '#EC4899',
    '#78350F', '#6B7280', '#111827', '#FFFFFF'
  ];

  @ViewChild('fieldTrigger', { static: true }) fieldTrigger!: ElementRef<HTMLElement>;
  @ViewChild('panelTemplate') panelTemplate!: TemplateRef<unknown>;

  public inputControl: FormControl = new FormControl();

  public onTouch: any = () => { };
  public onChange: any = () => { };

  public isOpen: boolean = false;
  public hsva: HsvaColor = { h: 0, s: 100, v: 88, a: 100 };
  private lastAppliedHex: string = 'FFFFFF';

  public hexDraft: string = 'FFFFFF';
  public rDraft: number = 225;
  public gDraft: number = 225;
  public bDraft: number = 225;
  public aDraft: number = 100;

  private draggingSv = false;
  private draggingHue = false;
  private draggingAlpha = false;
  private svEl: HTMLElement | null = null;
  private hueEl: HTMLElement | null = null;
  private alphaEl: HTMLElement | null = null;

  private overlayRef: OverlayRef | null = null;

  /**
  * @Self() The only place allowed to find the injector is the component itself
  * if your parent component doesn’t absolutely need that service, you can decorate a parameter with the @Optional()
  */
  constructor(
    @Optional()
    @Self() public controlDir: NgControl,
    private elementRef: ElementRef,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) {
    this.controlDir && (this.controlDir.valueAccessor = this);
  }

  ngOnInit(): void {
    if (this.isAutoFocus) {
      setTimeout(() => this.openPanel());
    }
  }

  ngDoCheck(): void {
    if (this.controlDir?.control?.touched) {
      this.inputControl.markAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.disposeOverlay();
  }


  writeValue(value: any): void {
    if (!value) {
      this.inputControl.reset();
      this.setFromHex('FFFFFF', false);
      return;
    }
    this.inputControl.setValue(value);
    this.setFromHex(value, false);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.inputControl.valueChanges.subscribe((value) => fn(value));
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.inputControl.disable();
    } else {
      this.inputControl.enable();
    }
  }


  togglePanel(): void {
    if (this.isReadOnly || this.inputControl.disabled) {
      return;
    }
    this.isOpen ? this.closePanel() : this.openPanel();
  }

  openPanel(): void {
    if (this.isOpen) {
      return;
    }
    this.isOpen = true;

    const positions: ConnectedPosition[] = [
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
      { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 }
    ];

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.fieldTrigger)
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withPush(true);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
      minWidth: this.fieldTrigger.nativeElement.getBoundingClientRect().width
    });

    const portal = new TemplatePortal(this.panelTemplate, this.viewContainerRef);
    this.overlayRef.attach(portal);

    this.overlayRef.outsidePointerEvents().subscribe((event) => {
      const target = event.target as HTMLElement;
      if (!this.fieldTrigger.nativeElement.contains(target)) {
        this.closePanel();
      }
    });
  }

  closePanel(): void {
    this.disposeOverlay();
    this.isOpen = false;
    this.onTouch();
  }

  private disposeOverlay(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  cancel(): void {
    this.setFromHex(this.lastAppliedHex, false);
    this.closePanel();
  }

  apply(): void {
    const hex = this.currentHex();
    this.lastAppliedHex = hex;
    this.inputControl.setValue('#' + hex);
    this.inputControl.markAsTouched();
    this.closePanel();
  }

  selectPreset(hex: string): void {
    this.setFromHex(hex, true);
  }


  private hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    s /= 100; v /= 100;
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  }

  private rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d !== 0) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    const s = max === 0 ? 0 : d / max;
    return [h, s * 100, max * 100];
  }

  private toHexByte(n: number): string {
    return n.toString(16).padStart(2, '0').toUpperCase();
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return this.toHexByte(r) + this.toHexByte(g) + this.toHexByte(b);
  }

  private hexToRgb(hex: string): [number, number, number] {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16) || 0;
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  public currentRgb(): [number, number, number] {
    return this.hsvToRgb(this.hsva.h, this.hsva.s, this.hsva.v);
  }

  public currentHex(): string {
    const [r, g, b] = this.currentRgb();
    return this.rgbToHex(r, g, b);
  }

  public currentRgba(alpha: number = this.hsva.a): string {
    const [r, g, b] = this.currentRgb();
    return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
  }

  public pureHueRgb(): [number, number, number] {
    return this.hsvToRgb(this.hsva.h, 100, 100);
  }

  private syncDrafts(): void {
    const [r, g, b] = this.currentRgb();
    this.hexDraft = this.currentHex();
    this.rDraft = r;
    this.gDraft = g;
    this.bDraft = b;
    this.aDraft = Math.round(this.hsva.a);
  }

  private setFromHex(hex: string, applyImmediately: boolean): void {
    const [r, g, b] = this.hexToRgb(hex);
    const [h, s, v] = this.rgbToHsv(r, g, b);
    this.hsva = { h, s, v, a: this.hsva.a };
    this.syncDrafts();
    if (applyImmediately) {
      this.apply();
    }
  }


  onHexInputChange(value: string): void {
    const cleaned = value.replace('#', '').trim();
    if (/^[0-9a-fA-F]{6,7}$/.test(cleaned)) {
      this.setFromHex(cleaned, false);
    } else {
      this.syncDrafts();
    }
  }

  onRgbInputChange(): void {
    const clamp = (n: number) => Math.min(255, Math.max(0, Math.round(n) || 0));
    const r = clamp(this.rDraft);
    const g = clamp(this.gDraft);
    const b = clamp(this.bDraft);
    const [h, s, v] = this.rgbToHsv(r, g, b);
    this.hsva = { h, s, v, a: this.hsva.a };
    this.syncDrafts();
  }

  onAlphaInputChange(): void {
    this.hsva.a = Math.min(100, Math.max(0, this.aDraft || 0));
    this.syncDrafts();
  }

  onSvPointerDown(event: MouseEvent): void {
    this.svEl = event.currentTarget as HTMLElement;
    this.draggingSv = true;
    this.updateSvFromEvent(event, this.svEl);
  }

  onHuePointerDown(event: MouseEvent): void {
    this.hueEl = event.currentTarget as HTMLElement;
    this.draggingHue = true;
    this.updateHueFromEvent(event, this.hueEl);
  }

  onAlphaPointerDown(event: MouseEvent): void {
    this.alphaEl = event.currentTarget as HTMLElement;
    this.draggingAlpha = true;
    this.updateAlphaFromEvent(event, this.alphaEl);
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    if (this.draggingSv && this.svEl) {
      this.updateSvFromEvent(event, this.svEl);
    }
    if (this.draggingHue && this.hueEl) {
      this.updateHueFromEvent(event, this.hueEl);
    }
    if (this.draggingAlpha && this.alphaEl) {
      this.updateAlphaFromEvent(event, this.alphaEl);
    }
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp(): void {
    this.draggingSv = false;
    this.draggingHue = false;
    this.draggingAlpha = false;
  }

  private updateSvFromEvent(event: MouseEvent, svEl: HTMLElement): void {
    const rect = svEl.getBoundingClientRect();
    let x = (event.clientX - rect.left) / rect.width;
    let y = (event.clientY - rect.top) / rect.height;
    x = Math.min(1, Math.max(0, x));
    y = Math.min(1, Math.max(0, y));
    this.hsva.s = x * 100;
    this.hsva.v = (1 - y) * 100;
    this.syncDrafts();
  }

  private updateHueFromEvent(event: MouseEvent, sliderEl: HTMLElement): void {
    const rect = sliderEl.getBoundingClientRect();
    let x = (event.clientX - rect.left) / rect.width;
    x = Math.min(1, Math.max(0, x));
    this.hsva.h = x * 360;
    this.syncDrafts();
  }

  private updateAlphaFromEvent(event: MouseEvent, sliderEl: HTMLElement): void {
    const rect = sliderEl.getBoundingClientRect();
    let x = (event.clientX - rect.left) / rect.width;
    x = Math.min(1, Math.max(0, x));
    this.hsva.a = x * 100;
    this.syncDrafts();
  }
}
