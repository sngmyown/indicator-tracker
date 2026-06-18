# 05. 오류 대응 매뉴얼

## 1. 웹사이트 숫자가 안 바뀔 때

가능한 원인:

```text
- 데이터 업데이트는 됐지만 배포를 안 함
- 브라우저 캐시 문제
- data/latest.json은 바뀌었지만 GitHub Pages가 이전 파일을 보여줌
```

대응 순서:

```text
1. GitHub에서 data/latest.json 직접 확인
2. Actions → Deploy static dashboard to GitHub Pages → Run workflow
3. 배포 완료 후 Ctrl + F5
4. 그래도 안 되면 웹사이트의 /data/latest.json 직접 확인
```

## 2. GitHub Actions 데이터 업데이트 실패

경로:

```text
Actions
→ Update market dashboard data
→ 실패한 실행 클릭
→ 실패한 step 로그 확인
```

확인할 것:

```text
- Python 에러 메시지
- 특정 데이터 소스 접속 실패
- JSON 생성 실패
- Git push conflict
```

## 3. JSON 오류

대표 오류:

```text
Unexpected token 'i', "import csv"... is not valid JSON
```

원인:

```text
Python 코드를 data/latest.json에 잘못 붙여넣은 경우
```

정상 파일 구분:

```text
scripts/update_market_data.py → Python 코드

data/latest.json → JSON 데이터만

app.js → JavaScript 코드
```

절대 금지:

```text
scripts/update_market_data.py 내용을 data/latest.json에 붙여넣기
```

## 4. Deploy는 성공했는데 화면이 그대로일 때

대응:

```text
1. Ctrl + F5
2. 브라우저 캐시 삭제
3. 시크릿 창에서 접속
4. GitHub Pages 배포 완료 시간 확인
5. /data/latest.json 직접 열어 현재 값 확인
```

## 5. 특정 지표 색깔이 이상할 때

점검 순서:

```text
1. data/latest.json에서 해당 지표의 signal 확인
2. signal이 틀렸으면 scripts/update_market_data.py 판정 로직 문제
3. signal은 맞는데 화면 색이 틀리면 app.js 표시 문제
4. 데이터 값 자체가 틀리면 데이터 소스/계열 문제
```

## 6. PPI 값이 뉴스와 다를 때

확인:

```text
Final Demand PPI 기준인지 확인
All Commodities PPI(PPIACO)를 쓰면 headline PPI와 다르게 나올 수 있음
```

## 7. ETF 흐름 값이 이상하게 클 때

원인:

```text
ETF 가격 자체를 퍼센트로 표시한 경우
```

정상 기준:

```text
ETF 가격 변화율(%) 프록시
```

## 8. VIX 선물 구조가 이상할 때

현재 기준:

```text
VIX/VXV 변동성 만기구조 프록시
```

주의:

```text
실제 VIX futures 1개월/2개월 곡선이 아니라 프록시다.
```

## 9. Git push conflict 발생 시

대표 오류:

```text
CONFLICT (content): Merge conflict in data/latest.json
```

대응:

```text
1. workflow가 no-conflict 버전인지 확인
2. 동시에 여러 업데이트를 실행하지 않기
3. 실패한 workflow를 다시 실행
4. 계속 실패하면 update-market-data workflow 파일 점검
```

## 10. 문제 보고 시 필요한 정보

문제가 생기면 아래 정보를 기록한다.

```text
- 어떤 화면에서 문제인지
- 어떤 지표인지
- 현재 표시값
- 기대 표시값
- data/latest.json의 해당 지표 내용
- GitHub Actions 실패 로그
- 마지막으로 교체한 파일명
```
