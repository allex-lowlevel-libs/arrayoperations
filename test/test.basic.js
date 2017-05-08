var expect = require('chai').expect,
  inherit = require('allex_inheritlowlevellib').inherit,
  AllexError = require('allex_errorlowlevellib')(inherit),
  AllexJSONizingError = require('allex_jsonizingerrorlowlevellib')(AllexError,inherit),
  checkftions = require('allex_checkslowlevellib'),
  objmanip = require('allex_objectmanipulationlowlevellib')(checkftions),
  stringmanip = require('allex_stringmanipulationlowlevellib')(checkftions.isString, checkftions.isNull),
  dlinkedlistbase = require('allex_doublelinkedlistbaselowlevellib'),
  avltreelib = require('allex_avltreelowlevellib')(dlinkedlistbase, inherit),
  Map = require('allex_maplowlevellib')(avltreelib, inherit),
  arrOp = require('..')(objmanip.extend, stringmanip.readPropertyFromDotDelimitedString, checkftions.isFunction, Map, AllexJSONizingError);

describe('Basic tests', function () {
  it('intersect', function () {
    expect(arrOp.intersect([0, 1, 2, 3], [5, 1, 6, 7])).to.deep.equal([1]);
  });
  it('isConsistent', function () {
    expect(arrOp.isConsistent([1, 2, 'a', 3, 'b', 4], [1, 2, 'a', 3, 'b', 4, 'c'])).to.equal(true);
  });
  it('contains', function () {
    expect(arrOp.contains([0, 1, 2], 1)).to.equal(true);
  });
  it('contains for objects as array elements without a processor should fail', function () {
    expect(arrOp.contains(
      [{
        name: 'a',
        width: 50
      },
      {
        name: 'b',
        width: 48
      },
      {
        name: 'c',
        width: 30
      }], {name: 'b', width: 48}
    )).to.equal(false);
  });
  it('contains for objects as array elements with a processor', function () {
    expect(arrOp.contains(
      [{
        name: 'a',
        width: 50
      },
      {
        name: 'b',
        width: 48
      },
      {
        name: 'c',
        width: 30
      }], {name: 'b', width: 48},
      function (a, b) {return a.name===b.name && a.width===b.width}
    )).to.equal(true);
  });
  it('difference', function () {
    expect(arrOp.difference([1, 2, 3, '4', '5'], [1, '4', 8, 9, 10])).to.deep.equal([2, 3, '5']);
  });
  it('union', function () {
    expect(arrOp.union([1, '2', 2, 3, 'a'], [1, 2, 4, '4'])).to.deep.equal([1, '2', 2, 3, 'a', 4, '4']);
  });
  it('appendNonExistingItems', function () {
    var a1 = [1, '2', 2, 3, 'a'], a2 = [1, 2, 4, '4'];
    arrOp.appendNonExistingItems(a1, a2);
    expect(a1).to.deep.equal([1, '2', 2, 3, 'a', 4, '4']);
  });
  it('findElementWithProperty', function () {
    expect(arrOp.findElementWithProperty([1, {name: 'a', height: 15}, null, {name: 'b', a: 8}], 'name', 'b')).to.deep.equal({name: 'b', a: 8});
  });
  it('findElementAndIndexWithProperty', function () {
    expect(arrOp.findElementAndIndexWithProperty([1, {name: 'a', height: 15}, null, {name: 'b', a: 8}], 'name', 'b')).to.deep.equal({element:{name: 'b', a: 8}, index: 3});
  });
  it('findWithProperty', function () {
    expect(arrOp.findWithProperty([1, {name: 'b', c: {name: 'a'}}, {name: 'a', height: 15}, null, {name: 'b', a: 8}], 'name', 'b')).to.deep.equal([{name: 'b', c: {name: 'a'}}, {name: 'b', a: 8}]);
  });
  it('appendNonExistingObjects', function () {
    var a1 = [{name: 'a', width: 5}], a2 = [{name: 'a', width:7}];
    arrOp.appendNonExistingObjects(a1, a2, 'name');
    expect(a1).to.deep.equal([{name: 'a', width: 7}]);
  });
});
