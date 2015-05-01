/**
 * @fileoverview es6-promiseのインターフェース定義。
 * ES6 Promiseのpolyfillなので、Closure Compilerのexternsを流用している。
 *
 * @see https://github.com/jakearchibald/es6-promise
 * @see https://github.com/google/closure-compiler/blob/master/externs/es6.js
 */

/** @type {Object} */
var ES6Promise;


/**
* @see https://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects
* @param {function(
*             function((TYPE|IThenable.<TYPE>|Thenable|null)=),
*             function(*=))} resolver
* @constructor
* @implements {IThenable.<TYPE>}
* @template TYPE
*/
ES6Promise.Promise = function(resolver) {};


/**
* @param {(TYPE|IThenable.<TYPE>)=} opt_value
* @return {!ES6Promise.Promise.<TYPE>}
* @template TYPE
*/
ES6Promise.Promise.resolve = function(opt_value) {};


/**
* @param {*=} opt_error
* @return {!ES6Promise.Promise.<?>}
*/
ES6Promise.Promise.reject = function(opt_error) {};


/**
* @template T
* @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
* @param {!Array<T|!Promise<T>>} iterable
* @return {!ES6Promise.Promise<!Array<T>>}
*/
ES6Promise.Promise.all = function(iterable) {};


/**
* @template T
* @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
* @param {!Array.<T>} iterable
* @return {!ES6Promise.Promise.<T>}
*/
ES6Promise.Promise.race = function(iterable) {};


/**
* @param {?(function(TYPE):
*             (RESULT|IThenable.<RESULT>|Thenable))=} opt_onFulfilled
* @param {?(function(*): *)=} opt_onRejected
* @return {!ES6Promise.Promise.<RESULT>}
* @template RESULT
* @override
*/
ES6Promise.Promise.prototype.then = function(opt_onFulfilled, opt_onRejected) {};


/**
* @param {function(*): RESULT} onRejected
* @return {!ES6Promise.Promise.<RESULT>}
* @template RESULT
*/
ES6Promise.Promise.prototype.catch = function(onRejected) {};
