/* 오늘의 핵심 뉴스 TOP 7 팝업
 * - 매일 NEWS만 바꾸면 홈·최신동향·일일학습에 함께 반영됩니다.
 * - "오늘 하루 보지 않기": 오늘(로컬 날짜) 동안 다시 띄우지 않음 (localStorage)
 * - "닫기": 이번 방문(탭) 동안만 닫음 (sessionStorage) → 페이지를 옮겨도 다시 뜨지 않음
 * - 페이지 안의 [data-news-open] 버튼으로 언제든 다시 열 수 있음
 */
(function () {
  const NEWS = {
    date: '2026-11-13',
    label: '2026년 11월 13일(금)',
    items: [
      {
        tag: '집값', tone: 'warn',
        title: '서울 +0.07% 92주 연속 상승 — 그러나 성동·강동 하락 전환, 25개 구 중 5곳 하락',
        body: '부동산원 11월 2주(9일 기준) 서울 상승률은 전주와 같았지만 성동(+0.07%→-0.02%)·강동(+0.03%→-0.01%)이 31주 연속 상승을 멈췄습니다. 성북 +0.39%, 강북 +0.32% 등 강북권은 많이 올랐습니다(서울경제·매일일보 11.12).',
        link: '부동산_일일학습_2026.html', linkLabel: '180강 구별 지도 읽는 법'
      },
      {
        tag: '집값', tone: 'down',
        title: '강남 -0.25%·서초 -0.26% 14주 연속 하락 — 송파는 -0.35%로 낙폭 2배',
        body: '강남·서초는 낙폭이 줄었지만 송파는 전주 -0.17%에서 -0.35%로 커지며 10주째 내렸습니다. 서울경제는 8월 10일 이후 강남구 누적 하락률을 -4.22%로 집계했습니다(서울경제 11.12).',
        link: '부동산_최신동향_2026.html#sec-index', linkLabel: '11월 2주 지수 보기'
      },
      {
        tag: '정책', tone: 'warn',
        title: '국토장관 "매물 쌓이고 거래 줄어 — 하락기 접어들 수도 있다는 신호"',
        body: '홍지선 장관은 12일 국회 국토위에서 강남3구 하락과 외곽 상승폭 둔화를 언급했고, 연말 기준금리가 오르면 하락세가 커질 수 있다고 했습니다. 수도권 임대주택 공급은 계속 늘리겠다고 밝혔습니다(뉴스핌·SBS 11.12).',
        link: '부동산_최신동향_2026.html#sec-1113', linkLabel: '11.13 이슈 보기'
      },
      {
        tag: '재건', tone: 'warn',
        title: '재초환 — 은마 1인당 4억6,334만 원 예정액 · 반포현대 179억 원 통지',
        body: '은마 금액은 준공 뒤 바뀔 수 있는 예정액이고, 반포현대는 50일 이의신청을 받습니다. 장관은 "가격 안정 효과와 재산권 문제를 종합 검토"하겠다고 했을 뿐 제도 변경은 정해지지 않았습니다(머니투데이·경북매일·뉴스핌).',
        link: '부동산_일일학습_2026.html', linkLabel: '181강 재초환 계산 구조'
      },
      {
        tag: '규제', tone: 'info',
        title: '10월 서울 토허 신청 3,947건 +8.2% — 강남3구·용산 신청가격 -0.92%',
        body: '두 달 연속 늘었지만 4월(8,886건)의 44.4% 수준입니다. 한강벨트 7개구 신청가격은 +1.04%로 상승폭이 커졌습니다. 서울 전역 토허구역 12.31 만료 연장 여부는 아직 발표되지 않았습니다(서울시, 이투데이 11.13).',
        link: '부동산_최신동향_2026.html#sec-1113', linkLabel: '11.13 이슈 보기'
      },
      {
        tag: '증시', tone: 'down',
        title: '코스피 -0.61% 5,342.73 — 옵션 만기·엔비디아 불확실성, 코스닥 700선 아래',
        body: '장중 5,458.84까지 올랐다가 5,293.05까지 밀린 뒤 마감했습니다. 코스닥은 1.22% 내린 696.53입니다. 기관 순매도 금액은 7,642억 원·6,911억 원 등 매체마다 다릅니다(한국경제·뉴스1 11.12).',
        link: '부동산_최신동향_2026.html#sec-1113', linkLabel: '11.13 이슈 보기'
      },
      {
        tag: '환율', tone: 'info',
        title: '원/달러 1,330.7원 — 2.9원 내려 마감, 다음은 11.26 금통위',
        body: '1,336.4원에 출발해 장중 1,327.7원까지 내렸다가 1,330원대에서 마감했습니다. 서울경제는 일본 외환당국 개입 경계에 따른 엔화 강세를 배경으로 꼽았습니다(아시아경제·서울경제 11.12). 다음 일정은 11.26 금통위(기준금리 3.00%)입니다.',
        link: '부동산_최신동향_2026.html#sec-1113', linkLabel: '이번 주 체크리스트'
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
