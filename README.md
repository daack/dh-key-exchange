# Diffie Hellman Key Exchange :key:

Diffie Hellman key exchange framework

* [Install](#install)
* [Example](#example)

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
  bob.initalizeSession('alice', function(secret) {
    const message = this.encrypt('alice', 'hello')

    // send message
  })
}
```