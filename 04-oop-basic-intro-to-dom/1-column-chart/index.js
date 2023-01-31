export default class ColumnChart {

    chartHeight = 50;

    constructor({ data = [], label = '', link = '', value = 0, formatHeading = (value) => value }) {
        this.data = data;
        this.label = label;
        this.link = link;
        this.value = value;
        this.formatHeading = formatHeading;
        this.render();
    }

    getColumnProps = (data) => {
        const maxValue = Math.max(...data);
        const scale = 50 / maxValue;
    
        return data.map(item => {
            return {
                percent: (item / maxValue * 100).toFixed(0) + '%',
                value: String(Math.floor(item * scale))
            };
        });
    };

    update = (data) => {
        this.data = data;
        const body = this.element.querySelector('.column-chart__chart');
        body.innerHTML = this.getBody();
    }

    remove = () => {
        this.element.remove();
    }

    getLink() {
        return this.link
            ? `<a class="column-chart__link" href="${this.link}">View all</a>`
            : "";
    }

    getBody() {
        let columns = '';
        if (this.data.length === 0) {
            return columns;
        }
        this.getColumnProps(this.data).forEach(item => {
            columns += `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`;
        });
        return columns;
    }

    getHeader = () => {
        return (
            `
                <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
            `
        );
    }

    getTemplate() {
        return (
            `
                <div class="column-chart__title">Total ${this.label}${this.getLink()}</div>
                <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header">${this.getHeader()}</div>
                    <div data-element="body" class="column-chart__chart">
                        ${this.getBody()}
                    </div>
                </div>
            `
        );
    }

    render = () => {
        const wrapper = document.createElement("div");
        wrapper.classList.add(`column-chart`);
        if (this.data.length === 0) {
            wrapper.classList.add(`column-chart_loading`);
        }
        wrapper.style = `--chart-height: ${this.chartHeight}`;
        wrapper.innerHTML = this.getTemplate();
        this.element = wrapper;
    }
}
