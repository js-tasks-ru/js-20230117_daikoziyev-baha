import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  constructor(headersConfig, {
      url = '',
      data = [],
      sorted = {
          id: headersConfig.find(item => item.sortable).id,
          order: 'asc'
      },
      isSortLocally = false
  } = {}) {
    this.headersConfig = headersConfig;
    this.url = url;
    this.isSortLocally = isSortLocally;
    this.data = data;
    this.sorted = sorted;
    this.render();
  }
    getColumnHeaders() {
        return `
            <div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.getHeaderCells().join('')}
            </div>
        `;
    }
    getHeaderSortingArrow (id) {
        const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

        return isOrderExist
            ? `<span data-element="arrow" class="sortable-table__sort-arrow">
                  <span class="sort-arrow"></span>
               </span>`
            : '';
    }
    getHeaderCells() {
        return this.headersConfig.map(item => {
            return `
                <div class="sortable-table__cell" data-id=${item.id} data-sortable=${item.sortable}>
                   <span>${item.title}</span>
                   ${this.getHeaderSortingArrow(item.title)}
                </div>`;
        });
    }
    getTableBody() {
        return `
            <div data-element="body" class="sortable-table__body">
                ${this.getTableRows(this.data)}
            </div>
        `;
    }
    getTableRows(data = []) {
        return `
          ${data.map(item => {
            return `
                  <a href="/products/${item.id}" class="sortable-table__row">
                      ${this.getTableRow(item)}
                  </a>
              `;
        }).join('')
        }
        `;
    }
    getTableRow(item) {
        return this.headersConfig.map((config) => {
            if (config.template) {
                return config.template(item[config.id]);
            }
            return `<div class="sortable-table__cell">${item[config.id]}</div>`;
        }).join('');
    }
    getTemplate() {
        return `
            <div data-element="productsContainer" class="products-list__container">
                <div class="sortable-table">
                    ${this.getColumnHeaders()}
                    ${this.getTableBody()}
                </div>
            </div>
        `;
    }
    getSubElements(element) {
        const result = {};
        const elements = element.querySelectorAll('[data-element]');

        for (const subElement of elements) {
            const name = subElement.dataset.element;

            result[name] = subElement;
        }

        return result;
    }
    updateChanges(sortedData, field, order) {
        const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
        const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id=${field}]`);
        // NOTE: Remove sorting arrow from other columns
        allColumns.forEach(column => {
            column.dataset.order = '';
        });

        currentColumn.dataset.order = order;

        this.subElements.body.innerHTML = this.getTableRows(sortedData);
    }
    sortOnClient(field, order) {
        const sortedData = this.sortData(field, order);
        this.updateChanges(sortedData, field, order);
    }
    async sortOnServer(field, order) {
        const sortedData = await this.fetchData(field, order);
        this.updateChanges(sortedData, field, order);
    }
    async fetchData(field, order) {
      try {
          return await fetchJson(`${BACKEND_URL}/${this.url}?${new URLSearchParams({_sort: this.sorted.id, _order: this.sorted.order}).toString()}`)
      } catch (e) {
          console.error(e);
      }
    }
    initListeners() {
        this.subElements.header.addEventListener('click', ({target: {parentElement}}) => {
            const isSortable = parentElement.getAttribute('data-sortable');
            if (isSortable === 'false') return;
            const fieldId = parentElement.getAttribute('data-id');
            if (isSortable && fieldId) {
                const order = this.sorted.order && this.sorted.order === 'asc' ? 'desc' : 'asc';
                if (this.sorted.id === fieldId) {
                    this.sort(fieldId, order);
                    this.sorted = {
                        id: fieldId,
                        order: order
                    };
                } else {
                    this.sort(fieldId, 'asc');
                    this.sorted = {
                        id: fieldId,
                        order: 'asc'
                    };
                }
            }
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
        this.subElements = this.getSubElements(wrapper);
        if (this.sorted) {
            this.sort(this.sorted.id, this.sorted.order);
        }
    }

    sort(field, order) {
        if (this.isSortLocally) {
            this.sortOnClient(field, order);
        } else {
            this.sortOnServer(field, order);
        }
    }
    sortData(field, order) {
        const arr = [...this.data];
        const column = this.headersConfig.find(item => item.id === field);
        const { sortType } = column;
        const directions = {
            asc: 1,
            desc: -1
        };
        const direction = directions[order];

        return arr.sort((a, b) => {
            switch (sortType) {
                case 'number':
                    return direction * (a[field] - b[field]);
                case 'string':
                    return direction * a[field].localeCompare(b[field], ['ru', 'en']);
                default:
                    throw new Error(`Unknown type ${sortType}`);
            }
        });
    }
}
