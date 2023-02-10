class Tooltip {
  static instance = null;
  static exists = false;
  constructor() {
      if (Tooltip.exists) {
          return Tooltip.instance;
      }
      Tooltip.instance = this;
      Tooltip.exists = true;
  }
  onPointerOver = (e) => {
      if (e.target.dataset.tooltip) {
          this.render(e.target.dataset.tooltip);
          document.addEventListener('pointermove', this.onPointerMove);
          }
  }
  onPointerMove = (e) => {
      const shift = 10;
      this.element.style.left = e.clientX + shift + 'px';
      this.element.style.top = e.clientY + shift + 'px';
  }

  onPointerOut = () => {
      this.remove();
      document.removeEventListener('pointermove', this.onPointerMove);
  }
  initialize () {
      document.addEventListener('pointerover', this.onPointerOver);
      document.addEventListener('pointerout', this.onPointerOut);
  }
  getTooltip(text) {
      return `
        <div class="tooltip">${text}</div>`;
  }
  remove() {
      if (this.element) {
          this.element.remove();
      }
  }
  destroy() {
      document.removeEventListener('pointerover', this.onPointerOver);
      document.removeEventListener('pointerout', this.onPointerOut);
      document.removeEventListener('pointermove', this.onPointerMove);
      this.remove();
      this.element = null;
  }
  render(initialValue = '') {
      const tooltipElem = document.createElement('div');
      tooltipElem.innerHTML = this.getTooltip(initialValue);
      this.element = tooltipElem.firstElementChild;
      document.body.append(this.element);
  }
}

export default Tooltip;
