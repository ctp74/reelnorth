(function () {
  // Provinces where Reel North does not link to casinos: both run their own regulated iGaming markets.
  var BLOCKED = {
    ON: { name: "Ontario", alt: "Ontario players should use operators registered with the AGCO and iGaming Ontario (look for the iGaming Ontario logo)." },
    AB: { name: "Alberta", alt: "Alberta players should use operators registered with AGLC, or PlayAlberta." }
  };
  // Legal gambling age by province/territory.
  var AGE = { BC: 19, AB: 18, SK: 19, MB: 18, ON: 19, QC: 18, NB: 19, NS: 19, PE: 19, NL: 19, YT: 19, NT: 19, NU: 19 };

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  var dlg = document.getElementById("gate");
  if (dlg) {
    var form = dlg.querySelector("form");
    var sel = dlg.querySelector("#gate-province");
    var chk = dlg.querySelector("#gate-age");
    var ageTxt = dlg.querySelector("#gate-age-text");
    var msg = dlg.querySelector(".msg");
    var go = dlg.querySelector("#gate-go");
    var target = null;

    var saved = store("rn-province");
    if (saved && AGE[saved]) sel.value = saved;

    function refresh() {
      var p = sel.value;
      ageTxt.textContent = p ? "I am " + AGE[p] + " or older, the legal gambling age in my province." : "I am of legal gambling age in my province (18 or 19).";
      if (BLOCKED[p]) {
        msg.hidden = false;
        msg.textContent = "We don't link to these casinos for players in " + BLOCKED[p].name + ". " + BLOCKED[p].alt;
        go.disabled = true;
      } else {
        msg.hidden = true;
        go.disabled = !(p && chk.checked);
      }
    }
    sel.addEventListener("change", refresh);
    chk.addEventListener("change", refresh);

    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[data-go]");
      if (!a) return;
      e.preventDefault();
      target = a.getAttribute("href");
      dlg.querySelector("#gate-casino").textContent = a.getAttribute("data-name") || "this casino";
      chk.checked = false;
      refresh();
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    });
    dlg.querySelector("#gate-cancel").addEventListener("click", function () { dlg.close(); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (go.disabled || !target) return;
      store("rn-province", sel.value);
      dlg.close();
      var page = (location.pathname.split("/").pop() || "index").replace(/\.html$/, "").replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "index";
      var dest = target.indexOf("/go/") === 0 ? target + "?sub=" + encodeURIComponent(page) : target;
      var w = window.open(dest, "_blank", "noopener");
      if (!w) window.location.href = dest;
    });
  }

  // Wagering calculator
  var calc = document.getElementById("wager-calc");
  if (calc) {
    var f = function (id) { return calc.querySelector("#" + id); };
    var money = function (n) { return "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
    function run() {
      var dep = +f("c-dep").value || 0, pct = +f("c-pct").value || 0, mult = +f("c-mult").value || 0;
      var base = f("c-base").value, contrib = (+f("c-contrib").value || 100) / 100, rtp = (+f("c-rtp").value || 96) / 100;
      var bonus = dep * pct / 100;
      var wagerOn = base === "both" ? dep + bonus : bonus;
      var turnover = wagerOn * mult / (contrib || 1);
      var cost = turnover * (1 - rtp);
      f("o-bonus").textContent = money(bonus);
      f("o-turn").textContent = money(turnover);
      f("o-cost").textContent = money(cost);
      f("o-net").textContent = money(bonus - cost);
      f("o-net").style.color = bonus - cost >= 0 ? "var(--good)" : "var(--warn)";
    }
    calc.addEventListener("input", run);
    run();
  }
})();
