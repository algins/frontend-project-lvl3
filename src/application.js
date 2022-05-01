import isEmpty from 'lodash/isEmpty.js';
import * as yup from 'yup';
import watch from './watcher.js';

const validateUrl = (url, urls) => {
  const schema = yup
    .string()
    .required()
    .url()
    .notOneOf(urls)
    .label('RSS feed URL');
  try {
    schema.validateSync(url);
    return [];
  } catch ({ errors }) {
    return errors;
  }
};

export default () => {
  const state = {
    form: {
      IsValid: true,
      errors: [],
    },
    urls: [],
  };

  const elements = {
    feedback: document.querySelector('.feedback'),
    form: document.querySelector('form'),
    urlInput: document.getElementById('url-input'),
  };

  const watchedState = watch(state, elements);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const { urls } = watchedState;
    const errors = validateUrl(url, urls);
    const isValid = isEmpty(errors);

    watchedState.form.isValid = isValid;
    watchedState.form.errors = errors;
    watchedState.urls = isValid ? [...urls, url] : urls;
  });
};
