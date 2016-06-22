'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var bitcore = require('..');
var errors = bitcore.errors;
var Unit = bitcore.Unit;

describe('Unit', function() {

  it('can be created from a number and unit', function() {
    expect(function() {
      return new Unit(1.2, 'DCR');
    }).to.not.throw();
  });

  it('can be created from a number and exchange rate', function() {
    expect(function() {
      return new Unit(1.2, 350);
    }).to.not.throw();
  });

  it('no "new" is required for creating an instance', function() {
    expect(function() {
      return Unit(1.2, 'DCR');
    }).to.not.throw();

    expect(function() {
      return Unit(1.2, 350);
    }).to.not.throw();
  });

  it('has property accesors "DCR", "mDCR", "uDCR", "dbits", and "atoms"', function() {
    var unit = new Unit(1.2, 'DCR');
    unit.DCR.should.equal(1.2);
    unit.mDCR.should.equal(1200);
    unit.uDCR.should.equal(1200000);
    unit.dbits.should.equal(1200000);
    unit.atoms.should.equal(120000000);
  });

  it('a string amount is allowed', function() {
    var unit;

    unit = Unit.fromDCR('1.00001');
    unit.DCR.should.equal(1.00001);

    unit = Unit.fromMillis('1.00001');
    unit.mDCR.should.equal(1.00001);

    unit = Unit.fromDbits('100');
    unit.dbits.should.equal(100);

    unit = Unit.fromAtoms('8999');
    unit.atoms.should.equal(8999);

    unit = Unit.fromFiat('43', 350);
    unit.DCR.should.equal(0.12285714);
  });

  it('should have constructor helpers', function() {
    var unit;

    unit = Unit.fromDCR(1.00001);
    unit.DCR.should.equal(1.00001);

    unit = Unit.fromMilis(1.00001);
    unit.mDCR.should.equal(1.00001);

    unit = Unit.fromDbits(100);
    unit.dbits.should.equal(100);

    unit = Unit.fromAtoms(8999);
    unit.atoms.should.equal(8999);

    unit = Unit.fromFiat(43, 350);
    unit.DCR.should.equal(0.12285714);
  });

  it('converts to atoms correctly', function() {
    /* jshint maxstatements: 25 */
    var unit;

    unit = Unit.fromDCR(1.3);
    unit.mDCR.should.equal(1300);
    unit.dbits.should.equal(1300000);
    unit.atoms.should.equal(130000000);

    unit = Unit.fromMilis(1.3);
    unit.DCR.should.equal(0.0013);
    unit.dbits.should.equal(1300);
    unit.atoms.should.equal(130000);

    unit = Unit.fromDbits(1.3);
    unit.DCR.should.equal(0.0000013);
    unit.mDCR.should.equal(0.0013);
    unit.atoms.should.equal(130);

    unit = Unit.fromAtoms(3);
    unit.DCR.should.equal(0.00000003);
    unit.mDCR.should.equal(0.00003);
    unit.dbits.should.equal(0.03);
  });

  it('takes into account floating point problems', function() {
    var unit = Unit.fromDCR(0.00000003);
    unit.mDCR.should.equal(0.00003);
    unit.dbits.should.equal(0.03);
    unit.atoms.should.equal(3);
  });

  it('exposes unit codes', function() {
    should.exist(Unit.DCR);
    Unit.DCR.should.equal('DCR');

    should.exist(Unit.mDCR);
    Unit.mDCR.should.equal('mDCR');

    should.exist(Unit.dbits);
    Unit.dbits.should.equal('dbits');

    should.exist(Unit.atoms);
    Unit.atoms.should.equal('atoms');
  });

  it('exposes a method that converts to different units', function() {
    var unit = new Unit(1.3, 'DCR');
    unit.to(Unit.DCR).should.equal(unit.DCR);
    unit.to(Unit.mDCR).should.equal(unit.mDCR);
    unit.to(Unit.dbits).should.equal(unit.dbits);
    unit.to(Unit.atoms).should.equal(unit.atoms);
  });

  it('exposes shorthand conversion methods', function() {
    var unit = new Unit(1.3, 'DCR');
    unit.toDCR().should.equal(unit.DCR);
    unit.toMilis().should.equal(unit.mDCR);
    unit.toMillis().should.equal(unit.mDCR);
    unit.toDbits().should.equal(unit.dbits);
    unit.toAtoms().should.equal(unit.atoms);
  });

  it('can convert to fiat', function() {
    var unit = new Unit(1.3, 350);
    unit.atRate(350).should.equal(1.3);
    unit.to(350).should.equal(1.3);

    unit = Unit.fromDCR(0.0123);
    unit.atRate(10).should.equal(0.12);
  });

  it('toString works as expected', function() {
    var unit = new Unit(1.3, 'DCR');
    should.exist(unit.toString);
    unit.toString().should.be.a('string');
  });

  it('can be imported and exported from/to JSON', function() {
    var json = JSON.stringify({amount:1.3, code:'DCR'});
    var unit = Unit.fromObject(JSON.parse(json));
    JSON.stringify(unit).should.deep.equal(json);
  });

  it('importing from invalid JSON fails quickly', function() {
    expect(function() {
      return Unit.fromJSON('¹');
    }).to.throw();
  });

  it('inspect method displays nicely', function() {
    var unit = new Unit(1.3, 'DCR');
    unit.inspect().should.equal('<Unit: 130000000 atoms>');
  });

  it('fails when the unit is not recognized', function() {
    expect(function() {
      return new Unit(100, 'USD');
    }).to.throw(errors.Unit.UnknownCode);
    expect(function() {
      return new Unit(100, 'DCR').to('USD');
    }).to.throw(errors.Unit.UnknownCode);
  });

  it('fails when the exchange rate is invalid', function() {
    expect(function() {
      return new Unit(100, -123);
    }).to.throw(errors.Unit.InvalidRate);
    expect(function() {
      return new Unit(100, 'DCR').atRate(-123);
    }).to.throw(errors.Unit.InvalidRate);
  });

});
