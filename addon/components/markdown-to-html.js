import Component from '@glimmer/component';
import showdown from 'showdown';
import { htmlSafe } from '@ember/string';
import { getOwner } from '@ember/application';

const CONFIG_LOOKUP = 'config:environment';

export default class MarkdownToHtmlComponent extends Component {
  globalOptions = null;

  constructor() {
    super(...arguments);

    this.defaultOptionKeys = Object.keys(showdown.getDefaultOptions());

    const owner = getOwner(this);

    if (owner && owner.hasRegistration(CONFIG_LOOKUP)) {
      this.globalOptions = (
        owner.resolveRegistration(CONFIG_LOOKUP) || {}
      ).showdown;
    }
  }

  get html() {
    let showdownOptions = this.getShowdownProperties(this.defaultOptionKeys);
    let converter = this.converter;

    for (let option in showdownOptions) {
      if (
        Object.prototype.hasOwnProperty.call(showdownOptions, option) &&
        typeof showdownOptions[option] !== 'undefined'
      ) {
        converter.setOption(option, showdownOptions[option]);
      }
    }

    return htmlSafe(converter.makeHtml(this.args.markdown));
  }

  get converter() {
    let extensions = this.args.extensions ?? [];

    if (typeof extensions === 'string') {
      extensions = extensions.split(' ');
    }

    return new showdown.Converter({ extensions });
  }

  getShowdownProperties(keyNames) {
    return keyNames.reduce((accumulator, keyName) => {
      let value = (this.args.showdownOptions ?? {})[keyName];

      if (value === undefined && this.globalOptions) {
        value = this.globalOptions[keyName];
      }

      accumulator[keyName] = value;

      return accumulator;
    }, {});
  }
}
