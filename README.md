# Live Notificator Backend

일본어 문서는 아래 파일음 참고해주세요.

日本語の文書はこちらのファイルをご覧ください。
[日本語の文書](README-JP.md)

***

## ▶️ 프로젝트 개요

라이브 방송 통지 시스템의 백엔드

라이브 방송 서비스의 서버에서 데이터를 취득 후 채널 정보 및 상태의 변화를 통지

## 🗓️ 개발기간
2025년 06월 22일 ~ 2025년 08월 13일

## ⚙️ 사용기술 & 라이브러리
* typescript
* nest.js
* nestjs/schedule 
* nestjs/typeorm
* passport
* passport-google-oauth2
* MySQL

## 🔗 참조할 사이트
![Static Badge](https://img.shields.io/badge/notion-project-a980f7?logo=notion&logoColor=white&link=https%3A%2F%2Fwww.notion.so%2FLive-Notificator-30fad8559b2d80869161d2083afa5ed7)
![Static Badge](https://img.shields.io/badge/github-frontend-94dacc?logo=github&logoColor=white&link=https%3A%2F%2Fgithub.com%2Fyareach8345%2Flive-notificator-frontend)
![Static Badge](https://img.shields.io/badge/github-sms-5552ff?logo=github&logoColor=white&link=https%3A%2F%2Fgithub.com%2Fyareach8345%2Flive-notificator-sms)

## 사용방법
### 데이터 베이스 준비
아래의 파일의 스크립트를 실행시켜 테이블을 생성시켜주세요.

[sql file for initialize table](docs/sql/schema-init.sql)

※ 본스크립트는 MySql 사용을 전제로 작성되었습니다.

### Configuration
.env 파일 혹은 환경변수를 설정

```
# 이 환경변수에 지정한 메일주소로만 로그인이 가능
ALLOWED_EMAILS=testing@test.com,testing2@test.com

GOOGLE_OAUTH2_CLIENT_ID=MY_CLIENT_OAUTH2_ID
GOOGLE_OAUTH2_CLIENT_SECRET=SECRET
GOOGLE_OAUTH2_CALLBACK_URL=http://localhost:8000/auth/google

PORT=8000

# 프론트엔드 url주소
CORS=http://localhost:3000

# Chzzk 연결정보
# chzzk.naver.com에 로그인한 후, 개발자도구의 Application > Cookies > https://chzzk.naver.com에서 확인할 수 있습니다.
# 이 값은 로그인 세션의 정보임으로 공유해서는 안됩니다.
NID_AUT=your_nid_aut
NID_SES=your_nid_ses

IMAGE_SIZES=100,200,300

DB_TYPE=db
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=chzzk_notification

MQTT_URL=mqtt://localhost
MQTT_BASE_TOPIC=chzzk-notification

YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY
```

## Endpoints
### Channel
| endpoint                      | method | description                     | remark                                 |
|-------------------------------|--------|---------------------------------|----------------------------------------|
| /channels                     | GET    | 채널정보취득                          | 페이징 사용가능하며, 복수의 id를 사용해 데이터를 얻어올 수 있다. |
| /channels                     | POST   | 채널정보등록(모니터링할 채널 추가)             |                                        |
| /channels/ids                 | GET    | 채널들의 id만 취득                     | 페이징 사용가능                               |
| /channels/states/open         | GET    | 방송중인（state=open）채널의 정보만 취득      |                                        |
| /channels/states/close        | GET    | 방송중이지 않은（state=close）채널의 정보만 취득 |                                        |
| /channels/:platform/:id       | GET    | 지정한 채널의 정보만 취득                  |                                        |
| /channels/:platform/:id       | DELETE | 채널등록을 해제함                       |                                        |
| /channels/:platform/:id       | PATCH  | 채널정보를 갱신함                       |                                        |
| /channels/:platform/:id/state | GET    | 지정한 채널의 발생상태와 연관된 정보를 취득함       |                                        |
| /channels/:platform           | GET    | 지정한 플랫폼의 채널을 취득                 |                                        |

### Channel Minimal
디바이스에서 정보취득시 사용할 엔드포인트 목록
임베디드 장치의 성능의 한계를 고려해 의해 최소한의 데이터만 반환함

| endpoint                              | method | description                           | remark                   |
|---------------------------------------|--------|---------------------------------------|--------------------------|
| /channels/minimal                     | GET    | 최소한의 채널 정보를 취득                        | 페이징 및 복수의 id로 채널 얻어오기 가능 |
| /channels/minimal/states/open         | GET    | 방송중인(state=open) 채널의 최사한의 정보를 취득      |                          |
| /channels/minimal/states/close        | GET    | 방송중이지 않은(state=close) 채널의 최소한의 정보를 취득 |                          |
| /channels/minimal/:platform/:id       | GET    | 지정한 채널의 최소한의 정보를 얻어옴                  |                          |
| /channels/minimal/:platform/:id/state | GET    | 지정한 채널의 방송상태와 그와 연관된 정보를 얻어옴          |                          |

### Device
| endpoint                      | method | description                             | remark                  |
|-------------------------------|--------|-----------------------------------------|-------------------------|
| /devices                      | GET    | 등록된 디바이스 목록 취득                          |                         |
| /devices                      | POST   | (이 서버로 부터 데이터취득이 가능한) 디바이스 등록           |                         |
| /devices/auth-test            | GET    | 디바이스의 인증을 테스트하기 위한 엔드포인트                | 디바이스 개발시 테스트용. 삭제가능성 있음 |
| /devices/:deviceId            | GET    | 디바이스 상세 정보를 취득                          |                         |
| /devices/:deviceId            | PATCH  | 디바이스 정보 갱신                              |                         |
| /devices/:deviceId            | DELETE | 디바이스 등록 해제                              |                         |
| /devices/:deviceId/usable     | PATCH  | 디바이스의 백엔드 접근 가능여부를 설정                   |                         |
| /devices/:deviceId/secret-key | PATCH  | 디바이스의 SecretKey를 재발행                    | 랜덤생성된 새로운 키로 공신한다       |

### SSE
| endpoint         | method | description                            | remark    |
|------------------|--------|----------------------------------------|-----------|
| /sse/connections | GET    | SSE연결 리스트                              |           |
| /sse/test        |        | SSE에 연결된 클라이언트에 테스트 메시지를 발신            | 개발 후 삭제예정 |

## SSE
### Connect
SSE connect url: /sse/connect
접속시 인증헤더를 설정해야 함

eventsource-client라이브러리를 사용시 아래와 같이 옵션을 설정함
```typescript
const sseConnectOption = {
    url: getBackendUrl('/sse/connect'),
    credentials: 'include'
}
```

### Events
sse 데이터형은 아래와 같은 JSON
```json
{
  "topic": "topic",
  "payload": "payload"
}
```

발신하는 topic과 payload는 다음과 같다.

| topic                              | payload               | remark                                       |
|------------------------------------|-----------------------|----------------------------------------------|
| channel/:platform/:id/info-changed | 갱신된 필드를 포함한 JSON 페이로드 |                                              |
| channel/:platform/:id/state        | 새로운 채널의 정보            | open, close, add, delete이벤트 종류를 발신           |
| channel/:platform/:id/image        | "changed" 라는 고정된 문자열  | 변경된 데이터가 포함되지 않고 변경만을 통지함                    |
| refreshed-at                       | 리프레시 알림               | 데이터의 변경 유무와는 별개로, 스케쥴러에 의한 갱신 작업이 이루어 졌음을 알림 |
| updated-at                         | 업데이트 알림               | 실제 데이터가 갱신되었을 때 발신                           |
