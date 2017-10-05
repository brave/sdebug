/* jshint asi: true */

// a wrapper around debug() to add structured data logging, viz., https://tools.ietf.org/html/rfc5424#section-6.3

var path = require('path')
var slugify = require('transliteration').slugify
var stripansi = require('strip-ansi')
var underscore = require('underscore')
var util = require('util')

exports = module.exports = function (namespace) {
  var sdebug = new (require('debug'))(path.parse(namespace).name)

  var sdelement = function (params) {
    var sdata = ''

    var sdname = function (name) {
      name = slugify(name, this.options)
      if (name.length > 32) { name = name.slice(0, 32) }

      return name
    }.bind(this)

    var sdvalue = function (param) {
      var value = ''

      param.toString().split('').forEach(function (c) {
        value += '\\"]%'.indexOf(c) !== -1 ? encodeURI(c) : c
      })
      return value
    }

    underscore.keys(params || {}).forEach(function (name) {
      var value = params[name]
      var keys = underscore.keys(value)

      if (keys.length === 0) { return }

      sdata += '[' + (name.indexOf('@') !== -1 ? name : sdname(name)) + '@' + this.options.pen
      keys.forEach(function (pname) {
        if ((typeof value[pname] !== 'string') &&
            (typeof value[pname] !== 'number') &&
            (typeof value[pname] !== 'boolean')) { return }

        sdata += ' ' + sdname(pname) + '="' + sdvalue(value[pname]) + '"'
      })
      sdata += ']'
    }.bind(this))

    return sdata
  }

  require('debug').log = function () {
    var arg0, arg00, prefix
    var args = [ '' ]
    var name = this.namespace.trim()

    if (!this.initial) this.initial = ''
    if (!this.options) this.options = { nilvalue: '-', lowercase: false, separator: '_', pen: 1104 }

    if (this.useColors) { name = '\u001b[3' + this.color + ';1m' + name + '\u001b[0m' }

    prefix = this.initial
    underscore.rest(arguments).forEach(function (arg) {
      var truths, value
      var keys = underscore.keys(arg)

      if (keys[0] === 'sdebug') {
        prefix = sdelement.bind(this)(arg.sdebug)
      } else if (keys[0] !== 'tags') {
        args.push(arg)
      } else {
        value = arg.tags
        if (underscore.isArray(value)) {
          truths = underscore.times(value.length, function () { return true })
          arg.tags = underscore.object(value, truths)
        }
        prefix += sdelement.bind(this)(arg)
      }
    }.bind(this))
    if (this.initial !== prefix) { prefix = ' ' + prefix }
    arg00 = stripansi(arguments[0])
    if ((typeof arg00 !== 'string') || (arg00.trim().indexOf(stripansi(name)) !== 0)) arg0 = arguments[0]
    else arg0 = arguments[0].slice(name.length - 1)
    args[0] = name + prefix + ' ' + arg0

    var line = ''
    var s = ''

    if (args[0].indexOf('%') !== -1) return process.stdout.write(util.format.apply(util, args) + '\n')

    args.forEach((arg) => {
      line += s + ((typeof arg === 'string') ? arg : JSON.stringify(arg))
      s = ' '
    })
    return process.stdout.write(line + '\n')
  }

  sdebug.config = function (config) {
    sdebug.options = underscore.extend(sdebug.options, config)
  }

  sdebug.initialize = function (params) {
    var sdata = ''

    sdata += sdelement.bind(sdebug)(params)
    if (sdata === '') { sdata = sdebug.options.nilvalue + ' ' }
    sdebug.initial = ' ' + sdata
  }

  sdebug.options = {
    nilvalue: '-',
    lowercase: false,
    separator: '_',
    pen: 1104
  }
  sdebug.initial = ''

  return sdebug
}
