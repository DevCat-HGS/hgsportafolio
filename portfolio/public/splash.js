// Welcome screen: picks the language from the URL and splits the greeting into letters.
// Kept as an external file (not inline) so the Content-Security-Policy can forbid inline scripts.
(function () {
  // /en/ is English; everything else is Spanish. The app reads the same rule, so both always agree.
  var es = !/^\/en(\/|$)/.test(location.pathname);
  var hello = es ? "Bienvenido" : "Welcome";
  document.getElementById("splash-sub").textContent = es ? "Cargando…" : "Loading…";

  // Cada letra entra por separado, desde una máscara.
  var el = document.getElementById("splash-hello");
  el.setAttribute("aria-label", hello);
  el.textContent = "";
  hello.split("").forEach(function (ch, i) {
    var l = document.createElement("span");
    l.className = "l";
    l.setAttribute("aria-hidden", "true");
    l.style.setProperty("--i", i);
    l.textContent = ch;
    el.appendChild(l);
  });

  // Red de seguridad: si el JS falla, la bienvenida nunca bloquea la página.
  setTimeout(function () {
    var s = document.getElementById("splash");
    if (s) s.className = "hide";
    document.documentElement.classList.remove("is-loading");
  }, 8000);
})();
