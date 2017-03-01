'use strict'

const crypto = require('crypto')
const net = require('net')
const split2 = require('split2')

const Crypter = require('./lib/crypter')

function Dh(app, opts) {
  if (!(this instanceof Dh)) {
    return new Dh(app, opts)
  }

  if (!app) {
    throw new Error('App name missing')
  }

  this.app = app
  this.apps = opts.apps || {}

  this.createDH(opts.prime, opts.generator)
  this.dh.generateKeys()

  this.crypter = Crypter(this.dh.getPrime('hex'), opts.crypter || {})

  this.listen(opts.listen || 8000)
}

Dh.prototype.createDH = function(prime, generator) {
  if (typeof prime == 'number') {
    this.createDH = () => {
      return this.dh = crypto.createDiffieHellman(prime, generator)
    }
  } else {
    const prime_encoding = prime instanceof Buffer ? null : 'hex'
    const generator_encoding = generator instanceof Buffer ? null : 'hex'

    this.createDH = () => {
      return this.dh = crypto.createDiffieHellman(prime, prime_encoding, generator, generator_encoding)
    }
  }

  return this.createDH()
}

Dh.prototype.listen = function(port) {
  net.createServer((socket) => {
    socket
    .pipe(split2(JSON.parse))
    .on('data', (data) => {
      const app_name = data.app ? this.crypter.decrypt(data.app) : null

      if (app_name && this.setAppPublicKey(app_name, data.public_key)) {
        socket.write(ndj({
          app: this.crypter.encrypt(this.app),
          public_key: this.dh.getPublicKey('hex')
        }))
      }

      socket.end()
    })
  }).listen(port)
}

Dh.prototype.initalizeSession = function(app_name, cb) {
  const app = this.apps[app_name]

  if (!app) {
    throw new Error('app: ' + app_name + ' does not exist')
  }

  const socket = new net.Socket()

  socket.connect(app.port, app.host, () => {
    socket.write(ndj({
      app: this.crypter.encrypt(this.app),
      public_key: this.dh.getPublicKey('hex')
    }))
  })

  socket
  .pipe(split2(JSON.parse))
  .on('data', (data) => {
    const app_name = data.app ? this.crypter.decrypt(data.app) : null

    if (app_name) {
      this.setAppPublicKey(app_name, data.public_key)
    }

    socket.destroy()
  })

  socket.on('close', () => {
    const public_key = this.getAppPublicKey(app_name)
    const secret = public_key ? this.dh.computeSecret(public_key, 'hex', 'hex') : false

    cb.call(this, secret)
  })
}

Dh.prototype.setAppPublicKey = function(app_name, public_key) {
  const app = this.apps[app_name]

  if (app) {
    this.apps[app_name]['public_key'] = public_key

    return true
  }

  return false
}

Dh.prototype.getAppPublicKey = function(app_name) {
  const app = this.apps[app_name]

  if (app) {
    return this.apps[app_name]['public_key']
  }

  return false
}

Dh.prototype.computeAppSecret = function(app_name) {
  const app = this.apps[app_name] || {}
  const public_key = app['public_key']

  return public_key ? this.dh.computeSecret(public_key, 'hex', 'hex') : false
}

Dh.prototype.encrypt = function(app_name, data) {
  const secret = this.computeAppSecret(app_name)

  return secret ? this.crypter.encrypt(data, secret) : null
}

Dh.prototype.decrypt = function(app_name, data) {
  const secret = this.computeAppSecret(app_name)

  return secret ? this.crypter.decrypt(data, secret) : null
}

function ndj(json) {
  return JSON.stringify(json) + '\n'
}

module.exports = Dh
