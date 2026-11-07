/* 오늘의 핵심 뉴스 TOP 7 팝업
 * - 매일 NEWS만 바꾸면 홈·최신동향·일일학습에 함께 반영됩니다.
 * - "오늘 하루 보지 않기": 오늘(로컬 날짜) 동안 다시 띄우지 않음 (localStorage)
 * - "닫기": 이번 방문(탭) 동안만 닫음 (sessionStorage) → 페이지를 옮겨도 다시 뜨지 않음
 * - 페이지 안의 [data-news-open] 버튼으로 언제든 다시 열 수 있음
 */
(function () {
  const NEWS = {
    date: '2026-11-07',
    label: '2026년 11월 7일(토)',
    items: [
      {
        tag: '증시', tone: 'down',
        title: '코스피 -6.02% 5,059.69 — 장중 4,911까지, 9개월 만에 5,000선 아래',
        body: '11.6 개장 직후 서킷브레이커가 발동했고 장중 -8.78%까지 밀렸다가 5,000선 위에서 마감했습니다. 미 중간선거 뒤 AI 규제 우려와 미국 반도체주 급락이 원인으로 꼽혔습니다. 코스닥 -5.03%(644.27)(뉴스핌·뉴스1 11.06).',
        link: '부동산_최신동향_2026.html#sec-1107', linkLabel: '11.07 이슈 보기'
      },
      {
        tag: '정책', tone: 'warn',
        title: '정부, 신용융자 담보비율 140% 유지 의무 3개월 면제 — 11.9부터',
        body: '긴급 시장상황점검회의에서 결정했습니다. 주가 급락 때 과도한 반대매매로 변동성이 커지는 것을 막기 위한 조치이며, 변동성이 더 커지면 추가 조치도 준비한다고 밝혔습니다(MBC·아주경제 11.06).',
        link: '부동산_일일학습_2026.html', linkLabel: '168강 신용융자와 반대매매'
      },
      {
        tag: '환율', tone: 'warn',
        title: '원/달러 1,356.6원 — 하루 14.5원 올라, 장중 1,362.2원',
        body: '외국인이 유가증권시장에서 약 2조8,000억 원을 팔아 6거래일 연속 순매도했습니다. 수출기업 달러 매도가 상승 폭을 일부 제한했습니다(아시아경제 11.06).',
        link: '부동산_일일학습_2026.html', linkLabel: '146강 FOMC·환율과 주담대'
      },
      {
        tag: '분양', tone: 'info',
        title: '고덕강일3단지 1순위 34.7대 1 — 59㎡는 52.6대 1',
        body: '일반공급 267가구에 1순위 9,272명이 신청했습니다(뉴스1). 서울 2년 이상 거주 신청자만 보면 6,467명, 24.22대 1입니다(한국경제). 집계 범위가 달라 숫자가 다릅니다. 당첨자 발표 11.26.',
        link: '부동산_일일학습_2026.html', linkLabel: '169강 청약 경쟁률 읽는 법'
      },
      {
        tag: '시세', tone: 'down',
        title: '강남3구 "5% 이상 하락 거래" 일주일 16건 — 원베일리 84㎡ 71.5억 → 57억',
        body: '우리은행 부동산리서치랩이 10.29~11.4 실거래를 분석한 결과입니다. 송파 8건·강남 6건·서초 2건이었고, 래미안원베일리 84㎡는 14억5,000만 원(20.3%) 낮게 거래됐습니다(와이드경제 11.06).',
        link: '부동산_일일학습_2026.html', linkLabel: '167강 실거래와 지수 구분'
      },
      {
        tag: '집값', tone: 'info',
        title: '서울 +0.07% 91주 연속 상승 — 강남 -0.39%·서초 -0.37% 13주 연속 하락',
        body: '부동산원 11월 1주(11.2 기준) 발표입니다. 서울 상승폭은 3주 연속 줄었고, 송파도 -0.17%로 내렸습니다. 서울 전세는 +0.17%(뉴스핌·파이낸셜뉴스 11.05).',
        link: '부동산_최신동향_2026.html#sec-index', linkLabel: '주간 지수 보기'
      },
      {
        tag: '일정', tone: 'info',
        title: '다음 주 체크 — 미 10월 CPI·PPI, 11.12 부동산원 11월 2주',
        body: '증권가는 다음 주 미국 물가 지표와 코어위브 실적을 증시 반등의 변수로 꼽았습니다(파이낸셜뉴스 11.06). 11.26에는 금통위(기준금리 3.00%)와 고덕강일3단지 당첨자 발표가 있습니다.',
        link: '부동산_최신동향_2026.html#sec-1107', linkLabel: '이번 주 체크리스트'
      }
    ],
    note: '언론 보도 기반 요약입니다. 투자 판단 전 원문과 공식 발표를 확인하세요.'
  };

  const HIDE_KEY = 'buridge-news-hide-date';
  const CLOSE_KEY = 'buridge-news-closed';
  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  function read(store, key) { try { return store.getItem(key); } catch (e) { return null; } }
  function write(store, key, val) { try { store.setItem(key, val); } catch (e) { /* 저장소를 쓸 수 없으면 무시 */ } }

  const css = `
.bnp-back{position:fixed;inset:0;z-index:10000;background:rgba(6,14,28,.55);display:flex;align-items:center;justify-content:center;padding:16px;animation:bnpFade .18s ease-out;}
.bnp{--bnp-bg:#fff;--bnp-ink:#14263d;--bnp-ink2:#4a5f78;--bnp-rule:#dde4ee;--bnp-soft:#f3f6fb;--bnp-accent:#1c52b0;
  --bnp-down:#c62828;--bnp-down-bg:#fdecec;--bnp-warn:#8a4d00;--bnp-warn-bg:#fff3e0;--bnp-info:#1c52b0;--bnp-info-bg:#e8f0ff;
  width:100%;max-width:520px;max-height:min(86vh,720px);display:flex;flex-direction:column;background:var(--bnp-bg);color:var(--bnp-ink);
  border-radius:16px;box-shadow:0 18px 48px rgba(0,0,0,.28);overflow:hidden;font-family:Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Apple SD Gothic Neo, Malgun Gothic, sans-serif;animation:bnpUp .22s ease-out;}
:root[data-theme="dark"] .bnp{--bnp-bg:#16202e;--bnp-ink:#e8edf5;--bnp-ink2:#9fb0c6;--bnp-rule:#2a3a50;--bnp-soft:#1d2a3b;--bnp-accent:#6ea1ff;
  --bnp-down:#ff8a80;--bnp-down-bg:#3a1f22;--bnp-warn:#ffb74d;--bnp-warn-bg:#3a2c16;--bnp-info:#8ab4ff;--bnp-info-bg:#1c2b47;}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .bnp{--bnp-bg:#16202e;--bnp-ink:#e8edf5;--bnp-ink2:#9fb0c6;--bnp-rule:#2a3a50;--bnp-soft:#1d2a3b;--bnp-accent:#6ea1ff;
  --bnp-down:#ff8a80;--bnp-down-bg:#3a1f22;--bnp-warn:#ffb74d;--bnp-warn-bg:#3a2c16;--bnp-info:#8ab4ff;--bnp-info-bg:#1c2b47;}}
.bnp-hd{padding:18px 20px 12px;border-bottom:1px solid var(--bnp-rule);display:flex;align-items:flex-start;gap:12px;}
.bnp-hd-txt{flex:1;min-width:0;}
.bnp-eyebrow{font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--bnp-accent);}
.bnp-ttl{font-size:19px;font-weight:800;margin:3px 0 0;letter-spacing:-.3px;}
.bnp-date{font-size:12px;color:var(--bnp-ink2);margin-top:2px;}
.bnp-x{flex-shrink:0;width:32px;height:32px;border-radius:50%;border:none;background:var(--bnp-soft);color:var(--bnp-ink2);font-size:18px;line-height:1;cursor:pointer;}
.bnp-x:hover{color:var(--bnp-ink);}
.bnp-list{list-style:none;margin:0;padding:6px 12px;overflow-y:auto;-webkit-overflow-scrolling:touch;}
.bnp-item{display:flex;gap:12px;padding:12px 8px;border-bottom:1px solid var(--bnp-rule);}
.bnp-item:last-child{border-bottom:none;}
.bnp-rank{flex-shrink:0;width:26px;height:26px;border-radius:8px;background:var(--bnp-accent);color:#fff;font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;margin-top:1px;}
.bnp-item:nth-child(n+4) .bnp-rank{background:var(--bnp-soft);color:var(--bnp-ink2);}
.bnp-body{min-width:0;}
.bnp-tag{display:inline-block;font-size:10.5px;font-weight:700;padding:1px 7px;border-radius:999px;margin-bottom:4px;}
.bnp-tag.down{color:var(--bnp-down);background:var(--bnp-down-bg);}
.bnp-tag.warn{color:var(--bnp-warn);background:var(--bnp-warn-bg);}
.bnp-tag.info{color:var(--bnp-info);background:var(--bnp-info-bg);}
.bnp-item-ttl{font-size:14.5px;font-weight:700;line-height:1.45;}
.bnp-item-body{font-size:12.5px;color:var(--bnp-ink2);line-height:1.6;margin-top:3px;}
.bnp-link{display:inline-block;margin-top:5px;font-size:12px;font-weight:700;color:var(--bnp-accent);text-decoration:none;}
.bnp-link:hover{text-decoration:underline;}
.bnp-note{font-size:11px;color:var(--bnp-ink2);padding:8px 20px 0;}
.bnp-ft{display:flex;gap:8px;padding:12px 16px 16px;}
.bnp-btn{flex:1;min-height:44px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;}
.bnp-btn-today{background:var(--bnp-soft);color:var(--bnp-ink2);border:1px solid var(--bnp-rule);}
.bnp-btn-close{background:var(--bnp-accent);color:#fff;border:1px solid var(--bnp-accent);}
.bnp-btn:focus-visible,.bnp-x:focus-visible,.bnp-link:focus-visible{outline:2px solid var(--bnp-accent);outline-offset:2px;}
@media (max-width:480px){.bnp-back{align-items:flex-end;padding:0;}.bnp{max-width:none;border-radius:16px 16px 0 0;max-height:88vh;}}
@keyframes bnpFade{from{opacity:0}to{opacity:1}}
@keyframes bnpUp{from{transform:translateY(12px);opacity:0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.bnp-back,.bnp{animation:none;}}
`;

  let backdrop = null;
  let lastFocus = null;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function build() {
    if (!document.getElementById('bnp-style')) {
      const st = document.createElement('style');
      st.id = 'bnp-style';
      st.textContent = css;
      document.head.appendChild(st);
    }
    backdrop = document.createElement('div');
    backdrop.className = 'bnp-back';
    backdrop.innerHTML = `
      <div class="bnp" role="dialog" aria-modal="true" aria-labelledby="bnp-title">
        <div class="bnp-hd">
          <div class="bnp-hd-txt">
            <div class="bnp-eyebrow">부릿지 TODAY</div>
            <h2 class="bnp-ttl" id="bnp-title">오늘의 핵심 뉴스 TOP 7</h2>
            <div class="bnp-date">${esc(NEWS.label)} 기준</div>
          </div>
          <button type="button" class="bnp-x" data-act="close" aria-label="닫기">×</button>
        </div>
        <ol class="bnp-list">
          ${NEWS.items.map((n, i) => `
            <li class="bnp-item">
              <span class="bnp-rank" aria-hidden="true">${i + 1}</span>
              <div class="bnp-body">
                <span class="bnp-tag ${esc(n.tone)}">${esc(n.tag)}</span>
                <div class="bnp-item-ttl">${esc(n.title)}</div>
                <div class="bnp-item-body">${esc(n.body)}</div>
                ${n.link ? `<a class="bnp-link" href="${esc(n.link)}" data-act="link">${esc(n.linkLabel || '자세히')} →</a>` : ''}
              </div>
            </li>`).join('')}
        </ol>
        <div class="bnp-note">${esc(NEWS.note)}</div>
        <div class="bnp-ft">
          <button type="button" class="bnp-btn bnp-btn-today" data-act="today">오늘 하루 보지 않기</button>
          <button type="button" class="bnp-btn bnp-btn-close" data-act="close">닫기</button>
        </div>
      </div>`;
    backdrop.addEventListener('click', e => {
      const act = e.target.closest('[data-act]');
      if (e.target === backdrop) return close();
      if (!act) return;
      if (act.dataset.act === 'close') close();
      else if (act.dataset.act === 'today') { write(localStorage, HIDE_KEY, today); close(); }
      else if (act.dataset.act === 'link') close();
    });
  }

  function onKey(e) {
    if (!backdrop || !backdrop.isConnected) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); close(); return; }
    if (e.key === 'Tab') {
      const f = [...backdrop.querySelectorAll('button, a[href]')];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    // 팝업이 열려 있는 동안 페이지의 단축키(←/→, / 등)가 동작하지 않도록 막음
    e.stopImmediatePropagation();
  }

  function open() {
    if (backdrop && backdrop.isConnected) return;
    if (!backdrop) build();
    lastFocus = document.activeElement;
    document.body.appendChild(backdrop);
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey, true);
    const btn = backdrop.querySelector('.bnp-btn-close');
    if (btn) btn.focus();
  }

  function close() {
    if (!backdrop || !backdrop.isConnected) return;
    write(sessionStorage, CLOSE_KEY, NEWS.date);
    backdrop.remove();
    document.documentElement.style.overflow = '';
    window.removeEventListener('keydown', onKey, true);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  window.BuridgeNews = { open, close, data: NEWS };

  function init() {
    document.querySelectorAll('[data-news-open]').forEach(b => b.addEventListener('click', open));
    const hidden = read(localStorage, HIDE_KEY) === today;
    const closed = read(sessionStorage, CLOSE_KEY) === NEWS.date;
    if (!hidden && !closed) open();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
