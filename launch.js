// 入口ページの動き。行き先の URL は、このページには書かず、ホーム画面に登録したリンクの「#to=」の中だけにある。
// 1) 登録用のリンク（?add#to=…）：ボタンを1つ出す
// 2) ボタンの後（同じサイトから来た）：「共有 → ホーム画面に追加」の案内を出す（自動では移らない）
// 3) ホーム画面から開いた（どこからも来ていない）：すぐに行き先へ移る
(function () {
  var T = window.TOOL || {};
  var ALLOW = ['script.google.com', 'claude.ai', 'docs.google.com', 'drive.google.com', 'khuhc-cmyk.github.io'];

  function target() {
    var m = (location.hash || '').match(/[#&]to=([^&]+)/);
    if (!m) return '';
    var u;
    try { u = new URL(decodeURIComponent(m[1])); } catch (e) { return ''; }
    if (u.protocol !== 'https:' || ALLOW.indexOf(u.hostname) < 0) return '';
    return u.href;
  }

  var to = target();
  var addMode = /(^|[?&])add($|[&=])/.test(location.search);
  var fromSetup = false;
  try {
    if (sessionStorage.getItem('hp-setup') === '1') { fromSetup = true; sessionStorage.removeItem('hp-setup'); }
  } catch (e) {}
  if (!fromSetup && document.referrer) {
    try { fromSetup = (new URL(document.referrer).origin === location.origin); } catch (e) {}
  }
  var mode = !to ? 'none' : (addMode ? 'step1' : (fromSetup ? 'step2' : 'go'));
  if (mode === 'go') { location.replace(to); }

  document.addEventListener('DOMContentLoaded', function () {
    var msg = document.getElementById('msg');
    var btns = document.getElementById('btns');
    function button(text, onClick, primary) {
      var b = document.createElement('button');
      b.textContent = text;
      if (primary) b.className = 'primary';
      b.onclick = onClick;
      btns.appendChild(b);
    }
    if (mode === 'go') {
      msg.textContent = '開いています…';
      button('開かないときは、ここを押す', function () { location.href = to; });
      return;
    }
    if (mode === 'none') {
      msg.textContent = 'このページは、チャットで渡した「登録用のリンク」から開いてください。';
      return;
    }
    if (mode === 'step1') {
      msg.textContent = '① 下のボタンを押してください。（Safari 以外で開いているときは、先に Safari で開き直してください）';
      button('登録の画面へ', function () {
        try { sessionStorage.setItem('hp-setup', '1'); } catch (e) {}
        location.href = location.pathname + location.hash;
      }, true);
      return;
    }
    msg.innerHTML = '② 共有ボタン（四角から上に矢印が出ている印。iPhone は画面の下、iPad は右上）を押す →「ホーム画面に追加」→ 右上の「追加」。<br><br>登録できたら、古いアイコンは長押しで消してください。';
    button('いま開く（登録はしない）', function () { location.href = to; });
  });
})();
