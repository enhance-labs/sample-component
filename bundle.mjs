(function (exports, CustomElement) {
  'use strict';

  class SampleComponent extends CustomElement {
    constructor() {
      super();
      this.heading = '';
      this.header = this.querySelector('h1');
    }

    render({ html, state  }) {
      console.log('client render got called');
      const { attrs={} } = state;
      const { heading='default' } = attrs;
      return html`
      <style>
        :host {
          color: red;
        }
        p, div {
          color: purple;
        }
        @media screen and (min-width: 48em) {
          p {
            color: orange;
          }
        }
      </style>
      <h1>${heading}</h1>
      <p>Inner Text</p>
    `
    }

    static get observedAttributes() {
      return [ 'heading' ]
    }

    headingChanged(value) {
      this.header.textContent = value;
    }
  }

  const render = SampleComponent.prototype.render;

  customElements.define('sample-component', SampleComponent);

  exports.default = SampleComponent;
  exports.render = render;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({}, CustomElement);
