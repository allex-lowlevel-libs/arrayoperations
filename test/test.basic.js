var expect = require('chai').expect,
  checkftions = require('allex_checkslowlevellib'),
  inherit = require('allex_inheritlowlevellib')(checkftions.isFunction, checkftions.isString).inherit,
  AllexError = require('allex_errorlowlevellib')(inherit),
  AllexJSONizingError = require('allex_jsonizingerrorlowlevellib')(AllexError,inherit),
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
    var r = arrOp.difference ([1,2,3], [4,5,6]);
    if (arrOp.contains (r, 4)) throw new Error('Result should not contain 4');
    if (arrOp.contains (r, 5)) throw new Error('Result should not contain 5');
    if (arrOp.contains (r, 6)) throw new Error('Result should not contain 6');
    r = arrOp.difference([1,2],[2,3]);
    if (arrOp.contains(r, 2)) throw new Error('Result should not contain 2');
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

describe ('Test pivot', function () {
  var numeric_source = [
    {"symbol":0,"repetitions":5,"multiplier":1000},
    {"symbol":0,"repetitions":4,"multiplier":500},
    {"symbol":0,"repetitions":3,"multiplier":200},
    {"symbol":2,"repetitions":5,"multiplier":300},
    {"symbol":2,"repetitions":4,"multiplier":250},
    {"symbol":3,"repetitions":5,"multiplier":250},
    {"symbol":3,"repetitions":4,"multiplier":200},
    {"symbol":4,"repetitions":5,"multiplier":220},
    {"symbol":4,"repetitions":4,"multiplier":200},
    {"symbol":4,"repetitions":3,"multiplier":160},
    {"symbol":5,"repetitions":5,"multiplier":200},
    {"symbol":5,"repetitions":4,"multiplier":180},
    {"symbol":5,"repetitions":3,"multiplier":120},
    {"symbol":6,"repetitions":5,"multiplier":180},
    {"symbol":6,"repetitions":4,"multiplier":120},
    {"symbol":6,"repetitions":3,"multiplier":75}];


  var pivot = arrOp.pivot, 
    unpivot = arrOp.unpivot,
    Pivoter = arrOp.Pivoter;

  it ('Pivot test', function () {
    var r = pivot(numeric_source, {
      x_field: 'repetitions', 
      y_field: 'symbol', 
      value_field: 'multiplier', 
      init_empty_rows: false,
      x_fields_list : ['2','3','4','5'],
      to_y : function (s) { return parseInt(s); }
    });
    expect(r).to.be.an.array;
    expect(r).to.have.length.of(7);
    expect(r[1]).to.be.undefined;
  });

  it ('Pivot test', function () {
    var p = new Pivoter({
      x_field: 'repetitions', 
      y_field: 'symbol', 
      value_field: 'multiplier', 
      init_empty_rows: false,
      x_fields_list : [2,3,4,5],
      init_empty_rows : true
    }),
      r = p.pivot(numeric_source);

    expect(r).to.be.an.array;
    expect(r).to.have.length.of(7);
    expect(r[1]).to.deep.equal(p.initializeEmptyPivotRecord());

    var r1 = p.unpivot (r),
      diff = arrOp.difference(r1, numeric_source, function (i1, i2) {
        return i1.symbol == i2.symbol && i1.multiplier == i2.multiplier && i1.repetitions == i2.repetitions;
      });

    expect(diff.filter(function (item) {
      return !!item.multiplier;
    })).to.be.empty;
  });

});
