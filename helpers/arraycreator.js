function createArrayHelpers (extend, readPropertyFromDotDelimitedString, isFunction, Map, AllexJSONizingError) {
  'use strict';

  function equaler (item, propval, scalarpropname, index) {
    return item[scalarpropname] == propval[index];
  }
  function propnamevalequal (item, propname, propval) {
    var ret = propname.every(equaler.bind(null, item, propval));
    item = null;
    propval = null;
    return ret;
  }
  function propvals (item, propname) {
    var ret = propname.map(function (scalarpropname) {
      return item[scalarpropname];
    });
    item = null;
    return ret;
  }

  function finderwithindex(findobj, propname, propval, item, index){
    if (item && propnamevalequal(item, propname, propval)) {
      findobj.element = item;
      findobj.index = index;
      return true;
    }
  }

  function plaincompare (a, b) {
    if (a == b) {return 0;}
    if (a > b) {return 1;}
    return -1;
  }
  function scalarcompare(ret, item, index) {
    if (ret.ret != 0) {
      return ret;
    }
    var pcres = plaincompare(item, ret.other[index]);
    ret.ret = pcres;
    return ret;
  }
  function compare (a, b) {
    return a.reduce(scalarcompare, {other: b, ret: 0}).ret;
  }
  function finderwithindexandinsertindex(findobj, propname, propval, item, index){
    var val, cmpval;
    val = propvals(item, propname);
    cmpval = compare(val, propval);
    if (cmpval == 0) {
      findobj.element = item;
      findobj.index = index;
      return true;
    }
    if (cmpval<0) {
      findobj.insertafter = index;
    }
  }

  return {
    finderwithindex: finderwithindex,
    finderwithindexandinsertindex: finderwithindexandinsertindex
  };
}
module.exports = createArrayHelpers;