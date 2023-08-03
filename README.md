# About

Blueflake is unique id generator.  
Inspired by twitter snowslake.  

blueflakeはユニークなIDジェネレーターです。  
twitterのsnowflakeを参考にしています。  

# Usage

```
$ cdk deploy
$ curl https://*****.cloudfront.net/v1/sequence
> 1199852995895297
```

# 特徴
 - 時系列順でのソートが可能です
 - 64bit数値型のため多くのプログラミング言語で利用可能です
 - 1ミリ秒あたり最大400万ID程度まで同時に採番できることを想定しています

# 採番ルール
IDの内部的なフォーマットは以下で生成しています。

```
0 + タイムスタンプ部分(41bit) + ランダムキー(10bit) + シーケンス番号(12bit)
```
 - `0`：符号を表すため先頭は0固定
 - `タイムスタンプ部分`：現在のUnixTimeStamp - 基準日のUnixTimeStamp
 - `ランダムキー`：1から1024のランダムな整数値
 - `シーケンス番号`：1から4096でカウントするシーケンス番号

## タイムスタンプ部分
基準日（`2023/07/30 00:00:00.000` としています）からの差分の数値だけ記録すればよいため、先頭23ビットを切り捨てています。
現在の基準日から41ビットで表せる最大の時刻は `2093-04-04T06:47:35.551Z` （JST：`2093/04/04/15:47:35.551`）のため、60年程度運用できる想定です。（最大の差分をUnixTimeStamp値にすると`2199023255551`）

## ランダムキー部分
ミリ秒あたりで同時アクセスがあった場合にランダムなキーを割り当てて、衝突を防ぐ役割のキーになります。

## シーケンス番号部分
DynamoDBで管理する予定の番号です。タイムスタンプ + ランダムキーでも衝突があった場合にDB側のアイテムで採番するシーケンス番号になります。

実装のPRは下記です。
https://github.com/hasegawa/blueflake/pull/2

# AWS CDKのcommand
* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template