# 부릿지 데일리 업데이트 절차서

매일 아침 자동 실행되는 업데이트 작업의 절차입니다. 결과물은 `master`에 push하면 Vercel이 자동 배포합니다(https://buridge.vercel.app).

**대원칙: 확인된 사실만 쓴다.** 모든 수치·사건은 WebSearch로 찾은 기사에서 확인한 것만 씁니다. 찾지 못한 수치는 지어내지 말고 직전 값을 유지하거나 "확인하지 못함"으로 표기합니다. 매체마다 수치가 다르면 함께 적습니다. 과거에 추정 수치를 쓰다 대량 정정한 적이 있습니다.

## 0. 오늘 날짜 확인

```bash
TZ=Asia/Seoul date '+%Y-%m-%d %a'
```

- 이하 `DAY`=YYYY-MM-DD, `MMDD` 섹션 id는 `sec-{월}{일2자리}` (예: 11월 2일 → `sec-1102`, 9월 29일 → `sec-929`)
- 요일 표기는 반드시 위 명령 결과를 따릅니다(과거에 요일 오기가 있었음).
- 이미 오늘 업데이트가 되어 있으면(`node .claude/scripts/verify.mjs DAY` 통과) 아무것도 하지 말고 종료합니다.

## 1. 조사 (WebSearch)

검색어에 날짜를 넣어(`"2026년 11월 2일" 코스피 마감`) 그날 기사를 찾습니다. 최소 확인 항목:

| 항목 | 언제 새 값이 나오나 | 비고 |
|---|---|---|
| 코스피 종가·등락률, 코스닥 | 평일 15:30 마감 → 다음 날 아침에 반영 | 주말·공휴일은 직전 거래일 값 유지 |
| 원/달러 환율 종가 | 평일 15:30 | 서울외환시장 주간거래 종가 |
| 한국부동산원 주간 아파트 가격동향 | **매주 목요일 오후** 발표(월요일 기준 조사) | 서울·강남·서초·송파·경기·전국 매매/전세, 연속 상승·하락 주수 |
| 한은 기준금리 | 금통위 날만 | 현재 3.00%, 다음 2026.11.26 |
| 미 연준 | FOMC 날만 | 현재 3.75~4.00%, **의장은 케빈 워시**(파월 아님) |
| COFIX | 매월 15일 전후 전월분 공시 | 9월분 신규취급액 3.43% |
| 부동산 주요 뉴스 | 매일 | 정책(국토부·금융위), 공급·분양, 매물, 규제(토허구역 12.31 만료 이슈), 청약 |

## 2. 수정할 파일과 위치

### 2-1. `news-popup.js` — 오늘의 핵심 뉴스 TOP 7
`const NEWS = { date, label, items, note }`만 바꿉니다.
- `date: 'DAY'`, `label: '2026년 11월 2일(월)'`
- `items`는 **정확히 7개**. 각 항목: `tag`(2글자 분류: 집값·매물·분양·규제·금리·증시·공급·전세·정책 등), `tone`(`down`=하락·악재, `warn`=주의, `info`=중립·정보), `title`(핵심 숫자 포함 한 줄), `body`(1~2문장), `link`(관련 페이지/강의), `linkLabel`
- 중요도 순으로 1번이 가장 중요. 오늘 새로 나온 뉴스를 우선하고, 부족하면 이번 주 핵심 지표로 채웁니다.

### 2-2. `부동산_최신동향_2026.html`
1. `<span class="date-badge">YYYY.MM.DD 기준</span>`
2. 히어로: `<div class="hero-ttl">`부터 `kpi-row`의 KPI 6개까지 통째로 교체 (구조는 기존 것을 그대로 복사해 값만 바꿈). KPI 색: `kv-up` 상승, `kv-dn` 하락, `kv-nt` 중립
3. `alert-bar` 문구와 `<span class="alert-chip">YYYY.MM.DD 업데이트</span>`
4. 바로가기 `<nav class="sec-nav">`: `<a href="#sec-index">주간 지수</a>` 바로 다음 줄에 `<a href="#sec-MMDD">M.DD 이슈</a>` 추가 (최신이 위)
5. **오늘 이슈 섹션**: 직전 최신 섹션 주석(`<!-- M.DD — ...`) 바로 앞에 삽입
   ```html
   <!-- M.DD — 요약 -->
   <div class="sh" id="sec-MMDD"><span class="sh-label">M월 D일(요일) — 요약</span><span class="sh-date">YYYY.MM.DD</span></div>
   <div class="cards-3" style="margin-bottom:28px;">
     <div class="nc info|warn|neutral">
       <div class="nc-cat info|warn|neutral">분류 · ○○○강 신규</div>
       <div class="nc-ttl">제목</div>
       <div class="nc-body">본문(<b>, <br> 사용)</div>
       <span class="nc-stat ns-info|ns-warn">▶ 출처: 매체명 (날짜)</span>
     </div>
     ... (카드 3개)
   </div>
   ```
   필요하면 `cards-2`로 카드 2개 더(이번 주 체크리스트 등). 카드에는 **출처 매체명**을 꼭 씁니다.
6. **목요일 발표가 나온 다음 날(보통 금요일)**: `<div class="sh" id="sec-index">`부터 `<!-- 시장 동향 섹션 -->` 직전까지의 주간 지수(요약 4칸 + 지역 표 + 출처 문단)를 새 주차 수치로 교체. 괄호 안에 전주 수치 병기.
7. 지난 섹션은 손대지 않습니다(페이지 스크립트가 최근 3개만 펼치고 나머지는 자동으로 접음).

### 2-3. `부동산_일일학습_2026.html` — 강의 2개 추가
1. 강의 2개를 임시 파일(예: `/tmp/lessons.js`)에 작성. 형식은 파일 맨 끝의 기존 강의(예: 156·157강)를 그대로 따릅니다.
   - 필드: `num`(직전 최대+1, +2), `date: 'DAY'`, `cat`(market·finance·tax·rebuild·invest·law·policy·strategy), `catLabel`, `sub`, `title`(`주제 — 부제` 형식), `concept`, `text`(백틱 문자열, `**굵게**`, `■` 소제목, 표는 `| a | b |`), `formula`, `example`, `tip`, `checklist`(`□ `로 시작하는 6줄), `quiz{q, opts[4], ans(0~3), explain}`
   - 주제: **그날 뉴스와 연결된 초보자용 개념 강의**. 숫자는 확인된 수치만. 계산 예시는 직접 계산해 검산. 관련 과거 강의 번호를 `(148강)`처럼 연결.
   - 백틱 문자열 안에 백틱, `${` 사용 금지.
2. 삽입:
   ```bash
   python .claude/scripts/add_lessons.py /tmp/lessons.js DAY "첫 강의 짧은 제목"
   ```

### 2-4. `index.html` — 홈
- `<span class="hd-date">YYYY.MM.DD 기준</span>`
- 히어로 패널 `hp-ttl`·`hp-row` 5개·`hp-date`: 최신 주간 지수·기준금리·환율
- 뉴스 티커 `ticker-items`(7~8개), 업데이트 배너 `update-bar`, 최신동향 카드(`card-featured`의 날짜·설명·수치 3개)
- 강의 수: `일일학습 N강`(cert-tag, og/twitter description 2곳), 일일학습 카드 설명의 `N강까지 공개`

### 2-5. `og-image.svg`
- `일일학습 N강` 숫자만 갱신

## 3. 검증 (통과하지 못하면 push 금지)

```bash
node .claude/scripts/verify.mjs DAY
```
실패 항목을 고친 뒤 다시 실행합니다. 추가로 `git diff --stat`으로 위 5개 파일만 바뀌었는지 확인합니다.

## 4. 커밋·배포

```bash
git add index.html news-popup.js og-image.svg 부동산_최신동향_2026.html 부동산_일일학습_2026.html
git commit -m "YYYY.MM.DD 업데이트 — N강·N+1강 · 핵심 이슈 요약 · M.DD 이슈 섹션 · 데일리 TOP 7

- N강: ...
- N+1강: ...
- 최신동향: 주요 수치

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin master
```
- push 후 1~2분 뒤 `curl -s https://buridge.vercel.app/news-popup.js | grep "date: 'DAY'"`로 배포 확인.
- push가 거부되면(원격이 앞서 있음) `git pull --rebase origin master` 후 검증을 다시 돌리고 push.

## 5. 마지막 보고

작업 끝에 아래를 짧게 남깁니다: 추가한 강의 번호·제목, TOP 7 제목, 바뀐 주요 수치, **확인하지 못해 비워 두거나 직전 값을 유지한 항목**, 사용한 출처 URL.

## 참고: 고정 사실 (2026.11.01 기준, 바뀌면 이 문서도 갱신)
- 연준 의장: 케빈 워시. 미 기준금리 3.75~4.00% (10.28 동결, 10대 2)
- 한은 기준금리 3.00% (10.22 동결), 다음 금통위 11.26
- 서울 아파트 매매는 10월 4주 기준 90주 연속 상승(역대 최장), 강남·서초 12주 연속 하락
- 서울 전역·경기 12곳 토지거래허가구역 2026.12.31 만료 예정(연장 여부 미정)
