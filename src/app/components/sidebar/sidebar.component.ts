import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import { SidebarContainer } from './sidebar-container.component';
import { isLTR, isIOS, isBrowser } from './utils';

@Component({
  selector : 'ng-sidebar',
  template : `
    <aside #sidebar
      role="complementary"
      [attr.aria-hidden]="!opened"
      [attr.aria-label]="ariaLabel"
      class="ng-sidebar ng-sidebar--{{opened ? 'opened' : 'closed'}} ng-sidebar--{{position}} ng-sidebar--{{mode}}"
      [class.ng-sidebar--docked]="_isDocked"
      [class.ng-sidebar--inert]="_isInert"
      [class.ng-sidebar--animate]="animate"
      [ngClass]="sidebarClass"
      [ngStyle]="_getStyle()">
      <ng-content></ng-content>
    </aside>
  `,
  styleUrls       : ['./sidebar.component.less'],
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class Sidebar implements OnInit, OnChanges, OnDestroy {
  @Input() opened: boolean = false;
  @Output() openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() mode: 'over' | 'push' | 'slide' = 'over';
  @Input() dock: boolean = false;
  @Input() dockedSize: string = '0px';
  @Input() position: 'start' | 'end' | 'left' | 'right' | 'top' | 'bottom' = 'start';
  @Input() animate: boolean = true;

  @Input() autoCollapseHeight: number;
  @Input() autoCollapseWidth: number;
  @Input() autoCollapseOnInit: boolean = true;

  @Input() sidebarClass: string;

  @Input() ariaLabel: string;
  @Input() trapFocus: boolean = false;
  @Input() autoFocus: boolean = true;

  @Input() showBackdrop: boolean = false;
  @Input() closeOnClickBackdrop: boolean = false;
  @Input() closeOnClickOutside: boolean = false;

  @Input() keyClose: boolean = false;
  @Input() keyCode: number = 27;
  @Output() onOpenStart: EventEmitter<null> = new EventEmitter<null>();
  @Output() onOpened: EventEmitter<null> = new EventEmitter<null>();
  @Output() onCloseStart: EventEmitter<null> = new EventEmitter<null>();
  @Output() onClosed: EventEmitter<null> = new EventEmitter<null>();
  @Output() onTransitionEnd: EventEmitter<null> = new EventEmitter<null>();
  @Output() onModeChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onPositionChange: EventEmitter<string> = new EventEmitter<string>();

  @Output() _onRerender: EventEmitter<null> = new EventEmitter<null>();
  @ViewChild('sidebar') _elSidebar: ElementRef;

  private _focusableElementsString: string = 'a[href], area[href], input:not([disabled]), select:not([disabled]),' +
    'textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]';
  private _focusableElements: Array<HTMLElement>;
  private _focusedBeforeOpen: HTMLElement;

  private _wasCollapsed: boolean;

  private _shouldAnimate: boolean;

  private _clickEvent: string = 'click';
  private _onClickOutsideAttached: boolean = false;
  private _onKeyDownAttached: boolean = false;
  private _onResizeAttached: boolean = false;

  private _isBrowser: boolean;

  constructor(@Optional() private _container: SidebarContainer, private _ref: ChangeDetectorRef) {
    if (!this._container) {
      throw new Error(
        '<ng-sidebar> must be inside a <ng-sidebar-container>. ' +
          'See https://github.com/arkon/ng-sidebar#usage for more info.'
      );
    }

    this._isBrowser = isBrowser();

    if (this._isBrowser && isIOS() && 'ontouchstart' in window) {
      this._clickEvent = 'touchstart';
    }

    this._normalizePosition();

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this._onTransitionEnd = this._onTransitionEnd.bind(this);
    this._onFocusTrap = this._onFocusTrap.bind(this);
    this._onClickOutside = this._onClickOutside.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._collapse = this._collapse.bind(this);
  }

  ngOnInit() {
    if (!this._isBrowser) {
      return;
    }

    if (this.animate) {
      this._shouldAnimate = true;
      this.animate = false;
    }

    this._container._addSidebar(this);

    if (this.autoCollapseOnInit) {
      this._collapse();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this._isBrowser) {
      return;
    }

    if (changes['animate'] && this._shouldAnimate) {
      this._shouldAnimate = changes['animate'].currentValue;
    }

    if (changes['opened']) {
      if (this._shouldAnimate) {
        this.animate = true;
        this._shouldAnimate = false;
      }

      if (changes['opened'].currentValue) {
        this.open();
      } else {
        this.close();
      }
    }

    if (changes['closeOnClickOutside'] || changes['keyClose']) {
      this._initCloseListeners();
    }

    if (changes['position']) {
      this._normalizePosition();

      setTimeout(() => {
        this.onPositionChange.emit(changes['position'].currentValue);
      });
    }

    if (changes['mode']) {
      setTimeout(() => {
        this.onModeChange.emit(changes['mode'].currentValue);
      });
    }

    if (changes['dock']) {
      this.triggerRerender();
    }

    if (changes['autoCollapseHeight'] || changes['autoCollapseWidth']) {
      this._initCollapseListeners();
    }
  }

  ngOnDestroy(): void {
    if (!this._isBrowser) {
      return;
    }

    this._destroyCloseListeners();
    this._destroyCollapseListeners();

    this._container._removeSidebar(this);
  }

  open(): void {
    if (!this._isBrowser) {
      return;
    }

    this.opened = true;
    this.openedChange.emit(true);

    this.onOpenStart.emit();

    this._ref.detectChanges();

    setTimeout(() => {
      if (this.animate && !this._isModeSlide) {
        this._elSidebar.nativeElement.addEventListener('transitionend', this._onTransitionEnd);
      } else {
        this._setFocused();
        this._initCloseListeners();

        if (this.opened) {
          this.onOpened.emit();
        }
      }
    });
  }

  close(): void {
    if (!this._isBrowser) {
      return;
    }

    this.opened = false;
    this.openedChange.emit(false);

    this.onCloseStart.emit();

    this._ref.detectChanges();

    setTimeout(() => {
      if (this.animate && !this._isModeSlide) {
        this._elSidebar.nativeElement.addEventListener('transitionend', this._onTransitionEnd);
      } else {
        this._setFocused();
        this._destroyCloseListeners();

        if (!this.opened) {
          this.onClosed.emit();
        }
      }
    });
  }

  triggerRerender(): void {
    if (!this._isBrowser) {
      return;
    }

    setTimeout(() => {
      this._onRerender.emit();
    });
  }

  _getStyle(): CSSStyleDeclaration {
    let transformStyle: string = '';

    // Hides sidebar off screen when closed
    if (!this.opened) {
      const transformDir: string = 'translate' + (this._isLeftOrRight ? 'X' : 'Y');
      let translateAmt: string = `${this._isLeftOrTop ? '-' : ''}100%`;

      transformStyle = `${transformDir}(${translateAmt})`;

      if (this.dock && this._dockedSize > 0 && !(this._isModeSlide && this.opened)) {
        transformStyle += ` ${transformDir}(${this._isLeftOrTop ? '+' : '-'}${this.dockedSize})`;
      }
    }

    return {
      webkitTransform: transformStyle,
      transform: transformStyle
    } as CSSStyleDeclaration;
  }

  _onTransitionEnd(e: TransitionEvent): void {
    if (e.target === this._elSidebar.nativeElement && e.propertyName.endsWith('transform')) {
      this._setFocused();

      if (this.opened) {
        this._initCloseListeners();
        this.onOpened.emit();
      } else {
        this._destroyCloseListeners();
        this.onClosed.emit();
      }

      this.onTransitionEnd.emit();

      this._elSidebar.nativeElement.removeEventListener('transitionend', this._onTransitionEnd);
    }
  }

  private get _shouldTrapFocus(): boolean {
    return this.opened && this.trapFocus && this._isModeOver;
  }

  private _focusFirstItem(): void {
    if (this._focusableElements && this._focusableElements.length > 0) {
      this._focusableElements[0].focus();
    }
  }

  private _onFocusTrap(e: FocusEvent): void {
    if (this._shouldTrapFocus && !this._elSidebar.nativeElement.contains(e.target)) {
      this._focusFirstItem();
    }
  }

  private _setFocused(): void {
    this._focusableElements = Array.from(
      this._elSidebar.nativeElement.querySelectorAll(this._focusableElementsString)
    ) as Array<HTMLElement>;

    if (this.opened) {
      this._focusedBeforeOpen = document.activeElement as HTMLElement;

      // Restore focusability, with previous tabindex attributes
      for (const el of this._focusableElements) {
        const prevTabIndex = el.getAttribute('__tabindex__');
        if (prevTabIndex !== null) {
          el.setAttribute('tabindex', prevTabIndex);
          el.removeAttribute('__tabindex__');
        } else {
          el.removeAttribute('tabindex');
        }
      }

      if (this.autoFocus) {
        this._focusFirstItem();
      }

      document.addEventListener('focus', this._onFocusTrap, true);
    } else {
      // Manually make all focusable elements unfocusable, saving existing tabindex attributes
      for (const el of this._focusableElements) {
        const existingTabIndex = el.getAttribute('tabindex');
        el.setAttribute('tabindex', '-1');

        if (existingTabIndex !== null) {
          el.setAttribute('__tabindex__', existingTabIndex);
        }
      }

      document.removeEventListener('focus', this._onFocusTrap, true);

      // Set focus back to element before the sidebar was opened
      if (this._focusedBeforeOpen && this.autoFocus && this._isModeOver) {
        this._focusedBeforeOpen.focus();
        this._focusedBeforeOpen = null;
      }
    }
  }

  private _initCloseListeners(): void {
    if (this.opened && (this.closeOnClickOutside || this.keyClose)) {
      // In a timeout so that things render first
      setTimeout(() => {
        if (this.closeOnClickOutside && !this._onClickOutsideAttached) {
          document.addEventListener(this._clickEvent, this._onClickOutside);
          this._onClickOutsideAttached = true;
        }

        if (this.keyClose && !this._onKeyDownAttached) {
          document.addEventListener('keydown', this._onKeyDown);
          this._onKeyDownAttached = true;
        }
      });
    }
  }

  private _destroyCloseListeners(): void {
    if (this._onClickOutsideAttached) {
      document.removeEventListener(this._clickEvent, this._onClickOutside);
      this._onClickOutsideAttached = false;
    }

    if (this._onKeyDownAttached) {
      document.removeEventListener('keydown', this._onKeyDown);
      this._onKeyDownAttached = false;
    }
  }

  private _onClickOutside(e: MouseEvent): void {
    if (this._onClickOutsideAttached && this._elSidebar && !this._elSidebar.nativeElement.contains(e.target)) {
      this.close();
    }
  }

  private _onKeyDown(e: KeyboardEvent | Event): void {
    e = e || window.event;

    if ((e as KeyboardEvent).keyCode === this.keyCode) {
      this.close();
    }
  }

  private _initCollapseListeners(): void {
    if (this.autoCollapseHeight || this.autoCollapseWidth) {
      // In a timeout so that things render first
      setTimeout(() => {
        if (!this._onResizeAttached) {
          window.addEventListener('resize', this._collapse);
          this._onResizeAttached = true;
        }
      });
    }
  }

  private _destroyCollapseListeners(): void {
    if (this._onResizeAttached) {
      window.removeEventListener('resize', this._collapse);
      this._onResizeAttached = false;
    }
  }

  private _collapse(): void {
    const winHeight: number = window.innerHeight;
    const winWidth: number = window.innerWidth;

    if (this.autoCollapseHeight) {
      if (winHeight <= this.autoCollapseHeight && this.opened) {
        this._wasCollapsed = true;
        this.close();
      } else if (winHeight > this.autoCollapseHeight && this._wasCollapsed) {
        this.open();
        this._wasCollapsed = false;
      }
    }

    if (this.autoCollapseWidth) {
      if (winWidth <= this.autoCollapseWidth && this.opened) {
        this._wasCollapsed = true;
        this.close();
      } else if (winWidth > this.autoCollapseWidth && this._wasCollapsed) {
        this.open();
        this._wasCollapsed = false;
      }
    }
  }

  get _height(): number {
    if (this._elSidebar.nativeElement) {
      return this._isDocked ? this._dockedSize : this._elSidebar.nativeElement.offsetHeight;
    }

    return 0;
  }

  get _width(): number {
    if (this._elSidebar.nativeElement) {
      return this._isDocked ? this._dockedSize : this._elSidebar.nativeElement.offsetWidth;
    }

    return 0;
  }

  get _dockedSize(): number {
    return parseFloat(this.dockedSize);
  }

  get _isModeOver(): boolean {
    return this.mode === 'over';
  }

  get _isModePush(): boolean {
    return this.mode === 'push';
  }

  get _isModeSlide(): boolean {
    return this.mode === 'slide';
  }

  get _isDocked(): boolean {
    return this.dock && this.dockedSize && !this.opened;
  }

  get _isLeftOrTop(): boolean {
    return this.position === 'left' || this.position === 'top';
  }

  get _isLeftOrRight(): boolean {
    return this.position === 'left' || this.position === 'right';
  }

  get _isInert(): boolean {
    return !this.opened && !this.dock;
  }

  private _normalizePosition(): void {
    const ltr: boolean = isLTR();

    if (this.position === 'start') {
      this.position = ltr ? 'left' : 'right';
    } else if (this.position === 'end') {
      this.position = ltr ? 'right' : 'left';
    }
  }
}
