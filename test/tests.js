const chai = require('chai')
const Dh = require('./../dh')

Dh.prototype.listen = (port) => {

}

function newIstance(apps) {
  return Dh('test_app', {
    prime: 256,
    listen: 8000,
    apps: apps || {}
  })
}

describe('Dh', function() {
  describe('new istance', function() {
    it('should instanciate a new Dh instance', function() {
      chai.expect(newIstance()).to.be.an.instanceof(Dh)
    })

    it('should raise an error if app missing', function() {
      chai.expect(() => {
        Dh()
      }).to.throw(Error)
    })

    it('should raise an error if prime missing', function() {
      chai.expect(() => {
        Dh('test_app')
      }).to.throw(Error)
    })

    it('should raise an error if it try to connect to unkown app', function() {
      chai.expect(() => {
        newIstance().initializeSession('foo')
      }).to.throw(Error)
    })
  })
})

describe('Diffie Hellman', function() {
  describe('key generation', function() {
    it('should generate public key', function() {
      chai.expect(newIstance().dh.getPublicKey()).to.be.an.instanceof(Buffer)
    })

    it('should generate private key', function() {
      chai.expect(newIstance().dh.getPrivateKey()).to.be.an.instanceof(Buffer)
    })

    it('should generate a new private key', function() {
      let base = newIstance()
      let old_key = base.dh.getPublicKey('hex')

      base.createDH()
      base.dh.generateKeys()
      let new_key = base.dh.getPublicKey('hex')

      chai.expect(old_key).to.be.not.equal(new_key)
    })
  })

  describe('compute secret', function() {
    it('should compute the same secret', function() {

      let base = Dh('base', {
        prime: 256
      })

      let alice = Dh('alice', {
        prime: base.dh.getPrime(),
        apps: {
          'bob': {}
        }
      })

      let bob = Dh('bob', {
        prime: base.dh.getPrime(),
        apps: {
          'alice': {}
        }
      })

      bob.setAppPublicKey('alice', alice.dh.getPublicKey())
      alice.setAppPublicKey('bob', bob.dh.getPublicKey())

      chai.expect(bob.computeAppSecret('alice')).to.equal(alice.computeAppSecret('bob'))
    })

    it('should exchange the same message', function() {

      let base = Dh('base', {
        prime: 256
      })

      let alice = Dh('alice', {
        prime: base.dh.getPrime(),
        apps: {
          'bob': {}
        }
      })

      let bob = Dh('bob', {
        prime: base.dh.getPrime(),
        apps: {
          'alice': {}
        }
      })

      bob.setAppPublicKey('alice', alice.dh.getPublicKey())
      alice.setAppPublicKey('bob', bob.dh.getPublicKey())

      let message = 'hello'
      let crypted_msg = alice.encrypt('bob', message)

      chai.expect(bob.decrypt('alice', crypted_msg)).to.equal(message)
    })
  })
})