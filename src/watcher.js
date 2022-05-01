import first from 'lodash/first.js';
import isEmpty from 'lodash/isEmpty.js';
import onChange from 'on-change';

export default (state, elements) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.isValid': {
      const { urlInput } = elements;
      if (value) {
        urlInput.value = '';
        urlInput.focus();
        urlInput.classList.remove('is-invalid');
        break;
      }
      urlInput.classList.add('is-invalid');
      break;
    }

    case 'form.errors': {
      const { feedback } = elements;
      feedback.textContent = isEmpty(value) ? '' : first(value);
      break;
    }

    default:
      break;
  }
});
