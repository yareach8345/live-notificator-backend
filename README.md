# Live Notificator Backend

***

## ▶️ プロジェクト概要

ライブ配信通知システムのバックエンド

ライブストリーミングサービスサーバーからデータを取得してチャンネルの情報の変更を通知

## 🗓️ 開発期間
２０２５年０６月２２日〜２０２５年０８月１３日

## ⚙️ 使用記述＆ライブラリー
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