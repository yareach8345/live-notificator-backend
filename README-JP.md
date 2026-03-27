# Live Notificator Backend

***

## ▶️ プロジェクト概要

ライブ配信通知システムのバックエンド

ライブストリーミングサービスサーバーからデータを取得してチャンネルの情報の変更を通知

## 🗓️ 開発期間
２０２５年０６月２２日〜２０２５年０８月１３日

## ⚙️ 使用技術＆ライブラリー
* typescript
* nest.js
* nestjs/schedule 
* nestjs/typeorm
* passport
* passport-google-oauth2
* MySQL

## 🔗 他のサイト
![Static Badge](https://img.shields.io/badge/notion-project-a980f7?logo=notion&logoColor=white&link=https%3A%2F%2Fwww.notion.so%2FLive-Notificator-30fad8559b2d80869161d2083afa5ed7)
![Static Badge](https://img.shields.io/badge/github-frontend-94dacc?logo=github&logoColor=white&link=https%3A%2F%2Fgithub.com%2Fyareach8345%2Flive-notificator-frontend)
![Static Badge](https://img.shields.io/badge/github-sms-5552ff?logo=github&logoColor=white&link=https%3A%2F%2Fgithub.com%2Fyareach8345%2Flive-notificator-sms)

## 使用方法
### データベースの準備
下のファイルのスクリプトを実行してテーブルを生成してください。

[sql file for initialize table](docs/sql/schema-init.sql)

※ 本スクリプトはMySQLの環境を前提にして作成されました。

### Configuration
.envファイル、あるいは環境変数を設定

```
# この環境変数に指定されたメールアドレスだけでログインができます。
ALLOWED_EMAILS=testing@test.com,testing2@test.com

GOOGLE_OAUTH2_CLIENT_ID=MY_CLIENT_OAUTH2_ID
GOOGLE_OAUTH2_CLIENT_SECRET=SECRET
GOOGLE_OAUTH2_CALLBACK_URL=http://localhost:8000/auth/google

PORT=8000

#フロントエンドのurl
CORS=http://localhost:3000

# Chzzk 連結情報
# chzzk.naver.comでログインしたあと、デベロッパーツールのApplication > Cookies > https://chzzk.naver.comで確認できます。
# この値はログインセッションの情報なので共有してはなりません。
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
| endpoint                      | method | description                    | remark                    |
|-------------------------------|--------|--------------------------------|---------------------------|
| /channels                     | GET    | チャンネルの情報を取得                    | ページング対応、または複数ID指定による取得が可能 |
| /channels                     | POST   | チャンネルを登録                       |                           |
| /channels/ids                 | GET    | チャンネルのＩＤのみ取得                   | ページングを使う                  |
| /channels/states/open         | GET    | 配信中（state=open）のチャンネルの情報を取得    |                           |
| /channels/states/close        | GET    | 配信停止中（state=close）のチャンネルの情報を取得 |                           |
| /channels/:platform/:id       | GET    | 指定したチャンネルの情報を取得                |                           |
| /channels/:platform/:id       | DELETE | チャンネルを登録解除する                   |                           |
| /channels/:platform/:id       | PATCH  | チャンネルの情報を更新する                  |                           |
| /channels/:platform/:id/state | GET    | 指定したチャンネルの配信状態と関連する配信情報を取得     |                           |
| /channels/:platform           | GET    | 指定したプラットフォームのチャンネルを取得          |                           |

### Channel Minimal
デバイスからの情報取得のためのエンドポイントリスト
デバイスの処理負荷および通信量を抑えるため、最小限のデータのみを返却する。

| endpoint                              | method | description                        | remark                    |
|---------------------------------------|--------|------------------------------------|---------------------------|
| /channels/minimal                     | GET    | チャンネルの最小限の情報を取得                    | ページング対応、または複数ID指定による取得が可能 |
| /channels/minimal/states/open         | GET    | 配信中（state=open）のチャンネルの最小限の情報を取得    |                           |
| /channels/minimal/states/close        | GET    | 配信停止中（state=close）のチャンネルの最小限の情報を取得 |                           |
| /channels/minimal/:platform/:id       | GET    | 指定したチャンネルの最小限の情報を取得                |                           |
| /channels/minimal/:platform/:id/state | GET    | 指定したチャンネルの配信状態と関連する配信情報を取得         |                           |

### Device
| endpoint                      | method | description             | remark                |
|-------------------------------|--------|-------------------------|-----------------------|
| /devices                      | GET    | デバイスのリストを取得             |                       |
| /devices                      | POST   | デバイスを登録                 |                       |
| /devices/auth-test            | GET    | デバイスの認証をテストするためのエンドポイント | デバイス開発の際のテスト用, 削除予定   |
| /devices/:deviceId            | GET    | デバイス詳細を取得               |                       |
| /devices/:deviceId            | PATCH  | デバイスの情報更新               |                       |
| /devices/:deviceId            | DELETE | デバイスの登録解除               |                       |
| /devices/:deviceId/usable     | PATCH  | デバイスのバックエンドアクセス可否を更新    |                       |
| /devices/:deviceId/secret-key | PATCH  | デバイスのシークレットキーを再発行       | ランダムに生成された新しいキーに更新される |

### SSE
| endpoint         | method | description                  | remark  |
|------------------|--------|------------------------------|---------|
| /sse/connections | GET    | SSE連結リスト                     |         |
| /sse/test        |        | SSEで連結されているクライアントへテストメッセージ発信 | 開発後削除予定 |

## SSE
### Connect
SSE connect url: /sse/connect
接続の時、認証用ヘッダが必要です。

eventsource-clientライブラリーを使う際のオプションの例
```typescript
const sseConnectOption = {
    url: getBackendUrl('/sse/connect'),
    credentials: 'include'
}
```

### Events
sseのデータの形式は次のようなJSONです。
```json
{
  "topic": "topic",
  "payload": "payload"
}
```

発信するtopicとpayloadは次のようです

| topic                              | payload                  | remark                                 |
|------------------------------------|--------------------------|----------------------------------------|
| channel/:platform/:id/info-changed | 変更されたフィールドのみを含むJSONペイロード |                                        |
| channel/:platform/:id/state        | チャンネルの状態                 | open, close, add, deleteイベント種別を配信      |
| channel/:platform/:id/image        | "changed" という固定文字列       | 画像データは含まず、更新通知のみを配信する                  |
| refreshed-at                       | リフレッシュ実行時刻               | データ変更の有無に関わらず、スケジューラーによるリフレッシュ処理実行時に配信 |
| updated-at                         | 更新時刻                     | 実際にデータが変更された場合にのみ配信                    |
