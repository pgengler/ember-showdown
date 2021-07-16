import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | markdown to html', function (hooks) {
  setupRenderingTest(hooks);

  test('renders @markdown as markdown', async function (assert) {
    assert.expect(1);

    await render(hbs`
      <div id="rendered">
        <MarkdownToHtml @markdown="*hello world*" />
      </div>
    `);
    assert.dom('#rendered p em').hasText('hello world');
  });
});
