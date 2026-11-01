"""일일학습 페이지에 오늘 강의 2개를 추가하고 날짜별 강의 지정을 갱신한다.

사용법:
  python .claude/scripts/add_lessons.py <lessons.js> <YYYY-MM-DD> "<첫 강의 제목 짧게>"

<lessons.js> 형식 (새 강의 객체 2개를 쉼표로 이어 쓴 조각, 앞뒤 대괄호 없음):
  {
    num: 158,
    date: '2026-11-02',
    ...
  },
  {
    num: 159,
    ...
  }

동작:
  1) LESSONS 배열 끝(마지막 강의 뒤)에 강의 2개를 붙인다.
  2) DATE_LESSON_OVERRIDES의 모든 'LESSONS.length - N'을 N+2로 바꾼다 (강의 2개가 늘었으므로).
  3) 오늘 날짜를 'LESSONS.length - 2'(오늘 첫 강의)로 지정한다.
"""
import re
import sys

PAGE = '부동산_일일학습_2026.html'


def main():
    lessons_path, day, label = sys.argv[1], sys.argv[2], sys.argv[3]
    s = open(PAGE, encoding='utf-8').read()
    new = open(lessons_path, encoding='utf-8').read().strip().rstrip(',')
    nums = [int(n) for n in re.findall(r'^\s*num:\s*(\d+),', new, re.M)]
    assert len(nums) == 2, f'강의는 정확히 2개여야 합니다 (발견: {nums})'
    assert f"'{day}'" in new, '강의 date 필드가 오늘 날짜와 다릅니다'
    assert f"'{day}':" not in s, f'{day} 강의가 이미 지정되어 있습니다 (중복 실행?)'

    start = s.index('const LESSONS')
    end = s.index('\n];', start)
    body = new.replace('\n', '\n  ')
    insert = f',\n\n  // ── {nums[0]}강 ' + '─' * 60 + f'\n  {body}'
    # 마지막 강의 객체의 닫는 중괄호 뒤에 붙임
    last_close = s.rindex('}', start, end) + 1
    s = s[:last_close] + insert + s[last_close:]

    ostart = s.index('const DATE_LESSON_OVERRIDES = {')
    oend = s.index('};', ostart)
    block = s[ostart:oend]

    def bump(m):
        text = f'LESSONS.length - {int(m.group(1)) + 2},'
        return text.ljust(max(len(m.group(0)), len(text) + 1))

    block = re.sub(r'LESSONS\.length - (\d+), *', bump, block)
    block = block.rstrip() + f"\n  '{day}': LESSONS.length - 2,   // {nums[0]}강: {label}\n"
    s = s[:ostart] + block + s[oend:]
    open(PAGE, 'w', encoding='utf-8', newline='').write(s)
    print(f'ok: {nums[0]}강·{nums[1]}강 추가, {day} → {nums[0]}강')


if __name__ == '__main__':
    main()
