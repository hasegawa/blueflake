/**
 * Generate random key.
 * @returns
 */
export function getRandomKey() {
  return Math.floor(Math.random() * 1024 + 1);
}

/**
 * ID Format(64bit): 0 + timestamp(41bit) + random key(10bit) + sequence number(12bit)
 * ex:
 *   nowUnixTimeStamp:2023/07/31 00:00:00
 *   randomKey:1
 *   sequenceNumber:1
 *   -> 0000 0000 0000 0001 0100 1001 1001 0111 0000 0000 0000 0000 0001 0000 0000 0001
 * @param nowUnixTimeStamp
 * @param randomKey
 * @param sequenceNumber
 * @returns
 */
export function makeBlueFlakeID(nowUnixTimeStamp: number, randomKey: number, sequenceNumber: number) {
  // JSTの2023/7/30 00:00:00.000UnixTimeStamp（ミリ秒まで13桁）を基準とする
  const countStartTimeStamp = 1690642800000;
  // 経過時間を2進数変換後に64桁にしてからsliceで先頭23bitの切り捨て
  const timeStampBitString = (nowUnixTimeStamp - countStartTimeStamp).toString(2).padStart(64, "0").slice(23);
  const randomKeyBitString = randomKey.toString(2).padStart(10, "0");
  const sequenceKeyBitString = sequenceNumber.toString(2).padStart(12, "0");

  return parseInt("0" + timeStampBitString + randomKeyBitString + sequenceKeyBitString, 2);
}