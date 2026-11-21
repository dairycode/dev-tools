import MD5 from 'crypto-js/md5'
import SHA1 from 'crypto-js/sha1'
import SHA256 from 'crypto-js/sha256'
import SHA512 from 'crypto-js/sha512'

const algorithms = { md5: MD5, sha1: SHA1, sha256: SHA256, sha512: SHA512 }
export type HashAlgorithm = keyof typeof algorithms

export function calculateHash(text: string, algorithm: HashAlgorithm, trimInput = true): string {
  return algorithms[algorithm](trimInput ? text.trim() : text).toString()
}
