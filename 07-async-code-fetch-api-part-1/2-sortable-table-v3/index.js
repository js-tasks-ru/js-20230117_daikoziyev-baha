import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
    loading = false;
    step = 20;
    start = 1;
    end = this.start + this.step;

    onWindowScroll = async () => {
        const {bottom} = this.element.getBoundingClientRect();
        const {id, order} = this.sorted;
        if ((bottom - 100) < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
            this.start = this.end;
            this.end = this.start + this.step;
            this.loading = true;
            const data = await this.loadData(id, order, this.start, this.end);
            this.update(data);
            this.loading = false;
        }
    }
    onSortClick = (event) => {
        const column = event.target.closest('[data-sortable="true"]');
        const toggleOrder = order => {
            const orders = {
                asc: 'desc',
                desc: 'asc'
            };
            return orders[order];
        };
        if (column) {
            const {id, order} = column.dataset;
            const newOrder = toggleOrder(order);
            this.sorted = {
                id, order: newOrder
            };
            column.dataset.order = newOrder;
            column.append(this.subElements.arrow);
            this.sort(id, newOrder);
        }

    }
  constructor(headersConfig, {
      url = '',
      data = [],
      sorted = {
          id: headersConfig.find(item => item.sortable).id,
          order: 'asc'
      },
      isSortLocally = false,
      step = 20,
      start = 1,
      end = this.start + this.step
  } = {}) {
    this.headersConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.data = data;
    this.sorted = sorted;
    this.step = step;
    this.start = start;
    this.render();
  }
    async render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTemplate();
        this.element = wrapper.firstElementChild;
        this.subElements = this.getSubElements(wrapper);
        const {id, order} = this.sorted;
        const data = await this.loadData(id, order, this.start, this.end);

        this.renderRows(data);
        this.initListeners();

    }
    getColumnHeaders() {
        return `
            <div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.getHeaderCells().join('')}
            </div>
        `;
    }
    getHeaderSortingArrow(id) {
        const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

        return isOrderExist
            ? `<span data-element="arrow" class="sortable-table__sort-arrow">
                  <span class="sort-arrow"></span>
               </span>`
            : '';
    }
    getHeaderCells() {
        return this.headersConfig.map(item => {
            const order = this.sorted.id === item.id ? this.sorted.order : 'asc';
            return `
                <div class="sortable-table__cell" data-id=${item.id} data-sortable=${item.sortable} data-order=${order}>
                   <span>${item.title}</span>
                   ${this.getHeaderSortingArrow(item.id)}
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
    addRows(data) {
      this.data = data;
      this.subElements.body.innerHTML = this.getTableRows(data);
    }
    renderRows(data) {
      if (data.length) {
          this.element.classList.remove('sortable-table_empty');
          this.addRows(data);
      } else {
          this.element.classList.add('sortable-table_empty');
      }
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
            <div class="sortable-table">
                ${this.getColumnHeaders()}
                ${this.getTableBody()}
                <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
                <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                  No products
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

    sortOnClient(field, order) {
        const sortedData = this.sortData(field, order);
        this.subElements.body.innerHTML = this.getTableRows(sortedData);
    }
    async sortOnServer(field, order) {
        const start = 1;
        const end = start + this.step;
        const sortedData = await this.loadData(field, order, start, end);
        this.subElements.body.innerHTML = this.getTableRows(sortedData);
    }
    async fetchData(url) {
      try {
          return await fetchJson(url);
      } catch (e) {
          console.error(e);
      }
    }
    async update(data) {
        const rows = document.createElement('div');
        rows.innerHTML = this.getTableRows(data);
        this.subElements.body.append(...rows.childNodes);
    }
    async loadData(field, order, start, end) {
      this.setSearchParams(field, order, start, end);
      this.element.classList.add('sortable-table_loading');

      const data = await this.fetchData(this.url);
      this.element.classList.remove('sortable-table_loading');

      return data;
    }
    setSearchParams(field, order, start = this.start, end = this.end) {
        this.url.searchParams.set('_sort', field);
        this.url.searchParams.set('_order', order);
        this.url.searchParams.set('_start', start);
        this.url.searchParams.set('_end', end);
    }
    initListeners() {
        window.addEventListener('scroll', this.onWindowScroll);
        this.subElements.header.addEventListener('click', this.onSortClick);
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
        window.removeEventListener('scroll', this.onWindowScroll);
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
