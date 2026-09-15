document.addEventListener('click', (event) => {
  const link = event.target.closest?.('[data-igienair-map]');
  if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const url = new URL(link.href);
  if (url.origin !== 'https://www.google.com' || url.pathname !== '/maps') return;
  event.preventDefault();
  url.searchParams.set('output', 'embed');
  const frame = document.createElement('iframe');
  frame.src = url.href;
  frame.title = 'IGIENAIR GmbH Hauptsitz in Ettlingen auf Google Maps';
  frame.referrerPolicy = 'no-referrer';
  frame.allowFullscreen = true;
  link.replaceWith(frame);
  frame.focus();
});
