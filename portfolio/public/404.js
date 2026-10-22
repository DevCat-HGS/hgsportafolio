// Picks the language of the 404 page: English under /en/ or for English browsers, Spanish otherwise.
// External file so the Content-Security-Policy can forbid inline scripts.
(function () {
  var english = /^\/en(\/|$)/.test(location.pathname) || /^en/i.test(navigator.language || "");
  if (!english) return;
  document.documentElement.dataset.l = "en";
  document.documentElement.lang = "en";
  document.title = "404 — Station not found";
})();
