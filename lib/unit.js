'use strict';

var _ = require('lodash');

var errors = require('./errors');
var $ = require('./util/preconditions');

var UNITS = {
  'DCR'      : [1e8, 8],
  'mDCR'     : [1e5, 5],
  'uDCR'     : [1e2, 2],
  'bits'     : [1e2, 2],
  'dbits'    : [1e2, 2],
  'atoms'    : [1, 0]
};

/**
 * Utility for handling and converting bitcoins units. The supported units are
 * DCR, mDCR, bits (also named uDCR) and atoms. A unit instance can be created with an
 * amount and a unit code, or alternatively using static methods like {fromDCR}.
 * It also allows to be created from a fiat amount and the exchange rate, or
 * alternatively using the {fromFiat} static method.
 * You can consult for different representation of a unit instance using it's
 * {to} method, the fixed unit methods like {toSatoshis} or alternatively using
 * the unit accessors. It also can be converted to a fiat amount by providing the
 * corresponding DCR/fiat exchange rate.
 *
 * @example
 * ```javascript
 * var sats = Unit.fromDCR(1.3).toSatoshis();
 * var mili = Unit.fromBits(1.3).to(Unit.mDCR);
 * var bits = Unit.fromFiat(1.3, 350).bits;
 * var dcr = new Unit(1.3, Unit.bits).DCR;
 * ```
 *
 * @param {Number} amount - The amount to be represented
 * @param {String|Number} code - The unit of the amount or the exchange rate
 * @returns {Unit} A new instance of an Unit
 * @constructor
 */
function Unit(amount, code) {
  if (!(this instanceof Unit)) {
    return new Unit(amount, code);
  }

  // convert fiat to DCR
  if (_.isNumber(code)) {
    if (code <= 0) {
      throw new errors.Unit.InvalidRate(code);
    }
    amount = amount / code;
    code = Unit.DCR;
  }

  this._value = this._from(amount, code);

  var self = this;
  var defineAccesor = function(key) {
    Object.defineProperty(self, key, {
      get: function() { return self.to(key); },
      enumerable: true,
    });
  };

  Object.keys(UNITS).forEach(defineAccesor);
}

Object.keys(UNITS).forEach(function(key) {
  Unit[key] = key;
});

/**
 * Returns a Unit instance created from JSON string or object
 *
 * @param {String|Object} json - JSON with keys: amount and code
 * @returns {Unit} A Unit instance
 */
Unit.fromObject = function fromObject(data){
  $.checkArgument(_.isObject(data), 'Argument is expected to be an object');
  return new Unit(data.amount, data.code);
};

/**
 * Returns a Unit instance created from an amount in DCR
 *
 * @param {Number} amount - The amount in DCR
 * @returns {Unit} A Unit instance
 */
Unit.fromDCR = function(amount) {
  return new Unit(amount, Unit.DCR);
};

/**
 * Returns a Unit instance created from an amount in mDCR
 *
 * @param {Number} amount - The amount in mDCR
 * @returns {Unit} A Unit instance
 */
Unit.fromMilis = function(amount) {
  return new Unit(amount, Unit.mDCR);
};

/**
 * Returns a Unit instance created from an amount in dbits
 *
 * @param {Number} amount - The amount in dbits
 * @returns {Unit} A Unit instance
 */
Unit.fromMicros = Unit.fromDbits = function(amount) {
  return new Unit(amount, Unit.dbits);
};

/**
 * Returns a Unit instance created from an amount in atoms
 *
 * @param {Number} amount - The amount in atoms
 * @returns {Unit} A Unit instance
 */
Unit.fromAtoms = function(amount) {
  return new Unit(amount, Unit.atoms);
};

/**
 * Returns a Unit instance created from a fiat amount and exchange rate.
 *
 * @param {Number} amount - The amount in fiat
 * @param {Number} rate - The exchange rate DCR/fiat
 * @returns {Unit} A Unit instance
 */
Unit.fromFiat = function(amount, rate) {
  return new Unit(amount, rate);
};

Unit.prototype._from = function(amount, code) {
  if (!UNITS[code]) {
    throw new errors.Unit.UnknownCode(code);
  }
  return parseInt((amount * UNITS[code][0]).toFixed());
};

/**
 * Returns the value represented in the specified unit
 *
 * @param {String|Number} code - The unit code or exchange rate
 * @returns {Number} The converted value
 */
Unit.prototype.to = function(code) {
  if (_.isNumber(code)) {
    if (code <= 0) {
      throw new errors.Unit.InvalidRate(code);
    }
    return parseFloat((this.DCR * code).toFixed(2));
  }

  if (!UNITS[code]) {
    throw new errors.Unit.UnknownCode(code);
  }

  var value = this._value / UNITS[code][0];
  return parseFloat(value.toFixed(UNITS[code][1]));
};

/**
 * Returns the value represented in DCR
 *
 * @returns {Number} The value converted to DCR
 */
Unit.prototype.toDCR = function() {
  return this.to(Unit.DCR);
};

/**
 * Returns the value represented in mDCR
 *
 * @returns {Number} The value converted to mDCR
 */
Unit.prototype.toMilis = function() {
  return this.to(Unit.mDCR);
};

/**
 * Returns the value represented in dbits
 *
 * @returns {Number} The value converted to dbits
 */
Unit.prototype.toMicros = Unit.prototype.toDbits = function() {
  return this.to(Unit.dbits);
};

/**
 * Returns the value represented in atoms
 *
 * @returns {Number} The value converted to atoms
 */
Unit.prototype.toAtoms = function() {
  return this.to(Unit.atoms);
};

/**
 * Returns the value represented in fiat
 *
 * @param {string} rate - The exchange rate between DCR/currency
 * @returns {Number} The value converted to atoms
 */
Unit.prototype.atRate = function(rate) {
  return this.to(rate);
};

/**
 * Returns a the string representation of the value in atoms
 *
 * @returns {string} the value in atoms
 */
Unit.prototype.toString = function() {
  return this.atoms + ' atoms';
};

/**
 * Returns a plain object representation of the Unit
 *
 * @returns {Object} An object with the keys: amount and code
 */
Unit.prototype.toObject = Unit.prototype.toJSON = function toObject() {
  return {
    amount: this.DCR,
    code: Unit.DCR
  };
};

/**
 * Returns a string formatted for the console
 *
 * @returns {string} the value in atoms
 */
Unit.prototype.inspect = function() {
  return '<Unit: ' + this.toString() + '>';
};

module.exports = Unit;
