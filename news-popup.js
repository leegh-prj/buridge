/* 오늘의 핵심 뉴스 TOP 7 팝업
 * - 매일 NEWS만 바꾸면 홈·최신동향·일일학습에 함께 반영됩니다.
 * - "오늘 하루 보지 않기": 오늘(로컬 날짜) 동안 다시 띄우지 않음 (localStorage)
 * - "닫기": 이번 방문(탭) 동안만 닫음 (sessionStorage) → 페이지를 옮겨도 다시 뜨지 않음
 * - 페이지 안의 [data-news-open] 버튼으로 언제든 다시 열 수 있음
 */
(function () {
  const NEWS = {
    date: '2026-11-26',
    label: '2026년 11월 26일(목)',
    items: [
      {
        tag: '금리', tone: 'warn',
        title: '오늘(26일) 올해 마지막 금통위 — 3.00%→3.25% 인상 전망 우세, 결과는 오전 발표',
        body: '연합뉴스 설문에서 전문가 6명 전원이 0.25%p 인상을 예상했고, 금융투자협회 조사에서는 채권 전문가 100명 중 54명 인상·46명 동결로 갈렸습니다. 10월 물가는 2.8%로 목표(2%)를 웃돕니다(파이낸셜투데이 · 디지털타임스 11.26).',
        link: '부동산_일일학습_2026.html', linkLabel: '198강 금리 인상과 내 대출 이자'
      },
      {
        tag: '증시', tone: 'down',
        title: '코스피 -6.16% 4,697.51 — 하루 만에 5,000선 반납, 1월 13일 이후 최저',
        body: '외국인이 약 1조9,000억 원을 팔았고 코스닥도 650.64(-2.29%)로 내렸습니다. 올해 사이드카는 벌써 102회이며, 산업은행은 증안펀드(10조7,600억 원) 참여사에 추가 출자 의향을 물었습니다(파이낸셜뉴스 · 이투데이 11.26).',
        link: '부동산_일일학습_2026.html', linkLabel: '197강 매도 사이드카 읽는 법'
      },
      {
        tag: '전세', tone: 'warn',
        title: '서울 아파트 신규 전세 중간값 6억500만 원 — 1년 새 4,500만 원↑, 6억 이하 전세 43.3%↓',
        body: '6억 원 이하 신규 전세는 3만9,916건에서 2만2,616건으로 줄었습니다. 서울 전세 수요가 경기로 번지며 경기 전셋값은 올해 6.88% 올랐습니다(세계일보 11.25, 국토부 실거래가 · 부동산원).',
        link: '부동산_일일학습_2026.html', linkLabel: '206강 중간값으로 읽는 전세'
      },
      {
        tag: '심리', tone: 'info',
        title: '주택가격전망지수 118 — 한 달 새 6포인트↓, 5월 이후 최저',
        body: '한국은행 11월 소비자동향조사에서 "1년 뒤 집값이 오른다"는 기대가 약해졌습니다. 한은은 강남·서초 약세, 공급 대책, 금리 상승을 원인으로 꼽았습니다. 소비자심리지수는 103.1(-2.3p)입니다(데일리안 11.25 · 시사저널e 11.24).',
        link: '부동산_일일학습_2026.html', linkLabel: '207강 주택가격전망지수 읽는 법'
      },
      {
        tag: '정책', tone: 'info',
        title: '서울시 "정비사업 권한 자치구 이양은 퇴행" — 도시정비법 개정안 전면 철회 촉구',
        body: '김남근 의원 등이 낸 개정안은 정비계획 최초 결정만 서울시에 두고 변경·통합심의는 자치구로 넘깁니다. 서울시는 통합심의 가결률이 약 95%로 이미 빠르다며 반대했습니다(서울경제 · 데일리안 11.25).',
        link: '부동산_최신동향_2026.html#sec-1126', linkLabel: '11.26 이슈 보기'
      },
      {
        tag: '규제', tone: 'info',
        title: '오세훈, 국무회의서 정비사업 규제 완화 건의 — 이주비 대출·조합원 지위 양도·재초환',
        body: '24일 국무회의에서 서울 주택 공급 확대를 위한 건의안을 냈습니다. 국토부는 공공주택지구 보상 협조 시 보상액의 최대 30%를 장려금으로 주는 시행령 개정안을 입법예고했습니다(데일리안 11.25).',
        link: '부동산_최신동향_2026.html#sec-1126', linkLabel: '11.26 이슈 보기'
      },
      {
        tag: '환율', tone: 'info',
        title: '원/달러 1,343.2원 마감 — 0.8원↑, 미국 기술주 조정에 외국인 순매도',
        body: '코스피 급락에도 환율 상승 폭은 작았습니다. 수출업체 달러 매도(네고)가 상승을 눌렀습니다(세계일보 · 베타뉴스 · 이투데이 11.25).',
        link: '부동산_최신동향_2026.html#sec-1126', linkLabel: '11.26 이슈 보기'
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
.bnp-eyebrow{font-size:12px;font-weight:700;letter-spacing:.06em;color:var(--bnp-accent);}
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
.bnp-tag{display:inline-block;font-size:12px;font-weight:700;padding:1px 7px;border-radius:999px;margin-bottom:4px;}
.bnp-tag.down{color:var(--bnp-down);background:var(--bnp-down-bg);}
.bnp-tag.warn{color:var(--bnp-warn);background:var(--bnp-warn-bg);}
.bnp-tag.info{color:var(--bnp-info);background:var(--bnp-info-bg);}
.bnp-item-ttl{font-size:14.5px;font-weight:700;line-height:1.45;}
.bnp-item-body{font-size:12.5px;color:var(--bnp-ink2);line-height:1.6;margin-top:3px;}
.bnp-link{display:inline-flex;align-items:center;min-height:32px;margin-top:2px;font-size:12px;font-weight:700;color:var(--bnp-accent);text-decoration:none;}
.bnp-link:hover{text-decoration:underline;}
.bnp-note{font-size:12px;color:var(--bnp-ink2);padding:8px 20px 0;}
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
