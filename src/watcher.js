import onChange from 'on-change';

const handleProcessState = (elements, processState) => {
  const { submitButton } = elements;

  switch (processState) {
    case 'filling': {
      submitButton.disabled = false;
      break;
    }

    case 'loading': {
      submitButton.disabled = true;
      break;
    }

    case 'error': {
      submitButton.disabled = false;
      break;
    }

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const renderUrlInput = (elements, isValid) => {
  const { urlInput } = elements;
  if (isValid) {
    urlInput.value = '';
    urlInput.focus();
    urlInput.classList.remove('is-invalid');
  } else {
    urlInput.classList.add('is-invalid');
  }
};

const renderFeedback = (elements, error) => {
  const { feedback } = elements;
  feedback.textContent = error;
};

const renderFeeds = (elements, feeds) => {
  const { feedsContainer } = elements;
  const ul = feedsContainer.querySelector('ul');
  const h2 = feedsContainer.querySelector('h2');
  h2.classList.toggle('d-none');

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

const renderPosts = (elements, posts) => {
  const { postsContainer } = elements;
  const ul = postsContainer.querySelector('ul');
  const h2 = postsContainer.querySelector('h2');
  h2.classList.toggle('d-none');

  posts.forEach(({ title, link }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0');
    ul.append(li);

    const a = document.createElement('a');
    a.classList.add('fw-bold');
    a.textContent = title;
    a.setAttribute('href', link);
    a.setAttribute('target', '_blank');
    li.append(a);
  });
};

const render = (elements) => (path, value) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, value);
      break;

    case 'form.processError':
      renderFeedback(elements, value);
      break;

    case 'form.isValid': {
      renderUrlInput(elements, value);
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
      renderPosts(elements, value);
      break;
    }

    default:
      break;
  }
};

export default (state, elements) => onChange(state, render(elements));
