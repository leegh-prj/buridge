/* 오늘의 핵심 뉴스 TOP 7 팝업
 * - 매일 NEWS만 바꾸면 홈·최신동향·일일학습에 함께 반영됩니다.
 * - "오늘 하루 보지 않기": 오늘(로컬 날짜) 동안 다시 띄우지 않음 (localStorage)
 * - "닫기": 이번 방문(탭) 동안만 닫음 (sessionStorage) → 페이지를 옮겨도 다시 뜨지 않음
 * - 페이지 안의 [data-news-open] 버튼으로 언제든 다시 열 수 있음
 */
(function () {
  const NEWS = {
    date: '2026-11-23',
    label: '2026년 11월 23일(월)',
    items: [
      {
        tag: '증시', tone: 'warn',
        title: '정부 긴급 F4 회의 — 증안펀드 18년 만에 투입 준비, 24일부터 자사주 매수 한도 완화',
        body: '20일 코스피 -5.21%(4,869.96)·나스닥 -5.28% 급락에 22일 긴급 시장상황점검회의가 열렸습니다. 증안펀드는 2008년(5,150억 원) 이후 집행된 적이 없으며, 실제 투입 여부·규모는 아직 정해지지 않았습니다(시대일보 11.22 · 뉴스핌 11.23).',
        link: '부동산_최신동향_2026.html#sec-1123', linkLabel: '11.23 이슈 보기'
      },
      {
        tag: '규제', tone: 'down',
        title: '재초환 연말 부과 본격화 — 래미안트리니원 84㎡ 호가 56억·65억 "부담금 누가 내나"',
        body: '56억 원은 매수자, 65억 원은 매도자가 부담금을 내는 조건입니다. 잠실주공5단지 76㎡ 호가는 일주일 새 40억→35억5,000만 원으로 내렸습니다(머니투데이 11.22).',
        link: '부동산_일일학습_2026.html', linkLabel: '200강 재초환 부담금과 호가'
      },
      {
        tag: '공급', tone: 'warn',
        title: '12월 전국 아파트 입주 1만6,486가구 — 1년 전보다 49% 감소, 서울은 903가구',
        body: '수도권은 전년 동월 대비 66.5% 줄었습니다. 인천계양에서 3기 신도시 첫 입주(1,285가구)가 시작됩니다(직방 · 파이낸셜뉴스 11.23).',
        link: '부동산_일일학습_2026.html', linkLabel: '201강 입주물량으로 전세 읽기'
      },
      {
        tag: '전세', tone: 'warn',
        title: '잠실엘스 84㎡ 매매 37억→31억인데 전세는 16억 최고가 — 강남 매매·전세 엇박자',
        body: '래미안대치팰리스 84㎡ 전세는 22억5,000만 원으로 올해 초보다 4억 원 올랐습니다. 동남권 11월 3주 매매 -0.28%, 전세 +0.11%입니다(서울경제 11.23).',
        link: '부동산_일일학습_2026.html', linkLabel: '201강 매매·전세 엇박자'
      },
      {
        tag: '매물', tone: 'down',
        title: '강남3구 아파트 매물 3만56건 — 1년 새 82.8% 증가, 은마 127→406건',
        body: '아실 자료 기준 11월 20일 수치입니다. 개포주공7단지 매물도 90건→126건으로 늘었습니다(머니투데이 11.22).',
        link: '부동산_일일학습_2026.html', linkLabel: '200강 호가·매물 읽기'
      },
      {
        tag: '금리', tone: 'warn',
        title: '이번 주 25일 미국 PCE · 26일 한은 금통위 — 3.00%→3.25% 인상 전망',
        body: '26일은 올해 마지막 금통위입니다. NH투자증권은 미국 10월 PCE 물가를 3.8%(근원 3.2%)로 예상했습니다(파이낸셜뉴스 11.22 · 뉴스핌 11.23).',
        link: '부동산_일일학습_2026.html', linkLabel: '198강 금리 인상 전망과 내 대출 이자'
      },
      {
        tag: '분양', tone: 'info',
        title: '이번 주 전국 15곳 6,295가구 청약 — 전주의 3.7배, 경희궁 에피트 26일 1순위',
        body: '24일 해링턴 플레이스 문래(218가구)·호반써밋 초량, 26일 경희궁 에피트(일반분양 134가구)가 1순위 접수를 받습니다(브릿지경제 11.20, 리얼투데이 집계).',
        link: '부동산_최신동향_2026.html#sec-1123', linkLabel: '이번 주 체크리스트'
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
