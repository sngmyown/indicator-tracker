# 8축 시장 대시보드 운영 안정화 패키지

이 패키지는 현재 구현된 8축 시장 대시보드를 기능 추가 중심에서 운영 안정화 중심으로 전환하기 위한 문서 묶음입니다.

## 포함 문서

- `docs/01_stable_backup_checklist.md`  
  안정 버전 백업, GitHub ZIP 보관, Release 생성 체크리스트

- `docs/02_user_manual.md`  
  웹사이트 사용 매뉴얼, 데이터 업데이트/배포/백업/복원/주간 리포트 생성법

- `docs/03_data_source_signal_rules.md`  
  지표별 데이터 소스, 해석 기준, 신호 기준, 주의사항

- `docs/04_weekly_operations_routine.md`  
  월~일요일 시장 리서치 및 웹사이트 운용 루틴

- `docs/05_troubleshooting.md`  
  GitHub Actions 실패, JSON 오류, 배포/캐시 문제, 데이터 이상치 대응법

- `docs/06_v1_stable_release_note.md`  
  GitHub Release 또는 README에 붙여넣을 수 있는 v1 안정판 릴리즈 노트

- `docs/07_next_roadmap.md`  
  기능 추가가 아니라 운영 안정화를 중심으로 한 다음 개선 로드맵

## 권장 적용 방식

1. GitHub 저장소에 `docs` 폴더를 만든다.
2. 이 패키지의 `docs` 안 문서를 그대로 업로드한다.
3. 현재 정상 작동 중인 커밋을 기준으로 `v1.0-eight-axis-dashboard-stable` 릴리즈를 만든다.
4. 웹사이트의 백업 기능으로 전체 데이터 백업 JSON을 다운로드한다.
5. GitHub 저장소 전체를 ZIP으로 다운로드해 별도로 보관한다.

