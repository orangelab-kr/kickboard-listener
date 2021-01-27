# 🛴 킥보드 리스너

킥보드의 상태값을 받아, DynamoDB 에 저장하는 서비스입니다.

시작 전, 아래와 같은 환경 변수를 설정해야 합니다.

```
SENTRY_DSN= < SENTRY DSN 주소 >

KICKBOARD_SERVICE_HOSTNAME= < 킥보드 서비스 호스트 주소 >
KICKBOARD_SERVICE_USERNAME= < 킥보드 서비스 사용자 이름 >
KICKBOARD_SERVICE_PASSWORD= < 킥보드 서비스 비밀번호 >
KICKBOARD_SERVICE_VHOST= < 킥보드 서비스 가상 호스트 >
KICKBOARD_SERVICE_QUEUE= < 킥보드 서비스 큐 >

AWS_REGION= < AWS 가용 구역 >
AWS_ACCESS_KEY_ID= < AWS 어세스 키 >
AWS_SECRET_ACCESS_KEY= < AWS 시크릿 키>
```
