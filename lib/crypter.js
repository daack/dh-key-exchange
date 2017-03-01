'use strict'

const crypto = require('crypto')

function Crypter(defaultSecret, opts) {
  if (!(this instanceof Crypter)) {
    return new Crypter(defaultSecret, opts)
  }

  this.defaultSecret = defaultSecret
  this.algorithm = opts.algorithm || 'aes-256-ctr'
}

Crypter.prototype.encrypt = function(data, secret) {
  const cipher = crypto.createCipher(this.algorithm, secret || this.defaultSecret)

  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
}

Crypter.prototype.decrypt = function(data, secret) {
  const decipher = crypto.createDecipher(this.algorithm, secret || this.defaultSecret)

  return decipher.update(data, 'hex', 'utf8') + decipher.final('utf8')
}

module.exports = Crypter