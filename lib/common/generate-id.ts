/**
 * どの実行環境でもJSTの現在時刻を取得する
 * @returns
 */
export function getNowDate() {
  // 実行環境によってタイムゾーンが違う可能性があるため、どのタイムゾーンでもJSTの現在時刻を計算に使用する
  const nowTimeStamp = Date.now() + ((new Date().getTimezoneOffset() + 540) * 60 * 1000);
  return new Date(nowTimeStamp);
}

/**
 * Generate random key.
 * @returns
 */
export function getRandomKey() {
  return Math.floor(Math.random() * 1024 + 1);
}

/**
 * JavaScriptのシフト演算が32bit変換を行ってしまうため文字列でシフト演算する
 * ID Format(64bit): 0 + timestamp(41bit) + random key(10bit) + sequence number(12bit)
 * ex:
 *   nowUnixTimeStamp:2023/07/31 00:00:00
 *   randomKey:1
 *   sequenceNumber:1
 *   -> 0000 0000 0000 0001 0100 1001 1001 0111 0000 0000 0000 0000 0001 0000 0000 0001
 * @param nowDate
 * @param randomKey
 * @param sequenceNumber
 * @returns
 */
export function makeBlueFlakeID(nowDate: Date, randomKey: number, sequenceNumber: number) {
  // JSTの2023/7/30 00:00:00.000UnixTimeStamp（ミリ秒まで13桁）を基準とする
  const countStartTimeStamp = 1690642800000;
  // 経過時間を2進数変換後に64桁にしてからsliceで先頭23bitの切り捨て
  const timeStampBitString = (nowDate.getTime() - countStartTimeStamp).toString(2).padStart(64, "0").slice(23);
  const randomKeyBitString = randomKey.toString(2).padStart(10, "0");
  const sequenceKeyBitString = sequenceNumber.toString(2).padStart(12, "0");

  return parseInt("0" + timeStampBitString + randomKeyBitString + sequenceKeyBitString, 2);
}