"""강의 데이터(lessons.js) 끝에 오늘 강의 2개를 추가한다.

사용법:
  python .claude/scripts/add_lessons.py <lessons.js 조각> <YYYY-MM-DD> "<첫 강의 제목 짧게>"

<lessons.js 조각> 형식 (새 강의 객체 2개를 쉼표로 이어 쓴 조각, 앞뒤 대괄호 없음):
  {
    num: 158,
    date: '2026-11-02',
    ...
  },
  {
    num: 159,
    ...
  }

날짜별 기본 강의는 date 필드로 정해지므로(그날 첫 강의) 따로 지정할 것은 없다.
"""
import re
import sys

DATA = 'lessons.js'


def main():
    lessons_path, day, label = sys.argv[1], sys.argv[2], sys.argv[3]
    s = open(DATA, encoding='utf-8', newline='').read()
    nl = '\r\n' if '\r\n' in s else '\n'
    s = s.replace('\r\n', '\n')
    new = open(lessons_path, encoding='utf-8').read().replace('\r\n', '\n').strip().rstrip(',')
    nums = [int(n) for n in re.findall(r'^\s*num:\s*(\d+),', new, re.M)]
    assert len(nums) == 2, f'강의는 정확히 2개여야 합니다 (발견: {nums})'
    assert len(re.findall(rf"^\s*date:\s*'{day}',", new, re.M)) == 2, '두 강의의 date가 모두 오늘 날짜여야 합니다'
    assert not re.search(rf"^\s*date:\s*'{day}',", s, re.M), f'{day} 강의가 이미 있습니다 (중복 실행?)'

    end = s.rindex('\n];')
    body = new.replace('\n', '\n  ')
    insert = f',\n\n  // ── {nums[0]}강·{nums[1]}강 ({day}) {label} ' + '─' * 20 + f'\n  {body}'
    last_close = s.rindex('}', 0, end) + 1  # 마지막 강의 객체의 닫는 중괄호 뒤
    s = s[:last_close] + insert + s[last_close:]
    open(DATA, 'w', encoding='utf-8', newline='').write(s.replace('\n', nl))
    print(f'ok: {nums[0]}강·{nums[1]}강 추가 ({day})')


if __name__ == '__main__':
    main()
