class Tooltip {
  static instance = null;
  static exists = false;
  constructor() {
      if (Tooltip.exists) {
          return Tooltip.instance;
      }
      Tooltip.instance = this;
      Tooltip.exists = true;
      return this;
  }
    showTooltip = (e) => {
      if (e.target.dataset.tooltip) {
          this.element.innerHTML = e.target.dataset.tooltip;
          const rect = e.target.getBoundingClientRect();
          this.element.style.display = 'block';
          this.element.style.left = e.clientX - rect.left + 10 + 'px';
          this.element.style.top = e.clientY - rect.top + 10 + 'px';
          };
      }

  hideTooltip = () => {
      this.element.style.display = 'none';
  }
  initialize () {
      this.render('');
      window.addEventListener('pointerover', this.showTooltip);
      window.addEventListener('pointerout', this.hideTooltip);
  }
  getTooltip(text) {
      return `
        <div class="tooltip">${text}</div>`;
  }
  remove() {
      this.element.remove();
  }
  destroy() {
      document.removeEventListener('pointerover', this.pointerOverFunc);
      document.removeEventListener('pointerout', this.remove);
      this.remove();
      this.element = {};
  }
  render(initialValue = '') {
      const tooltipElem = document.createElement('div');
      tooltipElem.innerHTML = this.getTooltip(initialValue);
      this.element = tooltipElem.firstElementChild;
      this.element.style.display = 'none';
      document.body.append(this.element);
  }
}

export default Tooltip;
