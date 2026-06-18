# 01. 안정 버전 백업 / 릴리즈 보존 체크리스트

## 목적

현재 정상 작동하는 8축 시장 대시보드를 하나의 안정판으로 고정한다. 이후 수정 중 문제가 생겨도 이 버전으로 되돌아갈 수 있어야 한다.

## 안정 버전 이름

```text
v1.0-eight-axis-dashboard-stable
```

## 1. 웹사이트 기능 최종 확인

아래 기능이 정상 작동하는지 확인한다.

```text
- 8축 보기
- 선행/동행/후행 보기
- 현재값 강조 표시
- 긍정/중립/부정 색상 표시
- 골디락스 존 표시
- 8축 실시간 스코어
- 시나리오 대응 계획
- 수동 입력 패널
- 포트폴리오 자산 배분 파이차트
- 포트폴리오 보유 자산 수정/삭제
- 백업/복원
- 체크리스트 완료 기록
- 월간 캘린더
- 경제 이벤트 직접 등록
- FactSet + Investing.com 뉴스 3개 + 8축 신호 기반 주간 리포트 생성
```

## 2. 웹사이트 데이터 백업

웹사이트에서 다음 경로로 이동한다.

```text
To do / 점검
→ 백업 · 복원
→ 전체 데이터 백업
```

다운로드한 파일은 아래 이름 형식으로 보관한다.

```text
market-dashboard-full-backup-YYYY-MM-DD.json
```

보관 위치 예시:

```text
내 문서 / 투자 / 8축 대시보드 백업 /
```

## 3. GitHub 저장소 ZIP 백업

GitHub 저장소에서 다음 순서로 다운로드한다.

```text
Code
→ Download ZIP
```

파일명 예시:

```text
indicator-tracker-v1.0-stable-YYYY-MM-DD.zip
```

## 4. 현재 커밋 기준점 기록

GitHub 저장소에서 현재 정상 작동 커밋 해시를 확인한다.

```text
GitHub repo
→ Code
→ Commits
→ 최신 커밋 해시 복사
```

아래 형식으로 기록한다.

```text
Stable version: v1.0-eight-axis-dashboard-stable
Commit hash: [여기에 커밋 해시]
Date: YYYY-MM-DD
Status: 정상 작동 확인
```

## 5. GitHub Release 생성 권장

GitHub에서 다음 경로로 이동한다.

```text
Repo
→ Releases
→ Draft a new release
```

입력값:

```text
Tag: v1.0-eight-axis-dashboard-stable
Release title: v1.0 Eight Axis Market Dashboard Stable
Description: docs/06_v1_stable_release_note.md 내용 붙여넣기
```

## 완료 기준

아래 3개가 모두 있으면 1순위 안정화 완료다.

```text
- 웹사이트 전체 데이터 백업 JSON
- GitHub 저장소 ZIP 백업
- v1.0 안정판 커밋/릴리즈 기록
```
