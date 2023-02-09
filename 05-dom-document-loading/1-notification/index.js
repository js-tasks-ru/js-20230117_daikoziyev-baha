export default class NotificationMessage {
  static currentElem;
  constructor(targetElem = '', {duration = 2000, type = 'success'}) {
    this.targetElem = targetElem;
    this.duration = duration;
    this.type = type;
    this.render();
  }
  getHeader() {
      return this.type
          ? `<div class="notification-header">${this.type}</div>`
          : '';
  }

  getBody() {
    if (this.targetElem) {
      return `
                <div class="notification-body">${this.targetElem}</div>
              `;
    }
    return '';
  }

  getTemplate() {
    return `
            <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
                <div class="timer"></div>
                <div class="inner-wrapper">
                  ${this.getHeader()}
                  ${this.getBody()}
                </div>
            </div>
           `;
  }
  show(targetElem = document.body) {
    if (NotificationMessage.currentElem) {
      NotificationMessage.currentElem.style.display = 'none';
      // NotificationMessage.currentElem = null;
    }
    targetElem.append(this.element);
    NotificationMessage.currentElem = this.element;
    setTimeout(() => {
      this.remove();
    }, this.duration);
  }
  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
    this.element = null;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
  }
}
