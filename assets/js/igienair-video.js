/* No third-party request until the visitor explicitly chooses playback. */
document.addEventListener('click', (event) => {
  const link = event.target.closest?.('[data-igienair-video]');
  if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const id = link.dataset.igienairVideo;
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
  event.preventDefault();
  const frame = document.createElement('iframe');
  frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
  frame.title = link.getAttribute('aria-label') || 'YouTube video';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.className = 'igienair-video__frame';
  link.replaceWith(frame);
  frame.focus();
});
