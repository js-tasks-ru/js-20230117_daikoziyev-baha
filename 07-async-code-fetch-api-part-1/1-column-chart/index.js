import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
    subElements = {};
    chartHeight = 50;
    constructor({
        url = '',
        range: {
            from = new Date(),
            to = new Date() } = {},
        label = '',
        link = '',
        value = 0,
        data = [],
        formatHeading = (heading) => heading,
    } = {}) {
        this.url = url;
        this.from = from;
        this.to = to;
        this.label = label;
        this.link = link;
        this.value = formatHeading(value);
        this.data = data;
        this.render();
        this.loadData();
    }
    getSubElements() {
        const result = {};
        const elements = this.element.querySelectorAll('[data-element]');
        for (const subElement of elements) {
            const name = subElement.dataset.element;
            result[name] = subElement;
        }
        return result;
    }
    getLink() {
        return this.link
            ? `<a href="${this.link}" class="column-chart__link">View all</a>`
            : '';
    }
    getHeader() {
        return `<div data-element="header" class="column-chart__header">${this.value}</div>`;
    }
    getBody() {
        return `
            <div data-element="body" class="column-chart__chart">
                ${this.getBodyColumns()}
            </div>`;
    }
    getBodyColumns() {
        if (!this.data.length) return '';
        const maxValue = Math.max(...this.data);
        const scale = this.chartHeight / maxValue;
        return this.data.map(item => {
           return `
                <div style="--value: ${String(Math.floor(item * scale))}"
                    data-tooltip="${(item / maxValue * 100).toFixed(0)}%"></div>
           `;
        }).join('');
    }
    getTemplate() {
        return `
            <div class="column-chart  column-chart_loading" style="--chart-height: ${this.chartHeight}">
                  <div class="column-chart__title">
                    Total ${this.label}
                    ${this.getLink()}
                  </div>
                  <div class="column-chart__container">
                    ${this.getHeader()}
                    ${this.getBody()}
                  </div>
            </div>
        `;
    }
    update(from = this.from, to = this.to) {
        this.from = from;
        this.to = to;
        this.element.classList.add('column-chart_loading');
        this.loadData();
    }
    loadData() {
        if (!this.url) return;
        fetchJson(BACKEND_URL + '/' + this.url + '?' + new URLSearchParams({from: this.from, to: this.to}))
          .then(data => {
                this.data = Object.entries(data).map(item => item[1]);
                  if (this.data.length) {
                      this.subElements.body.innerHTML = this.getBodyColumns();
                      this.element.classList.remove('column-chart_loading');
                  }
            })
          .catch(error => {
                console.error(error);
            });
    }
    remove() {
        if (this.element) {
            this.element.remove();
        }
    }
    destroy() {
        this.remove();
        this.element = null;
        this.subElements = null;
    }
    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTemplate();
        this.element = wrapper.firstElementChild;
        if (this.data.length) {
            this.element.classList.remove('column-chart_loading');
        }
        this.subElements = this.getSubElements();
    }
}
