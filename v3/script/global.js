// Is a string just a bunch of white space?
String.prototype.devoid = function() {
	return (!/\S/.test(this))? true:false;
}

/*
 * Add Array.indexOf(searchElement [, fromIndex]) functionality to 
 * IE8 - which does not support Array.indexOf() natively.
 * 
 * NOTE: pulled from Mozilla Developer Network (MDN)
 * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf
 */
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
    "use strict";
    if (this == null) {
        throw new TypeError();
    }
    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0) {
        return -1;
    }
    var n = 0;
    if (arguments.length > 1) {
        n = Number(arguments[1]);
        if (n != n) { // shortcut for verifying if it's NaN
            n = 0;
        } else if (n != 0 && n != Infinity && n != -Infinity) {
            n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
    }
    if (n >= len) {
        return -1;
    }
    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
    for (; k < len; k++) {
        if (k in t && t[k] === searchElement) {
            return k;
        }
    }
		return -1;
  }
}

/*
 * Add Array.map(callback, [thisArg]) functionality to
 * IE8 - which does not support Array.map() natively.
 * 
 * NOTE: pulled from Mozilla Developer Network (MDN)
 * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
 */
if (!Array.prototype.map) {
  Array.prototype.map = function(callback, thisArg) {
    var T, A, k;
    if (this == null) {
      throw new TypeError(" this is null or not defined");
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if ({}.toString.call(callback) != "[object Function]") {
      throw new TypeError(callback + " is not a function");
    }
    if (thisArg) {
      T = thisArg;
    }
    A = new Array(len);
    k = 0;
    while(k < len) {
      var kValue, mappedValue;
      if (k in O) {
        kValue = O[ k ];
        mappedValue = callback.call(T, kValue, k, O);
				A[ k ] = mappedValue;
      }
      k++;
    }
    return A;
  };      
}

/*
 * Add String.trim() functionality to
 * IE8 - which does not support String.trim() natively.
 * 
 * NOTE: pulled from Mozilla Developer Network (MDN)
 * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/Trim
 */

if (!String.prototype.trim) {
	String.prototype.trim = function() {
  	return this.replace(/^\s+|\s+$/g,'');
 	}
}

/*
 * Add Array.remove([entry]) to Array object
 */

if (!Array.prototype.remove) {
	Array.prototype.remove = function(e) {
		var t, _ref;
	  if ((t = this.indexOf(e)) > -1) {return ([].splice.apply(this, [t, t - t + 1].concat(_ref = [])), _ref);}
	}
}