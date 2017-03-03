'use strict'

const validate = require('jsonschema').validate

function Swimmer(swim, dh) {
  if (!(this instanceof Swimmer)) {
    return new Swimmer(swim, dh)
  }

  this.swim = swim
  this.dh = dh

  this.startListen()
}

Swimmer.prototype.startListen = function() {
  this.swim.on('change', (event) => {
    if (event.state == 0) {
      this.add(event)
    }
  })

  this.swim.on('update', (event) => {
    if (event.state == 0) {
      this.add(event)
    }
    if (event.state == 2) {
      this.remove(event)
    }
  })
}

Swimmer.prototype.add = function(event) {
  const dh = this.getDhObjectFromEvent(event)

  if (dh && !this.dh.getApp(dh.name)) {
    this.dh.addApp(dh.name, {
      host: dh.host,
      port: dh.port
    })

    this.dh.log.info('swimmer added app: ' + dh.name)
  }
}

Swimmer.prototype.remove = function(event) {
  const dh = this.getDhObjectFromEvent(event)

  if (dh && !this.dh.getApp(dh.name)) {
    this.dh.removeApp(dh.name)

    this.dh.log.info('swimmer removed app: ' + dh.name)
  }
}

Swimmer.prototype.getDhObjectFromEvent = function(event) {
  try {
    const dh = event.meta.dh

    if (validate(dh, {
      name: { type: 'string' },
      host: { type: 'string' },
      port: { type: 'string' }
    })) {
      return (dh.name == this.dh.app) ? null : dh
    }
  } catch(err) {
    //
  }

  return null
}

module.exports = Swimmer