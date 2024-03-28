function createHelpers (extend, readPropertyFromDotDelimitedString, isFunction, Map, AllexJSONizingError) {
  'use strict';

  return {
    scalar: require('./scalarcreator')(extend, readPropertyFromDotDelimitedString, isFunction, Map, AllexJSONizingError),
    array: require('./arraycreator')(extend, readPropertyFromDotDelimitedString, isFunction, Map, AllexJSONizingError)
  };
}
module.exports = createHelpers;