import differenceWith from 'lodash/differenceWith.js';
import isEqual from 'lodash/isEqual.js';
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
  const feedsList = feedsContainer.querySelector('ul');
  feedsList.innerHTML = '';
  const feedsListHeading = feedsContainer.querySelector('h2');
  feedsListHeading.classList.toggle('d-none', feeds.length === 0);

  const feedsListItems = feeds.map(({ title, description }) => {
    const feedsListItem = document.createElement('li');
    feedsListItem.classList.add('list-group-item', 'border-0', 'border-end-0');

    const feedTitle = document.createElement('h3');
    feedTitle.classList.add('h6', 'm-0');
    feedTitle.textContent = title;
    feedsListItem.append(feedTitle);

    const feedDescription = document.createElement('p');
    feedDescription.classList.add('m-0', 'small', 'text-black-50');
    feedDescription.textContent = description;
    feedsListItem.append(feedDescription);

    return feedsListItem;
  });

  feedsList.append(...feedsListItems);
};

const renderPosts = (elements, newPosts, watchedState, t) => {
  const { postsContainer } = elements;
  const postsList = postsContainer.querySelector('ul');
  const postsListHeading = postsContainer.querySelector('h2');
  postsListHeading.classList.remove('d-none');

  const postsListItems = newPosts.map((post) => {
    const { id, title, url } = post;
    const postsListItem = document.createElement('li');
    postsListItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0');

    const postLink = document.createElement('a');
    postLink.classList.add('fw-bold');
    postLink.dataset.postId = id;
    postLink.textContent = title;
    postLink.setAttribute('href', url);
    postLink.setAttribute('target', '_blank');
    postLink.addEventListener('click', (e) => e.target.classList.replace('fw-bold', 'fw-normal'));

    const postPreviewButton = document.createElement('button');
    postPreviewButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    postPreviewButton.dataset.bsToggle = 'modal';
    postPreviewButton.dataset.bsTarget = '#modal';
    postPreviewButton.textContent = t('preview');
    postPreviewButton.addEventListener('click', () => {
      watchedState.previewPost = post;
    });

    postsListItem.append(postLink, postPreviewButton);

    return postsListItem;
  });

  postsList.prepend(...postsListItems);
};

const renderModal = (elements, previewPost) => {
  const { modalTitle, modalBody, readMoreButton } = elements;
  modalTitle.textContent = previewPost.title;
  modalBody.textContent = previewPost.description;
  readMoreButton.href = previewPost.url;
  document.querySelector(`[data-post-id="${previewPost.id}"]`).classList.replace('fw-bold', 'fw-normal');
};

export default (state, elements, t) => {
  const watchedState = onChange(state, (path, value, previousValue) => {
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

      case 'posts': {
        const newPosts = differenceWith(value, previousValue, isEqual);
        renderPosts(elements, newPosts, watchedState, t);
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
