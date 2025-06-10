import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ApplicationController extends Controller {
  @tracked editableText;

  @action
  setInput(event) {
    const value = event.target.value;
    this.editableText = value;
  }
}
