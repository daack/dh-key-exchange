# Diffie Hellman Key Exchange :key:
[![Build Status](https://travis-ci.org/daack/dh-key-exchange.svg?branch=master)](https://travis-ci.org/daack/dh-key-exchange)

Diffie Hellman key exchange framework

* [Install](#install)
* [Example](#example)
* [API](#api)

<a name="install"></a>

## Install

To install diffie-hellman-key-exchange, simply use npm:

```
npm install diffie-hellman-key-exchange --save
```

<a name="example"></a>

## Example

### Alice

```javascript
const Dh = require('diffie-hellman-key-exchange')

const alice = Dh('alice', {
  prime: 'prime',
  listen: 8000,
  log_level: 'info',
  apps: {
    'bob': {
      host: '127.0.0.1',
      port: '8001'
    }
  }
})

// on incoming message

const decrypted = alice.decrypt('bob', message)
```

### Bob

```javascript
const Dh = require('diffie-hellman-key-exchange')

const bob = Dh('bob', {
  prime: 'prime',
  listen: 8001,
  apps: {
    'alice': {
      host: '127.0.0.1',
      port: '8000'
    }
  }
})

if (bob.getAppPublicKey('alice')) {
  const message = this.encrypt('alice', 'hello')

  // send message
} else {
  bob.initalizeSession('alice', function(err, secret) {
    const message = this.encrypt('alice', 'hello')

    // send message
  })
}
```

### Swimming Bob

```javascript
const Swim = require('swim')
const Dh = require('diffie-hellman-key-exchange')

const swim = new Swim({
    local: {
        host: 'my_host:port',
        meta: {
          // must have this object in order to communicate my connection info
          dh: {
            name: 'bob',
            host: 'my_host',
            port: 8001
          }
        }
    }
})

swim.bootstrap(hostsToJoin)

const bob = Dh('bob', {
  prime: 'prime',
  listen: 8001,
  apps: swim // it will load all the app from swim
})
```

<a name="api"></a>

## API

  * <a href="#constructor"><code><b>Dh()</b></code></a>
  * <a href="#createDH"><code>instance.<b>createDH()</b></code></a>
  * <a href="#generateNewKeys"><code>instance.<b>generateNewKeys()</b></code></a>
  * <a href="#initalizeSession"><code>instance.<b>initalizeSession()</b></code></a>
  * <a href="#addApp"><code>instance.<b>addApp()</b></code></a>
  * <a href="#setAppPublicKey"><code>instance.<b>setAppPublicKey()</b></code></a>
  * <a href="#getAppPublicKey"><code>instance.<b>getAppPublicKey()</b></code></a>
  * <a href="#encrypt"><code>instance.<b>encrypt()</b></code></a>
  * <a href="#decrypt"><code>instance.<b>decrypt()</b></code></a>
  * <a href="#dh"><code>instance.<b>dh</b></code></a>
  * <a href="#crypter"><code>instance.<b>crypter</b></code></a>

-------------------------------------------------------
<a name="constructor"></a>

### Dh(app_name, opts)

Creates a new instance of Dh.

* `app_name`, the unique name of this app
* `opts`
  * `prime`, the prime for DH
  * `generator`, the generator for DH
  * `listen`, on which port the application will listen for the handshake public key exchange [default: 8000]
  * `log_level`, log level for the <a target="_blank" href="https://www.npmjs.com/package/pino">pino</a> instance [default: warn]
  * `crypter`
    * `algorithm`, algorithm used to encrypt [default: aes-256-ctr]
  * `apps`, could be a <a target="_blank" href="https://www.npmjs.com/package/swim">Swim</a> instance or object that contains all the apps [es: 'bob': { host: '127.0.0.1', port: 8000 } ]

-------------------------------------------------------
<a name="createDH"></a>

### instance.createDH()

Set a new DH instance, available by the dh attribute. [es: instance.dh]

-------------------------------------------------------
<a name="generateNewKeys"></a>

### instance.generateNewKeys()

Generate a new pair of keys

-------------------------------------------------------
<a name="initalizeSession"></a>

### instance.initalizeSession(other_app_name, cb)

Initialize the public key (each other) in order to start the communication

* `other_app_name`, app that i want to communicate
* `cb`, function(err, secret_key) { assert.ok(this instanceof Dh) }

-------------------------------------------------------
<a name="addApp"></a>

### instance.addApp(app_name, opts)

Add one app connection to che instance configuration

* `app_name`
* `opts`, [es: 'bob': { host: '127.0.0.1', port: 8000 } ]

-------------------------------------------------------
<a name="setAppPublicKey"></a>

### instance.setAppPublicKey(app_name, public_key)

Set the public key for the specified app

* `app_name`
* `public_key`, [type: 'hex']

-------------------------------------------------------
<a name="getAppPublicKey"></a>

### instance.getAppPublicKey(app_name)

Return the public key if present

* `app_name`

-------------------------------------------------------
<a name="encrypt"></a>

### instance.encrypt(app_name, data)

Encrypt data for the given app name

* `app_name`
* `data`, [type: 'string']

-------------------------------------------------------
<a name="decrypt"></a>

### instance.decrypt(app_name, data)

Decrypt data with the public key of the given app name

* `app_name`
* `data`, [type: 'string']

-------------------------------------------------------
<a name="dh"></a>

### instance.dh

Attribute with the DH nodejs crypto <a target="_blank" href="https://nodejs.org/api/crypto.html#crypto_class_diffiehellman">class</a>

-------------------------------------------------------
<a name="crypter"></a>

### instance.crypter

Attribute with the Crypter class

Methods:
* `encrypt(data, secret)`
* `decrypt(data, secret)`
