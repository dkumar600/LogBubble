export class DragHandler {
  private isDragging = false;
  private isPointerDown = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private mouseDownTime = 0;
  private mouseDownPos = { x: 0, y: 0 };
  private didActuallyDrag = false;

  public buttonX = 0;
  public buttonY = 0;

  constructor(
    private buttonEl: HTMLDivElement,
    private onSnapComplete?: () => void,
    private onClick?: () => void,
  ) {
    this.buttonX = window.innerWidth - 72;
    this.buttonY = 24;
    this.updateButtonPosition();
  }

  public attachListeners() {
    this.buttonEl.addEventListener("mousedown", (e) => this.handleDragStart(e));
    this.buttonEl.addEventListener(
      "touchstart",
      (e) => this.handleDragStart(e),
      {
        passive: false,
      },
    );

    document.addEventListener("mousemove", (e) => this.handleDragMove(e));
    document.addEventListener("touchmove", (e) => this.handleDragMove(e), {
      passive: false,
    });

    document.addEventListener("mouseup", () => this.handleDragEnd());
    document.addEventListener("touchend", () => this.handleDragEnd());
  }

  public isCurrentlyDragging(): boolean {
    return this.isDragging;
  }

  private handleDragStart(e: MouseEvent | TouchEvent) {
    this.isDragging = false;
    this.didActuallyDrag = false;
    this.isPointerDown = true;

    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

    this.dragStartX = clientX - this.buttonX;
    this.dragStartY = clientY - this.buttonY;
    this.mouseDownTime = Date.now();
    this.mouseDownPos = { x: clientX, y: clientY };

    if (e instanceof TouchEvent) {
      e.preventDefault();
    }
  }

  private handleDragMove(e: MouseEvent | TouchEvent) {
    if (!this.isPointerDown) return;
    if (this.dragStartX === 0 && this.dragStartY === 0) return;

    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

    const newX = clientX - this.dragStartX;
    const newY = clientY - this.dragStartY;

    const distanceMoved = Math.sqrt(
      Math.pow(newX - this.buttonX, 2) + Math.pow(newY - this.buttonY, 2),
    );
    if (distanceMoved > 5) {
      this.isDragging = true;
      this.didActuallyDrag = true;
    }

    if (!this.isDragging) return;

    const maxX = window.innerWidth - 48;
    const maxY = window.innerHeight - 48;

    this.buttonX = Math.max(0, Math.min(newX, maxX));
    this.buttonY = Math.max(0, Math.min(newY, maxY));

    this.updateButtonPosition();

    if (e instanceof TouchEvent) {
      e.preventDefault();
    }
  }

  private handleDragEnd() {
    if (!this.isPointerDown) return;

    if (this.isDragging) {
      this.snapToCorner();
    } else if (!this.didActuallyDrag && this.onClick) {
      this.onClick();
    }

    this.isDragging = false;
    this.isPointerDown = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.mouseDownTime = 0;
    this.mouseDownPos = { x: 0, y: 0 };
    this.didActuallyDrag = false;
  }

  private updateButtonPosition() {
    this.buttonEl.style.left = `${this.buttonX}px`;
    this.buttonEl.style.top = `${this.buttonY}px`;
    this.buttonEl.style.right = "auto";
  }

  private snapToCorner() {
    const buttonSize = 48;
    const margin = 24;
    const centerX = this.buttonX + buttonSize / 2;
    const centerY = this.buttonY + buttonSize / 2;

    const isLeftHalf = centerX < window.innerWidth / 2;
    const isTopHalf = centerY < window.innerHeight / 2;

    if (isLeftHalf && isTopHalf) {
      this.buttonX = margin;
      this.buttonY = margin;
    } else if (!isLeftHalf && isTopHalf) {
      this.buttonX = window.innerWidth - buttonSize - margin;
      this.buttonY = margin;
    } else if (isLeftHalf && !isTopHalf) {
      this.buttonX = margin;
      this.buttonY = window.innerHeight - buttonSize - margin;
    } else {
      this.buttonX = window.innerWidth - buttonSize - margin;
      this.buttonY = window.innerHeight - buttonSize - margin;
    }

    this.buttonEl.style.transition = "left 0.3s ease, top 0.3s ease";
    this.updateButtonPosition();
    setTimeout(() => {
      this.buttonEl.style.transition = "none";
      if (this.onSnapComplete) {
        this.onSnapComplete();
      }
    }, 300);
  }
}
