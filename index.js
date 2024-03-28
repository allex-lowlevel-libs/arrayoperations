module.exports = function createArryOperations(extend, readPropertyFromDotDelimitedString, isFunction, Map, AllexJSONizingError) {

  var helpers = require('./helpers')(extend, readPropertyFromDotDelimitedString, isFunction, Map, AllexJSONizingError);
  function isArray (val) {return 'object' === typeof(val) && val instanceof Array;}
  function helperselector (propname, propval, helpername) {
    if (isArray(propname)) {
      if (!isArray(propval)) {
        throw new Error('propname-propval type mismatch');
      }
      if (propname.length != propval.length) {
        throw new Error('propname-propval length mismatch');
      }
      return helpers.array[helpername];
    }
    return helpers.scalar[helpername];
  }
  function union(a1, a2) {
    var ret = a1.slice();
    appendNonExistingItems(ret, a2);
    return ret;
  }

  function appendNonExistingItems(a1, a2) {
    a2.forEach(function (a2e) {
      if (a1.indexOf(a2e)<0) {
        a1.push(a2e);
      }
    });
    a1 = null;
  }

  function finder(findobj, propname, propval, item){
    var und;
    //if (item[propname] === propval) {
    if (propval !== und && readPropertyFromDotDelimitedString(item, propname) === propval) {
      findobj.found = item;
      return true;
    }
  }

  function findElementWithProperty(a, propname, propval) {
    if (!(a && a.some)) {
      return;
    }
    var und, findobj = {found: und}, ret;
    a.some(finder.bind(null, findobj, propname, propval));
    ret = findobj.found;
    findobj.found = null;
    findobj = null;
    return ret;
  }

  function lastfinder (propname, propval, result, item) {
    var und;
    if (propval !== und && readPropertyFromDotDelimitedString(item, propname) === propval) {
      return item;
    }
    return result;
  }

  function findLastElementWithProperty(a, propname, propval) {
    var ret;
    if (!(a && a.reduce)) {
      return;
    }
    ret = a.reduce(lastfinder.bind(null, propname, propval), void 0);
    propname = null;
    propval = null;
    return ret;
  }

  function findElementAndIndexWithProperty(a, propname, propval) {
    if (!(a && a.some)) {
      return;
    }
    var und, findobj = {element: und, index: und};
    a.some(helperselector(propname, propval, 'finderwithindex').bind(null, findobj, propname, propval));
    return findobj;
  }

  function findElementIndexAndInsertIndexWithProperty(a, propname, propval) {
    if (!(a && a.some)) {
      return;
    }
    var und, findobj = {element: und, index: und, insertafter: und}, _fo = findobj;
    a.some(helperselector(propname, propval, 'finderwithindexandinsertindex').bind(null, _fo, propname, propval));
    _fo = null;
    propname = null;
    propval = null;
    return findobj;
  }

  function findToMatchFilter (a, filter) {
    var ret = [];
    for (var i = 0; i < a.length; i++) {
      if (filter.isOK(a[i])) ret.push (a[i]);
    }
    return ret;
  }

  function findFirstToMatchFilter (a, filter) {
    for (var i = 0; i < a.length; i++) {
      if (filter.isOK(a[i])) return a[i];
    }
  }

  function findWithProperty (arr, propname, propval) {
    return arr.filter (finder.bind(null, {}, propname, propval));
  }

  function checkerForPropertyName(propertyname, propertyprocessor, arry, object, index) {
    if (!object.hasOwnProperty(propertyname)) {
      throw(new AllexJSONizingError('NO_PROPERTY', object, 'No propertyname'));
      return;
    }
    var prop = object[propertyname], existing;
    if (propertyprocessor) {
      prop = propertyprocessor(prop);
    }
    existing = findElementAndIndexWithProperty(arry, propertyname, prop);
    if (existing.element) {
      arry[existing.index] = extend(existing.element, object);
    } else {
      arry.push(object);
    }
  }

  function appendNonExistingObjects(a1, a2, propertyname, propertyprocessor) {
    a2.forEach(checkerForPropertyName.bind(null, propertyname, propertyprocessor, a1));
  }

  function unionObjects(a1, a2, propertyname, propertyprocessor) {
    var ret = a1.slice();
    appendNonExistingObjects(ret, a2, propertyname, propertyprocessor);
    return ret;
  }

  function execute_eqf (what, eqf, item){
    if (eqf(item, what)) {
      return true;
    }
  }

  function contains (arr, what, eqf) {
    if (!isFunction (eqf)) {
      return arr.indexOf(what) > -1;
    }
    return arr.some(execute_eqf.bind(null, what, eqf));
  }

  function notcontains (arr, what, eqf){
    return !contains(arr, what, eqf);
  }


  function _filter_notcontains (arr, eqf, what){
    return notcontains(arr, what, eqf);
  };


  function difference (arr1, arr2, eqf) {
    return arr1.filter(_filter_notcontains.bind(null, arr2, eqf));
  }

  function isConsistent (arr1, arr2) { ///means arr2 has to have starting elements equal to elements of arr1
    if (arr2.length < arr1.length) return false;
    for (var i = 0 ; i < arr1.length; i++) {
      if (arr2[i] !== arr1[i]) return false;
    }
    return true;
  }

  function _intersect_check (ret, arr2, eqf, item) {
    if (notcontains(arr2, item, eqf)) { return; }
    if (contains(ret, item, eqf)) { return; }
    ret.push (item);
  }

  function intersect (arr1, arr2, eqf) {
    if (!(arr1 && arr1.length)) return [];
    if (!(arr2 && arr2.length)) return [];

    var ret = [];
    arr1.forEach(_intersect_check.bind(null, ret, arr2, eqf));
    return ret;
  }


  function pivot (source, options) {
    var p = new Pivoter(options);
    return p.pivot(source);
  }

  function unpivot (source, options) {
    var p = new Pivoter(options);
    return p.unpivot(source);
  }


  /* options: 
    x_field : this field is used for x axis ...
    y_field : this field is used for y axis ...
    value_field : this field is used for value ...
    x_fields_list : list of fields accross x axis ...
    init_empty_rows : should empty rows be inited,
    to_y : converting function to y ...
    from_y : convert back y value to original value ...
    pivot_init_value : what should we put as initial value ...
  */

  function Pivoter (options) {
    this.options = extend ({}, Pivoter.DEFAULT_OPTIONS, options);
    if (!this.options.x_field) throw new Error('No x_field config');
    if (!this.options.y_field) throw new Error('No y_field config');
    if (!this.options.value_field) throw new Error('No value_field config');
    if (!this.options.x_fields_list) throw new Error('No x_fields_list config');
  }

  Pivoter.prototype.pivot = function (source) {
    var ret = [];
    source.forEach (this._processPivotSourceItem.bind(this, ret));

    if (!this.options.init_empty_rows) return ret;
    for (var i = 0; i < ret.length; i++) {
      if (ret[i]) continue;
      ret[i] = this.initializeEmptyPivotRecord();
    }
    return ret;
  };

  Pivoter.prototype._processPivotSourceItem = function (ret, item) {
    var y = this.options.to_y(item[this.options.y_field], item);

    if (!ret[y]) {
      ret[y] = this.initializeEmptyPivotRecord();
    }

    var x = item[this.options.x_field];
    if (!(x in ret[y])) throw new Error(x+' is not in filed list ...');
    //console.log('PROCESSING PIVOT SOURCE ITEM', y, ret[y], item);
    ret[y][x] = item[this.options.value_field];
  };

  Pivoter.prototype.initializeEmptyPivotRecord = function () {
    var ret = {};
    this.options.x_fields_list.forEach (this._createEmptyPivotField.bind(this, ret));
    return ret;
  };

  Pivoter.prototype._createEmptyPivotField = function (ret, name) {
    return ret[name] = 'pivot_init_value' in this.options ? this.options.pivot_init_value : null;
  };

  Pivoter.prototype.unpivot = function (source, removeNonExistingValueFromUnpivot) {
    var ret = [];
    source.forEach (this._processPivotedItem.bind(this, removeNonExistingValueFromUnpivot, ret));
    return ret;
  };

  Pivoter.prototype._processPivotedItem = function (removeNonExistingValueFromUnpivot, ret, item, index) {
    this.options.x_fields_list.forEach (this._fromPivoted.bind(this, removeNonExistingValueFromUnpivot, ret, index, item));
  };

  Pivoter.prototype._fromPivoted = function (removeNonExistingValueFromUnpivot, ret, y, item, field){
    var o = {};
    o[this.options.value_field] = item[field];
    o[this.options.y_field] = this.options.from_y(y, item);
    o[this.options.x_field] = field;
    if (this._shouldAccountUnpivot(o, removeNonExistingValueFromUnpivot)) {
      ret.push (this._processUnpivotRecord(o));
    }
  };

  Pivoter.prototype._shouldAccountUnpivot = function (o, removeNonExistingValueFromUnpivot) {
    if (removeNonExistingValueFromUnpivot) {
      if (o[this.options.value_field] === this.options.nonexisting_value) {
        return false;
      }
    }
    var f = this.options.shouldAccountUnpivot;

    return isFunction(f) ? f(o) : true;
  };

  Pivoter.prototype._processUnpivotRecord = function (rec) {
    var f = this.options.processUnpivotRecord;
    return isFunction(f) ? f(rec) : rec;
  };

  Pivoter.DEFAULT_OPTIONS = {
    nonexisting_value : null,
    init_empty_rows : false,
    to_y: function (s) {return parseInt(s);},
    from_y : function (s) {return s+'';}
  };

  function toRet (ret, val, name) {
    ret.push (name);
  }

  function unique (arr) {
    var map = new Map ();
    for (var i = 0; i < arr.length; i++) {
      if (!map.get(arr[i])) map.add(arr[i], true);
    }

    var ret = [];
    map.traverse (toRet.bind(null, ret));
    return ret;
  }

	function randomizeArray(array) {
    var length = array.length;
    var last = length - 1;

    for (var index = 0; index < length; index++) {
      var rand = Math.floor ((index+1)*Math.random());
      var temp = array[index];
      array[index] = array[rand];
      array[rand] = temp;
    }
    return array;
	}


  var ret = {
    intersect : intersect,
    isConsistent : isConsistent,
    contains : contains,
    notcontains : notcontains,
    difference : difference,
    union: union,
    appendNonExistingItems: appendNonExistingItems,
    findElementWithProperty: findElementWithProperty,
    findLastElementWithProperty: findLastElementWithProperty,
    findElementAndIndexWithProperty: findElementAndIndexWithProperty,
    findElementIndexAndInsertIndexWithProperty: findElementIndexAndInsertIndexWithProperty,
    pivot : pivot,
    unpivot : unpivot,
    Pivoter : Pivoter,
    findToMatchFilter : findToMatchFilter,
    findFirstToMatchFilter : findFirstToMatchFilter,
    unique : unique,
    randomizeArray : randomizeArray,
    findWithProperty : findWithProperty,
    appendNonExistingObjects: appendNonExistingObjects,
    unionObjects: unionObjects
  };
  return ret;
}; 
