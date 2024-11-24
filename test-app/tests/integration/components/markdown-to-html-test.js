import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import showdown from 'showdown';

module('Integration | Component | markdown to html', function (hooks) {
  setupRenderingTest(hooks);

  test('renders @markdown as markdown', async function (assert) {
    await render(hbs`
      <div id="rendered">
        <MarkdownToHtml @markdown="##Hello, [world](#)" />
      </div>
    `);

    let expectedHtml = '<h2 id="helloworld">Hello, <a href="#">world</a></h2>';
    assert.strictEqual(find('#rendered').innerHTML.trim(), expectedHtml);
  });

  test('it inserts <br> tag', async function (assert) {
    this.markdown = 'foo  \nbar';
    await render(hbs`
      <div id="rendered">
        <MarkdownToHtml
          @markdown={{this.markdown}}
        />
      </div>
    `);

    let expectedHtmlRegex = /<p>foo ?<br( \/)?>\nbar<\/p>/;
    let actualHtml = find('#rendered').innerHTML.trim();
    assert.ok(expectedHtmlRegex.test(actualHtml));
  });

  test('supports setting showdown options', async function (assert) {
    await render(hbs`
      <div id="rendered">
        <MarkdownToHtml
          @markdown="# title\nI ~~dislike~~ enjoy visiting http://www.google.com"
          @showdownOptions={{hash
            simplifiedAutoLink=true
            headerLevelStart=3
            strikethrough=true
          }}
        />
      </div>
    `);

    let expectedHtml =
      '<h3 id="title">title</h3>\n<p>I <del>dislike</del> enjoy visiting <a href="http://www.google.com">http://www.google.com</a></p>';

    assert.strictEqual(find('#rendered').innerHTML.trim(), expectedHtml);
  });

  test('supports setting showdown options merged with global options', async function (assert) {
    this.owner.register('config:environment', {
      showdown: {
        simplifiedAutoLink: true,
      },
    });

    await render(hbs`
      <div id="rendered">
        <MarkdownToHtml
          @markdown="# title\nI ~~dislike~~ enjoy visiting http://www.google.com"
          @showdownOptions={{hash
            headerLevelStart=3
            strikethrough=true
          }}
        />
      </div>
    `);

    let expectedHtml =
      '<h3 id="title">title</h3>\n<p>I <del>dislike</del> enjoy visiting <a href="http://www.google.com">http://www.google.com</a></p>';

    assert.strictEqual(find('#rendered').innerHTML.trim(), expectedHtml);
  });

  test('does not reset default showdown options with undefined', async function (assert) {
    let originalStrikeThroughValue = showdown.getOption('strikethrough');
    showdown.setOption('strikethrough', true);

    await render(hbs`
      <div id="rendered">
        <MarkdownToHtml @markdown="~~dislike~~" />
      </div>
    `);

    let expectedHtml = '<p><del>dislike</del></p>';
    assert.strictEqual(find('#rendered').innerHTML.trim(), expectedHtml);

    showdown.setOption('strikethrough', originalStrikeThroughValue);
  });

  test('it supports loading showdown extensions', async function (assert) {
    showdown.extension('demo', function () {
      return [
        {
          type: 'lang',
          regex: /\sa\s/,
          replace() {
            return ' an ember ';
          },
        },
      ];
    });

    showdown.extension('excited', function () {
      return [
        {
          type: 'lang',
          regex: /showdown/,
          replace() {
            return 'showdown!';
          },
        },
      ];
    });

    await render(hbs`
      <div id="rendered">
        <MarkdownToHtml
          @markdown="this is a showdown"
          @extensions="demo excited"
        />
      </div>
    `);

    let expectedHtml = '<p>this is an ember showdown!</p>';
    assert.strictEqual(find('#rendered').innerHTML.trim(), expectedHtml);
  });

  test('it does not munge code fences', async function (assert) {
    this.markdown = '```html\n<strong>hello</strong>\n<em>world</em>\n```';
    await render(hbs`
      <div id="rendered">
        <MarkdownToHtml
          @markdown={{this.markdown}}
          @showdownOptions={{hash ghCodeBlocks=true}}
        />
      </div>
    `);

    let expectedHtml =
      '<pre><code class="html language-html">&lt;strong&gt;hello&lt;/strong&gt;\n&lt;em&gt;world&lt;/em&gt;\n</code></pre>';
    assert.strictEqual(find('#rendered').innerHTML.trim(), expectedHtml);
  });
});
