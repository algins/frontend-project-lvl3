import onChange from 'on-change';

const handleProcessState = (elements, processState) => {
  const { feedback, submitButton, urlInput } = elements;

  switch (processState) {
    case 'loaded': {
      feedback.classList.add('text-success');
      urlInput.value = '';
      urlInput.focus();
      submitButton.disabled = false;
      break;
    }

    case 'loading': {
      submitButton.disabled = true;
      break;
    }

    case 'error': {
      feedback.classList.add('text-danger');
      submitButton.disabled = false;
      break;
    }

    default: {
      throw new Error(`Unknown process state: ${processState}`);
    }
  }
};

const handleValidationState = (elements, validationState) => {
  const { feedback, urlInput } = elements;

  switch (validationState) {
    case 'valid': {
      feedback.classList.remove('text-danger');
      urlInput.classList.remove('is-invalid');
      break;
    }

    case 'invalid': {
      feedback.classList.add('text-danger');
      urlInput.classList.add('is-invalid');
      break;
    }

    default: {
      throw new Error(`Unknown validation state: ${validationState}`);
    }
  }
};

const renderFeedback = (elements, error) => {
  const { feedback } = elements;
  feedback.textContent = error;
};

const renderFeeds = (elements, feeds) => {
  const { feedsContainer } = elements;
  const ul = feedsContainer.querySelector('ul');
  ul.innerHTML = '';
  const h2 = feedsContainer.querySelector('h2');
  h2.classList.toggle('d-none', feeds.length === 0);

  feeds.forEach(({ title, description }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    ul.append(li);

    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = title;
    li.append(h3);

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = description;
    li.append(p);
  });
};

const renderPosts = (elements, newPosts, watchedState, t) => {
  const { postsContainer } = elements;
  const ul = postsContainer.querySelector('ul');
  const h2 = postsContainer.querySelector('h2');
  h2.classList.remove('d-none');

  newPosts.reverse().forEach((post) => {
    const { id, title, url } = post;
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0');
    ul.prepend(li);

    const a = document.createElement('a');
    a.classList.add('fw-bold');
    a.dataset.postId = id;
    a.textContent = title;
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    a.addEventListener('click', (e) => e.target.classList.replace('fw-bold', 'fw-normal'));

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = t('preview');
    button.addEventListener('click', () => {
      watchedState.previewPost = post;
    });

    li.append(a, button);
  });
};

const renderModal = (elements, previewPost) => {
  const { modalTitle, modalBody, readMoreButton } = elements;
  modalTitle.textContent = previewPost.title;
  modalBody.textContent = previewPost.description;
  readMoreButton.href = previewPost.url;
  document.querySelector(`[data-post-id="${previewPost.id}"]`).classList.replace('fw-bold', 'fw-normal');
};

export default (state, elements, t) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.processState':
        handleProcessState(elements, value);
        break;

      case 'form.processMessage':
        renderFeedback(elements, value);
        break;

      case 'form.validationState': {
        handleValidationState(elements, value);
        break;
      }

      case 'form.validationError': {
        renderFeedback(elements, value);
        break;
      }

      case 'feeds': {
        renderFeeds(elements, value);
        break;
      }

      case 'newPosts': {
        renderPosts(elements, value, watchedState, t);
        break;
      }

      case 'previewPost': {
        renderModal(elements, value);
        break;
      }

      default: {
        break;
      }
    }
  });

  return watchedState;
};
