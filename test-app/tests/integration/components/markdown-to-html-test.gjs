import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { hash } from '@ember/helper';
import { find, render } from '@ember/test-helpers';

import showdown from 'showdown';

import MarkdownToHtml from 'test-app/components/markdown-to-html';

module('Integration | Component | markdown to html', function (hooks) {
  setupRenderingTest(hooks);

  test('renders @markdown as markdown', async function (assert) {
    await render(
      <template>
        <div id="rendered">
          <MarkdownToHtml @markdown="##Hello, [world](#)" />
        </div>
      </template>,
    );

    let expectedHtml = '<h2 id="helloworld">Hello, <a href="#">world</a></h2>';
    assert.strictEqual(find('#rendered').innerHTML.trim(), expectedHtml);
  });

  test('it inserts <br> tag', async function (assert) {
    const markdown = 'foo  \nbar';
    await render(
      <template>
        <div id="rendered">
          <MarkdownToHtml @markdown={{markdown}} />
        </div>
      </template>,
    );

    let expectedHtmlRegex = /<p>foo ?<br( \/)?>\nbar<\/p>/;
    let actualHtml = find('#rendered').innerHTML.trim();
    assert.ok(expectedHtmlRegex.test(actualHtml));
  });

  test('supports setting showdown options', async function (assert) {
    const markdown = '# title\nI ~~dislike~~ enjoy visiting http://www.google.com';
    await render(
      <template>
        <div id="rendered">
          <MarkdownToHtml
            @markdown={{markdown}}
            @showdownOptions={{hash simplifiedAutoLink=true headerLevelStart=3 strikethrough=true}}
          />
        </div>
      </template>,
    );

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

    const markdown = '# title\nI ~~dislike~~ enjoy visiting http://www.google.com';
    await render(
      <template>
        <div id="rendered">
          <MarkdownToHtml @markdown={{markdown}} @showdownOptions={{hash headerLevelStart=3 strikethrough=true}} />
        </div>
      </template>,
    );

    let expectedHtml =
      '<h3 id="title">title</h3>\n<p>I <del>dislike</del> enjoy visiting <a href="http://www.google.com">http://www.google.com</a></p>';

    assert.strictEqual(find('#rendered').innerHTML.trim(), expectedHtml);
  });

  test('does not reset default showdown options with undefined', async function (assert) {
    let originalStrikeThroughValue = showdown.getOption('strikethrough');
    showdown.setOption('strikethrough', true);

    const markdown = '~~dislike~~';
    await render(
      <template>
        <div id="rendered">
          <MarkdownToHtml @markdown={{markdown}} />
        </div>
      </template>,
    );

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

    await render(
      <template>
        <div id="rendered">
          <MarkdownToHtml @markdown="this is a showdown" @extensions="demo excited" />
        </div>
      </template>,
    );

    let expectedHtml = '<p>this is an ember showdown!</p>';
    assert.strictEqual(find('#rendered').innerHTML.trim(), expectedHtml);
  });

  test('it does not munge code fences', async function (assert) {
    const markdown = '```html\n<strong>hello</strong>\n<em>world</em>\n```';
    await render(
      <template>
        <div id="rendered">
          <MarkdownToHtml @markdown={{markdown}} @showdownOptions={{hash ghCodeBlocks=true}} />
        </div>
      </template>,
    );

    let expectedHtml =
      '<pre><code class="html language-html">&lt;strong&gt;hello&lt;/strong&gt;\n&lt;em&gt;world&lt;/em&gt;\n</code></pre>';
    assert.strictEqual(find('#rendered').innerHTML.trim(), expectedHtml);
  });
});
