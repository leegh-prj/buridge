/* 오늘의 핵심 뉴스 TOP 7 팝업
 * - 매일 NEWS만 바꾸면 홈·최신동향·일일학습에 함께 반영됩니다.
 * - "오늘 하루 보지 않기": 오늘(로컬 날짜) 동안 다시 띄우지 않음 (localStorage)
 * - "닫기": 이번 방문(탭) 동안만 닫음 (sessionStorage) → 페이지를 옮겨도 다시 뜨지 않음
 * - 페이지 안의 [data-news-open] 버튼으로 언제든 다시 열 수 있음
 */
(function () {
  const NEWS = {
    date: '2026-11-15',
    label: '2026년 11월 15일(일)',
    items: [
      {
        tag: '전세', tone: 'warn',
        title: '경기 전세수급지수 110.7 — 2021년 8월 이후 최고, 서울은 120.2로 고점(128.1)서 하락',
        body: '한국부동산원 11월 둘째 주 기준으로 경기 서해안권 117.0, 경부1권 116.2, 인천 110.4입니다. 김포·고양·파주(경의권)는 1월 91.1에서 108.5로 올라 "서울 전세난이 경기로 번진다"는 분석이 나옵니다(연합뉴스 11.15).',
        link: '부동산_일일학습_2026.html', linkLabel: '184강 전세수급지수 읽는 법'
      },
      {
        tag: '재건', tone: 'warn',
        title: '잠실주공5단지 분양신청 66.5%→약 98.7% — 일부 조합원 임원 해임 총회 추진',
        body: '최초 신청률이 낮아 13일까지 접수를 연장했고, 조합은 연장분 포함 약 98.7%로 추산했습니다. 해임 추진 측은 16일부터 소집 요구를 받을 계획이며, 조합은 기존 일정을 유지한다는 입장입니다(MTN 11.14).',
        link: '부동산_일일학습_2026.html', linkLabel: '185강 분양신청과 조합장 해임'
      },
      {
        tag: '집값', tone: 'info',
        title: '정부 "하락 시그널" vs 전문가 "추세 하락은 글쎄" — 서울 매물 8만1,107건',
        body: '성동·강동이 하락 전환했고 강남·서초는 14주 연속 하락했지만, 성북(+0.39%)·강북(+0.32%) 등 외곽은 상승폭이 커졌습니다. 전문가들은 외곽의 실수요 "생존매수"를 근거로 추세 하락 단정은 이르다고 봤습니다(헤럴드경제 11.14, 매물은 아실 12일 기준).',
        link: '부동산_최신동향_2026.html#sec-1115', linkLabel: '11.15 이슈 보기'
      },
      {
        tag: '심리', tone: 'down',
        title: 'KB 서울 매수우위지수 54.9 — 5주 연속 하락, 연중 최저',
        body: '11월 9일 기준 전주보다 5.3포인트 내렸습니다. 한강 이남 11개 구는 48.6, 이북 14개 구는 61.9입니다. 100 아래면 사려는 사람보다 팔려는 사람이 많다는 뜻입니다(머니투데이 11.13).',
        link: '부동산_일일학습_2026.html', linkLabel: '158강 매수우위지수 읽기'
      },
      {
        tag: '거래', tone: 'down',
        title: '3분기 서울 아파트 거래액 14조5,930억 원 — 전 분기보다 49.0% 감소',
        body: '거래량은 2만2,985건에서 1만2,895건으로 43.9% 줄었고, 건당 평균 거래액은 약 12억4,600만 원에서 11억3,200만 원으로 낮아졌습니다(부동산플래닛 분석, 머니투데이 11.13).',
        link: '부동산_최신동향_2026.html#sec-1115', linkLabel: '거래 지표 보기'
      },
      {
        tag: '금리', tone: 'warn',
        title: '미 10월 생산자물가 연 6.5% — 4년 만에 최고, 12월 FOMC 인상 전망',
        body: '전월 대비로는 0.3%로 예상(0.4%)보다 낮았습니다. 시장은 12월 8~9일 FOMC에서 0.25%p 인상을 사실상 반영하고 있고, 0.5%p 인상 가능성도 거론됩니다(파이낸셜뉴스 11.13). 현재 미 기준금리는 3.75~4.00%입니다.',
        link: '부동산_일일학습_2026.html', linkLabel: '177강 미국 CPI 읽는 법'
      },
      {
        tag: '규제', tone: 'info',
        title: '토허제·규제지역 "12월 중 최종 결론" — 다음 주 청약 전국 10곳 1,681가구',
        body: '정부는 서울 전역·경기 12곳 토허구역(12.31 만료)과 조정대상지역·투기과열지구를 연말까지 검토합니다(뉴스1·데일리안 11.13). 다음 주 청약 물량의 약 80%인 1,340가구가 서울·경기에 몰렸습니다(연합뉴스 11.14).',
        link: '부동산_일일학습_2026.html', linkLabel: '182강 규제 연장 결정 읽는 법'
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
