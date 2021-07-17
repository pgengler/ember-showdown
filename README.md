# ember-showdown

This addon provides a component that transforms [Markdown](http://en.wikipedia.org/wiki/Markdown) into valid HTML.

It is a fork of [ember-cli-showdown](https://github.com/gcollazo/ember-cli-showdown), updated to work with newer versions of Ember.

* Fastboot compatible

## Requirements

* ember-cli >= 3.27.0 (it may work with older versions but this hasn't been tested)

## Usage
From within your Ember application, run the following:

- `ember install ember-showdown`

Passing a markdown string inline:

```handlebars
<MarkdownToHtml @markdown="#Markdown is cool [link](http://emberjs.com)" />
```

```html
<!-- Output -->
<h1>Markdown is cool <a href="http://emberjs.com">link</a></h1>
```

You can also pass a bound value:

```handlebars
<MarkdownToHtml @markdown={{@postContent}} />
```

### Showdown Options

You can use [configuration settings from Showdown][showdown-config] via the `@showdownOptions` argument:

```handlebars
<MarkdownToHtml
  @markdown={{@postContent}}
  @showdownOptions={{hash
    strikethrough=true
    literalMidWordUnderscores=true
    simplifiedAutoLink=true
  }}
/>
```

[showdown-config]: https://github.com/showdownjs/showdown#valid-options

#### Global Showdown Options

Global options are supported as of 2.11.x.  This lets you define options that will be used
for showdown options that were not provided as an attribute.

An example where you always want to auto link:

```js
// config/environment.js
module.exports = function(environment) {
  let ENV = {
    showdown: {
      simplifiedAutoLink: true
    }
  }

  return ENV;
}
```

### Showdown Extensions

You can load [Showdown Extensions](https://github.com/showdownjs/showdown/wiki/extensions) by specifying the
"extensions" property when initializing your component:

```handlebars
<MarkdownToHtml
  @markdown={{@postContent}}
  @extensions={{this.myExtensionList}}
/>
```

```handlebars
<MarkdownToHtml
  @markdown={{@postContent}}
  @extensions="foo bar baz"
/>
```

(the extension list can be an array of strings or a space separated string)

Note that you'll have to register your extensions with Showdown first.
For example, in an initializer:

```js
// app/initializers/register-showdown-extensions.js
import showdown from 'showdown';

export function initialize() {
  showdown.extension('myExtensionName', function() {
    return [{
      type: 'html',
      regex: '<blockquote>',
      replace: '<blockquote class="blockquote">'
    }];
  });
}

export default {
  name: 'register-showdown-extensions',
  initialize
};
```

[showdown-extensions]: https://github.com/showdownjs/showdown/wiki/extensions

## Dependencies
* [Showdown](https://github.com/showdownjs/showdown)

## Development

* `git clone https://github.com/pgengler/ember-showdown.git`
* `cd ember-showdown`
* `yarn install`

## Previewing

* `ember serve`
* Visit your app at http://localhost:4200.

## Running tests

* `ember test`
* `ember test --server`

## Building

* `ember build`
