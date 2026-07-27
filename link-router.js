'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const managedLinks = new WeakSet();
  let navigationTimer = 0;

  function revealPage() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => root.classList.remove('page-enter', 'page-leaving', 'page-leaving-back'));
    });
  }

  function navigateInCurrentTab(link, destination) {
    const direction = link.dataset.pageTransition;
    if (!direction || reducedMotion) {
      window.location.assign(destination);
      return;
    }

    if (root.classList.contains('page-leaving')) return;
    root.classList.add('page-leaving');
    root.classList.toggle('page-leaving-back', direction === 'back');
    window.clearTimeout(navigationTimer);
    navigationTimer = window.setTimeout(() => window.location.assign(destination), 250);
  }

  function openDestination(link, event) {
    const destination = link.dataset.destination;
    if (!destination) return;

    if (destination.startsWith('#')) {
      const targetId = decodeURIComponent(destination.slice(1));
      const target = document.getElementById(targetId);
      if (!target) return;

      target.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
      history.replaceState(null, '', destination);
      return;
    }

    const openInNewTab = link.target === '_blank'
      || event.ctrlKey
      || event.metaKey
      || event.shiftKey
      || event.button === 1;

    if (openInNewTab) {
      const openedWindow = window.open(
        new URL(destination, document.baseURI).href,
        '_blank',
        'noopener,noreferrer'
      );
      if (openedWindow) openedWindow.opener = null;
      return;
    }

    navigateInCurrentTab(link, destination);
  }

  function prepareLink(link) {
    if (managedLinks.has(link)) return;
    const destination = link.getAttribute('href');
    if (!destination) return;

    managedLinks.add(link);
    link.dataset.destination = destination;
    link.removeAttribute('href');
    link.setAttribute('role', 'link');
    if (!link.hasAttribute('tabindex')) link.tabIndex = 0;

    link.addEventListener('click', (event) => {
      if (event.defaultPrevented) return;
      event.preventDefault();
      openDestination(link, event);
    });
    link.addEventListener('auxclick', (event) => {
      if (event.button !== 1) return;
      event.preventDefault();
      openDestination(link, event);
    });
    link.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      link.click();
    });
  }

  function prepareLinksInside(node) {
    if (!(node instanceof Element)) return;
    if (node.matches('a[href]')) prepareLink(node);
    node.querySelectorAll('a[href]').forEach(prepareLink);
  }

  document.querySelectorAll('a[href]').forEach(prepareLink);

  const linkObserver = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach(prepareLinksInside);
    });
  });
  linkObserver.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('pageshow', revealPage);
  revealPage();
});
