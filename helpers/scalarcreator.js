function createScalarHelpers (extend, readPropertyFromDotDelimitedString, isFunction, Map, AllexJSONizingError) {
  'use strict';

  function finderwithindex(findobj, propname, propval, item, index){
    if (item && item[propname] === propval) {
      findobj.element = item;
      findobj.index = index;
      return true;
    }
  }

  
  function compare (a, b) {
    if (a == b) {return 0;}
    if (a > b) {return 1;}
    return -1;
  }
  function finderwithindexandinsertindex(findobj, propname, propval, item, index){
    var val, cmpval;
    val = item[propname];
    if (val === propval) {
      findobj.element = item;
      findobj.index = index;
      return true;
    }
    cmpval = compare(val, propval);
    if (cmpval<0) {
      findobj.insertafter = index;
    }
  }

  return {
    finderwithindex: finderwithindex,
    finderwithindexandinsertindex: finderwithindexandinsertindex
  };
}
module.exports = createScalarHelpers;