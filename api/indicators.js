// Vercel serverless function
// 소스: Yahoo Finance (쿠키+크럼 인증) → 실패 시 FRED 일간 데이터로 자동 폴백
//       FRED (미국 통화·금리) + ECOS 한국은행 (한국 지표)
// Cache: s-maxage=3600, stale-while-revalidate=86400
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const FRED_KEY = (process.env.FRED_API_KEY || '').replace(/[^a-z0-9]/g, '');
  const ECOS_KEY = (process.env.ECOS_API_KEY || '').replace(/[^A-Za-z0-9]/g, '');

  /* ─────────────────────────────────────────
     Yahoo Finance (쿠키+크럼 방식)
     심볼 → 안정적 키 매핑
  ───────────────────────────────────────── */
  const YAHOO_SYMS = ['^KS11', '^GSPC', '^IXIC', 'KRW=X', 'GC=F', 'CL=F', '^TNX'];
  const Y_KEY = { '^KS11':'KOSPI', '^GSPC':'SP500', '^IXIC':'NASDAQ', 'KRW=X':'USDKRW', 'GC=F':'GOLD', 'CL=F':'OIL', '^TNX':'UST10Y' };

  async function fetchYahoo() {
    // 1) 쿠키 취득
    const r1 = await fetch('https://fc.yahoo.com/', {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(7000),
    });
    const rawCookie = r1.headers.get('set-cookie') || '';
    const cookieStr = rawCookie.split(',')
      .map(c => (c.trim().match(/^([^;]+)/) || [''])[0].trim())
      .filter(c => c.includes('='))
      .join('; ');

    // 2) 크럼 취득
    const r2 = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Cookie': cookieStr,
        'Accept': 'text/plain, */*',
      },
      signal: AbortSignal.timeout(5000),
    });
    const crumb = (await r2.text()).trim();
    if (!crumb || crumb.includes('<') || crumb.length > 30) throw new Error(`crumb invalid: ${crumb.slice(0,20)}`);

    // 3) 시세 조회
    const r3 = await fetch(
      `https://query2.finance.yahoo.com/v7/finance/quote?formatted=false&symbols=${encodeURIComponent(YAHOO_SYMS.join(','))}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketPreviousClose,regularMarketTime,shortName&crumb=${encodeURIComponent(crumb)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Cookie': cookieStr,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!r3.ok) throw new Error(`quote HTTP ${r3.status}`);
    const json = await r3.json();
    return json?.quoteResponse?.result ?? [];
  }

  /* ─────────────────────────────────────────
     FRED 일간 시장 데이터 (Yahoo 폴백)
  ───────────────────────────────────────── */
  const FRED_MARKET = [
    { key: 'SP500',  series: 'SP500'            },   // S&P 500
    { key: 'NASDAQ', series: 'NASDAQCOM'        },   // NASDAQ 종합
    { key: 'USDKRW', series: 'DEXKOUS'          },   // 원/달러 환율
    { key: 'GOLD',   series: 'GOLDAMGBD228NLBM' },   // 금 (런던 Fix, USD/oz)
    { key: 'OIL',    series: 'DCOILWTICO'       },   // WTI 원유 (USD/bbl)
    { key: 'UST10Y', series: 'DGS10'            },   // 미 10년물 국채 (%)
  ];

  /* ─────────────────────────────────────────
     FRED 통화·금리 (월간)
  ───────────────────────────────────────── */
  const FRED_MONETARY = ['M2SL', 'M1SL', 'FEDFUNDS', 'CPIAUCSL'];

  async function fetchFred(seriesId) {
    if (!FRED_KEY) return null;
    const r = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_KEY}&sort_order=desc&limit=2&file_type=json`,
      { signal: AbortSignal.timeout(8000) }
    );
    const json = await r.json();
    const obs = (json.observations || []).filter(o => o.value !== '.');
    if (!obs.length) return null;
    const cur = parseFloat(obs[0].value), prv = obs[1] ? parseFloat(obs[1].value) : null;
    if (isNaN(cur)) return null;
    return { price: cur, chgPct: prv != null ? ((cur - prv) / Math.abs(prv)) * 100 : null, prev: prv, date: obs[0].date, time: null };
  }

  /* ─────────────────────────────────────────
     ECOS 한국은행
  ───────────────────────────────────────── */
  const ECOS_CALLS = [

    { key: 'KR_RATE', code: '722Y001', period: 'M', item: '0101000' },
    { key: 'KR_M2',   code: '161Y006', period: 'M', item: 'BBHA00'  },
    { key: 'KR_M1',   code: '161Y002', period: 'M', item: 'BBLA00'  },
    { key: 'KR_CPI',  code: '901Y009', period: 'M', item: '0'       },
  ];
  function ecosDates() {
    const now = new Date();
    const y = now.getFullYear(), m = String(now.getMonth() + 1).padStart(2, '0');
    return { start: `${y - 1}${m}`, end: `${y}${m}` };
  }

  async function fetchEcos(code, period, item) {
    if (!ECOS_KEY) return null;
    const { start, end } = ecosDates();
    const url = `https://ecos.bok.or.kr/api/StatisticSearch/${ECOS_KEY}/json/kr/1/10/${code}/${period}/${start}/${end}/${item}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const json = await r.json();
    const rows = json?.StatisticSearch?.row;
    if (!rows?.length) return null;
    rows.sort((a, b) => String(b.TIME).localeCompare(String(a.TIME)));
    const cur = parseFloat(rows[0].DATA_VALUE);
    if (isNaN(cur)) return null;
    const prv = rows[1] ? parseFloat(rows[1].DATA_VALUE) : null;
    return { price: cur, chgPct: prv != null ? ((cur - prv) / Math.abs(prv)) * 100 : null, prev: prv, date: rows[0].TIME, time: null };
  }

  /* ─────────────────────────────────────────
     병렬 패치 + 결과 병합
  ───────────────────────────────────────── */
  const data = {};
  const errors = {};
  let yahooOk = false;

  // 1) Yahoo 시도
  try {
    const quotes = await fetchYahoo();
    for (const q of quotes) {
      const k = Y_KEY[q.symbol];
      if (k) data[k] = { price: q.regularMarketPrice ?? null, chgPct: q.regularMarketChangePercent ?? null, prev: q.regularMarketPreviousClose ?? null, time: q.regularMarketTime ?? null };
    }
    yahooOk = Object.keys(data).length > 0;
  } catch (e) {
    console.error('Yahoo failed:', e.message);
    errors.yahoo = e.message;
  }

  // 2) Yahoo 실패 심볼 → FRED 일간 폴백
  const missingMarket = FRED_MARKET.filter(m => !data[m.key]);
  await Promise.allSettled(missingMarket.map(async m => {
    try { const d = await fetchFred(m.series); if (d) data[m.key] = d; }
    catch (e) { errors['fred_market_' + m.key] = e.message; }
  }));

  // 3) FRED 통화·금리 + ECOS 한국 — 항상 패치
  await Promise.allSettled([
    ...FRED_MONETARY.map(async s => {
      try { const d = await fetchFred(s); if (d) data[s] = d; }
      catch (e) { errors['fred_' + s] = e.message; }
    }),
    ...ECOS_CALLS.map(async c => {
      try { const d = await fetchEcos(c.code, c.period, c.item); if (d) data[c.key] = d; }
      catch (e) { errors['ecos_' + c.key] = e.message; }
    }),
  ]);

  res.status(200).json({
    ok: Object.keys(data).length > 0,
    data,
    errors,
    ts: Date.now(),
    sources: { yahoo: yahooOk, fred: !!FRED_KEY, ecos: !!ECOS_KEY },
  });
};
