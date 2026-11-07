/* Click-through for cards and buttons that carry data-href. */
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-href]');
  if (!el || e.defaultPrevented) return;
  var a = e.target.closest('a[href]');
  if (a && a !== el) return;            // let inner real links win
  e.preventDefault();
  location.href = el.getAttribute('data-href');
});
document.querySelectorAll('[data-href]').forEach(function (el) { el.style.cursor = 'pointer'; });
