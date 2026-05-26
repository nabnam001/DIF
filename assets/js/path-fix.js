/* GitHub Pages preview compatibility — rewrites absolute paths to /DIF/ prefix
   when the site is served from a subpath. Harmless on production root deploys. */
(function () {
  "use strict";
  var path = location.pathname;
  // Detect /DIF/ or any other subpath that ends in /
  var match = path.match(/^(\/[^\/]+\/)/);
  if (!match) return;
  var prefix = match[1];
  // Only rewrite if the site is at a subpath, not the root
  if (prefix === "/" || prefix === "/en/") return;
  // Special case: already-stripped paths like /DIF/en/foo.html
  // The prefix is the first segment, e.g. /DIF/

  // Inject a <base> so all relative URLs resolve under the prefix
  var existing = document.querySelector("base");
  if (existing) return;
  var base = document.createElement("base");
  base.href = prefix;
  document.head.insertBefore(base, document.head.firstChild);

  // Rewrite absolute /-prefixed links that aren't already prefixed
  function rewrite() {
    var attrs = [["a", "href"], ["link", "href"], ["script", "src"], ["img", "src"], ["video", "src"], ["source", "src"], ["form", "action"]];
    attrs.forEach(function (pair) {
      var els = document.querySelectorAll(pair[0]);
      els.forEach(function (el) {
        var v = el.getAttribute(pair[1]);
        if (!v) return;
        // Only absolute root-paths starting with / and not //
        if (v.charAt(0) === "/" && v.charAt(1) !== "/" && v.indexOf(prefix) !== 0) {
          el.setAttribute(pair[1], prefix.replace(/\/$/, "") + v);
        }
      });
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", rewrite);
  } else {
    rewrite();
  }
})();
