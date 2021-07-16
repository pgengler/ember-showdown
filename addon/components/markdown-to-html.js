import { set } from '@ember/object';
import showdown from 'showdown';
import Component from '@ember/component';
import { htmlSafe } from '@ember/string';
import { get, computed } from '@ember/object';
import { getOwner } from '@ember/application';
import layout from '../templates/components/markdown-to-html';

const CONFIG_LOOKUP = 'config:environment';

const ShowdownComponent = Component.extend({
  layout,
  markdown: '',
  extensions: null,

  _globalOptions: null,

  defaultOptionKeys: computed(function () {
    return Object.keys(showdown.getDefaultOptions());
  }).readOnly(),

  init() {
    this._super(...arguments);
    const owner = getOwner(this);

    if (!this.extensions) {
      set(this, 'extensions', []);
    }

    if (owner && owner.hasRegistration(CONFIG_LOOKUP)) {
      this._globalOptions = (
        owner.resolveRegistration(CONFIG_LOOKUP) || {}
      ).showdown;
    }
  },

  html: computed('converter', 'defaultOptionKeys', 'markdown', function () {
    let showdownOptions = this.getShowdownProperties(this.defaultOptionKeys);
    let converter = this.converter;

    for (let option in showdownOptions) {
      if (
        showdownOptions.hasOwnProperty(option) &&
        typeof showdownOptions[option] !== 'undefined'
      ) {
        converter.setOption(option, showdownOptions[option]);
      }
    }

    return htmlSafe(converter.makeHtml(this.markdown));
  }).readOnly(),

  converter: computed('extensions', function () {
    let extensions = this.extensions;

    if (typeof extensions === 'string') {
      extensions = extensions.split(' ');
    }

    return new showdown.Converter({ extensions });
  }),

  getShowdownProperties(keyNames) {
    return keyNames.reduce((accumulator, keyName) => {
      let value = get(this, keyName);

      if (value === undefined && this._globalOptions) {
        value = get(this._globalOptions, keyName);
      }

      accumulator[keyName] = value;

      return accumulator;
    }, {});
  },
});

ShowdownComponent.reopenClass({
  positionalParams: ['markdown'],
});

export default ShowdownComponent;
