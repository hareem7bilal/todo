["^ ","~:resource-id",["~:shadow.build.classpath/resource","goog/collections/iters.js"],"~:js","goog.loadModule(function(exports) {\n  \"use strict\";\n  goog.module(\"goog.collections.iters\");\n  goog.module.declareLegacyNamespace();\n  function getIterator(iterable) {\n    return iterable[goog.global.Symbol.iterator]();\n  }\n  exports.getIterator = getIterator;\n  function forEach(iterator, f) {\n    let result;\n    while (!(result = iterator.next()).done) {\n      f(result.value);\n    }\n  }\n  exports.forEach = forEach;\n  class MapIterator {\n    constructor(childIter, mapFn) {\n      this.childIterator_ = getIterator(childIter);\n      this.mapFn_ = mapFn;\n    }\n    [Symbol.iterator]() {\n      return this;\n    }\n    next() {\n      const childResult = this.childIterator_.next();\n      return {value:childResult.done ? undefined : this.mapFn_.call(undefined, childResult.value), done:childResult.done,};\n    }\n  }\n  exports.map = function(iterable, f) {\n    return new MapIterator(iterable, f);\n  };\n  class FilterIterator {\n    constructor(childIter, filterFn) {\n      this.childIter_ = getIterator(childIter);\n      this.filterFn_ = filterFn;\n    }\n    [Symbol.iterator]() {\n      return this;\n    }\n    next() {\n      while (true) {\n        const childResult = this.childIter_.next();\n        if (childResult.done) {\n          return {done:true, value:undefined};\n        }\n        const passesFilter = this.filterFn_.call(undefined, childResult.value);\n        if (passesFilter) {\n          return childResult;\n        }\n      }\n    }\n  }\n  exports.filter = function(iterable, f) {\n    return new FilterIterator(iterable, f);\n  };\n  class ConcatIterator {\n    constructor(iterators) {\n      this.iterators_ = iterators;\n      this.iterIndex_ = 0;\n    }\n    [Symbol.iterator]() {\n      return this;\n    }\n    next() {\n      while (this.iterIndex_ < this.iterators_.length) {\n        const result = this.iterators_[this.iterIndex_].next();\n        if (!result.done) {\n          return result;\n        }\n        this.iterIndex_++;\n      }\n      return {done:true};\n    }\n  }\n  exports.concat = function(...iterables) {\n    return new ConcatIterator(iterables.map(getIterator));\n  };\n  exports.toArray = function(iterator) {\n    const arr = [];\n    forEach(iterator, e => arr.push(e));\n    return arr;\n  };\n  return exports;\n});\n","~:source","/**\n * @license\n * Copyright The Closure Library Authors.\n * SPDX-License-Identifier: Apache-2.0\n */\n\n/**\n * @fileoverview Utilities for working with ES6 iterables.\n *\n * The goal is that this should be a replacement for goog.iter which uses\n * a now non-standard approach to iterables.\n *\n * This module's API should track the TC39 proposal as closely as possible to\n * allow for eventual deprecation and migrations.\n * https://github.com/tc39/proposal-iterator-helpers\n *\n * @see go/closure-iters-labs\n * @see https://goo.gl/Rok5YQ\n */\n\ngoog.module('goog.collections.iters');\ngoog.module.declareLegacyNamespace();\n\n/**\n * Get the iterator for an iterable.\n * @param {!Iterable<VALUE>} iterable\n * @return {!Iterator<VALUE>}\n * @template VALUE\n */\nfunction getIterator(iterable) {\n  return iterable[goog.global.Symbol.iterator]();\n}\nexports.getIterator = getIterator;\n\n\n/**\n * Call a function with every value of an iterable.\n *\n * Warning: this function will never halt if given an iterable that\n * is never exhausted.\n *\n * @param {!Iterator<VALUE>} iterator\n * @param {function(VALUE) : *} f\n * @template VALUE\n */\nfunction forEach(iterator, f) {\n  let result;\n  while (!(result = iterator.next()).done) {\n    f(result.value);\n  }\n}\nexports.forEach = forEach;\n\n/**\n * An Iterable that wraps a child iterable, and maps every element of the child\n * iterator to a new value, using a mapping function. Similar to Array.map, but\n * for Iterable.\n * @template TO,FROM\n * @implements {IteratorIterable<TO>}\n */\nclass MapIterator {\n  /**\n   * @param {!Iterable<FROM>} childIter\n   * @param {function(FROM): TO} mapFn\n   */\n  constructor(childIter, mapFn) {\n    /** @private @const {!Iterator<FROM>} */\n    this.childIterator_ = getIterator(childIter);\n\n    /** @private @const {function(FROM): TO} */\n    this.mapFn_ = mapFn;\n  }\n\n  [Symbol.iterator]() {\n    return this;\n  }\n\n  /** @override */\n  next() {\n    const childResult = this.childIterator_.next();\n    // Always return a new object, even when childResult.done == true. This is\n    // so that we don't accidentally preserve generator return values, which\n    // are unlikely to be meaningful in the context of this MapIterator.\n    return {\n      value: childResult.done ? undefined :\n                                this.mapFn_.call(undefined, childResult.value),\n      done: childResult.done,\n    };\n  }\n}\n\n\n/**\n * Maps the values of one iterable to create another iterable.\n *\n * When next() is called on the returned iterable, it will call the given\n * function `f` with the next value of the given iterable\n * `iterable` until the given iterable is exhausted.\n *\n * @param {!Iterable<VALUE>} iterable\n * @param {function(VALUE): RESULT} f\n * @return {!IteratorIterable<RESULT>} The created iterable that gives the\n *     mapped values.\n * @template VALUE, RESULT\n */\nexports.map = function(iterable, f) {\n  return new MapIterator(iterable, f);\n};\n\n\n/**\n * An Iterable that wraps a child Iterable and returns a subset of the child's\n * items, based on a filter function. Similar to Array.filter, but for\n * Iterable.\n * @template T\n * @implements {IteratorIterable<T>}\n */\nclass FilterIterator {\n  /**\n   * @param {!Iterable<T>} childIter\n   * @param {function(T): boolean} filterFn\n   */\n  constructor(childIter, filterFn) {\n    /** @private @const {!Iterator<T>} */\n    this.childIter_ = getIterator(childIter);\n\n    /** @private @const {function(T): boolean} */\n    this.filterFn_ = filterFn;\n  }\n\n  [Symbol.iterator]() {\n    return this;\n  }\n\n  /** @override */\n  next() {\n    while (true) {\n      const childResult = this.childIter_.next();\n      if (childResult.done) {\n        // Don't return childResult directly, because that would preserve\n        // generator return values, and we want to ignore them.\n        return {done: true, value: undefined};\n      }\n      const passesFilter = this.filterFn_.call(undefined, childResult.value);\n      if (passesFilter) {\n        return childResult;\n      }\n    }\n  }\n}\n\n\n/**\n * Filter elements from one iterator to create another iterable.\n *\n * When next() is called on the returned iterator, it will call next() on the\n * given iterator and call the given function `f` with that value until `true`\n * is returned or the given iterator is exhausted.\n *\n * @param {!Iterable<VALUE>} iterable\n * @param {function(VALUE): boolean} f\n * @return {!IteratorIterable<VALUE>} The created iterable that gives the mapped\n *     values.\n * @template VALUE\n */\nexports.filter = function(iterable, f) {\n  return new FilterIterator(iterable, f);\n};\n\n\n/**\n * @template T\n * @implements {IteratorIterable<T>}\n */\nclass ConcatIterator {\n  /** @param {!Array<!Iterator<T>>} iterators */\n  constructor(iterators) {\n    /** @private @const {!Array<!Iterator<T>>} */\n    this.iterators_ = iterators;\n\n    /** @private {number} */\n    this.iterIndex_ = 0;\n  }\n\n  [Symbol.iterator]() {\n    return this;\n  }\n\n  /** @override */\n  next() {\n    while (this.iterIndex_ < this.iterators_.length) {\n      const result = this.iterators_[this.iterIndex_].next();\n      if (!result.done) {\n        return result;\n      }\n      this.iterIndex_++;\n    }\n    return /** @type {!IIterableResult<T>} */ ({done: true});\n  }\n}\n\n\n/**\n * Concatenates multiple iterators to create a new iterable.\n *\n * When next() is called on the return iterator, it will call next() on the\n * current passed iterator. When the current passed iterator is exhausted, it\n * will move on to the next iterator until there are no more left.\n *\n * All generator return values will be ignored (i.e. when childIter.next()\n * returns {done: true, value: notUndefined} it will be treated as just\n * {done: true}).\n *\n * @param {...!Iterable<VALUE>} iterables\n * @return {!IteratorIterable<VALUE>}\n * @template VALUE\n */\nexports.concat = function(...iterables) {\n  return new ConcatIterator(iterables.map(getIterator));\n};\n\n/**\n * Creates an array containing the values from the given iterator.\n * @param {!Iterator<VALUE>} iterator\n * @return {!Array<VALUE>}\n * @template VALUE\n */\nexports.toArray = function(iterator) {\n  const arr = [];\n  forEach(iterator, e => arr.push(e));\n  return arr;\n};\n","~:compiled-at",1686759203408,"~:source-map-json","{\n\"version\":3,\n\"file\":\"goog.collections.iters.js\",\n\"lineCount\":85,\n\"mappings\":\"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\",\n\"sources\":[\"goog/collections/iters.js\"],\n\"sourcesContent\":[\"/**\\n * @license\\n * Copyright The Closure Library Authors.\\n * SPDX-License-Identifier: Apache-2.0\\n */\\n\\n/**\\n * @fileoverview Utilities for working with ES6 iterables.\\n *\\n * The goal is that this should be a replacement for goog.iter which uses\\n * a now non-standard approach to iterables.\\n *\\n * This module's API should track the TC39 proposal as closely as possible to\\n * allow for eventual deprecation and migrations.\\n * https://github.com/tc39/proposal-iterator-helpers\\n *\\n * @see go/closure-iters-labs\\n * @see https://goo.gl/Rok5YQ\\n */\\n\\ngoog.module('goog.collections.iters');\\ngoog.module.declareLegacyNamespace();\\n\\n/**\\n * Get the iterator for an iterable.\\n * @param {!Iterable<VALUE>} iterable\\n * @return {!Iterator<VALUE>}\\n * @template VALUE\\n */\\nfunction getIterator(iterable) {\\n  return iterable[goog.global.Symbol.iterator]();\\n}\\nexports.getIterator = getIterator;\\n\\n\\n/**\\n * Call a function with every value of an iterable.\\n *\\n * Warning: this function will never halt if given an iterable that\\n * is never exhausted.\\n *\\n * @param {!Iterator<VALUE>} iterator\\n * @param {function(VALUE) : *} f\\n * @template VALUE\\n */\\nfunction forEach(iterator, f) {\\n  let result;\\n  while (!(result = iterator.next()).done) {\\n    f(result.value);\\n  }\\n}\\nexports.forEach = forEach;\\n\\n/**\\n * An Iterable that wraps a child iterable, and maps every element of the child\\n * iterator to a new value, using a mapping function. Similar to Array.map, but\\n * for Iterable.\\n * @template TO,FROM\\n * @implements {IteratorIterable<TO>}\\n */\\nclass MapIterator {\\n  /**\\n   * @param {!Iterable<FROM>} childIter\\n   * @param {function(FROM): TO} mapFn\\n   */\\n  constructor(childIter, mapFn) {\\n    /** @private @const {!Iterator<FROM>} */\\n    this.childIterator_ = getIterator(childIter);\\n\\n    /** @private @const {function(FROM): TO} */\\n    this.mapFn_ = mapFn;\\n  }\\n\\n  [Symbol.iterator]() {\\n    return this;\\n  }\\n\\n  /** @override */\\n  next() {\\n    const childResult = this.childIterator_.next();\\n    // Always return a new object, even when childResult.done == true. This is\\n    // so that we don't accidentally preserve generator return values, which\\n    // are unlikely to be meaningful in the context of this MapIterator.\\n    return {\\n      value: childResult.done ? undefined :\\n                                this.mapFn_.call(undefined, childResult.value),\\n      done: childResult.done,\\n    };\\n  }\\n}\\n\\n\\n/**\\n * Maps the values of one iterable to create another iterable.\\n *\\n * When next() is called on the returned iterable, it will call the given\\n * function `f` with the next value of the given iterable\\n * `iterable` until the given iterable is exhausted.\\n *\\n * @param {!Iterable<VALUE>} iterable\\n * @param {function(VALUE): RESULT} f\\n * @return {!IteratorIterable<RESULT>} The created iterable that gives the\\n *     mapped values.\\n * @template VALUE, RESULT\\n */\\nexports.map = function(iterable, f) {\\n  return new MapIterator(iterable, f);\\n};\\n\\n\\n/**\\n * An Iterable that wraps a child Iterable and returns a subset of the child's\\n * items, based on a filter function. Similar to Array.filter, but for\\n * Iterable.\\n * @template T\\n * @implements {IteratorIterable<T>}\\n */\\nclass FilterIterator {\\n  /**\\n   * @param {!Iterable<T>} childIter\\n   * @param {function(T): boolean} filterFn\\n   */\\n  constructor(childIter, filterFn) {\\n    /** @private @const {!Iterator<T>} */\\n    this.childIter_ = getIterator(childIter);\\n\\n    /** @private @const {function(T): boolean} */\\n    this.filterFn_ = filterFn;\\n  }\\n\\n  [Symbol.iterator]() {\\n    return this;\\n  }\\n\\n  /** @override */\\n  next() {\\n    while (true) {\\n      const childResult = this.childIter_.next();\\n      if (childResult.done) {\\n        // Don't return childResult directly, because that would preserve\\n        // generator return values, and we want to ignore them.\\n        return {done: true, value: undefined};\\n      }\\n      const passesFilter = this.filterFn_.call(undefined, childResult.value);\\n      if (passesFilter) {\\n        return childResult;\\n      }\\n    }\\n  }\\n}\\n\\n\\n/**\\n * Filter elements from one iterator to create another iterable.\\n *\\n * When next() is called on the returned iterator, it will call next() on the\\n * given iterator and call the given function `f` with that value until `true`\\n * is returned or the given iterator is exhausted.\\n *\\n * @param {!Iterable<VALUE>} iterable\\n * @param {function(VALUE): boolean} f\\n * @return {!IteratorIterable<VALUE>} The created iterable that gives the mapped\\n *     values.\\n * @template VALUE\\n */\\nexports.filter = function(iterable, f) {\\n  return new FilterIterator(iterable, f);\\n};\\n\\n\\n/**\\n * @template T\\n * @implements {IteratorIterable<T>}\\n */\\nclass ConcatIterator {\\n  /** @param {!Array<!Iterator<T>>} iterators */\\n  constructor(iterators) {\\n    /** @private @const {!Array<!Iterator<T>>} */\\n    this.iterators_ = iterators;\\n\\n    /** @private {number} */\\n    this.iterIndex_ = 0;\\n  }\\n\\n  [Symbol.iterator]() {\\n    return this;\\n  }\\n\\n  /** @override */\\n  next() {\\n    while (this.iterIndex_ < this.iterators_.length) {\\n      const result = this.iterators_[this.iterIndex_].next();\\n      if (!result.done) {\\n        return result;\\n      }\\n      this.iterIndex_++;\\n    }\\n    return /** @type {!IIterableResult<T>} */ ({done: true});\\n  }\\n}\\n\\n\\n/**\\n * Concatenates multiple iterators to create a new iterable.\\n *\\n * When next() is called on the return iterator, it will call next() on the\\n * current passed iterator. When the current passed iterator is exhausted, it\\n * will move on to the next iterator until there are no more left.\\n *\\n * All generator return values will be ignored (i.e. when childIter.next()\\n * returns {done: true, value: notUndefined} it will be treated as just\\n * {done: true}).\\n *\\n * @param {...!Iterable<VALUE>} iterables\\n * @return {!IteratorIterable<VALUE>}\\n * @template VALUE\\n */\\nexports.concat = function(...iterables) {\\n  return new ConcatIterator(iterables.map(getIterator));\\n};\\n\\n/**\\n * Creates an array containing the values from the given iterator.\\n * @param {!Iterator<VALUE>} iterator\\n * @return {!Array<VALUE>}\\n * @template VALUE\\n */\\nexports.toArray = function(iterator) {\\n  const arr = [];\\n  forEach(iterator, e => arr.push(e));\\n  return arr;\\n};\\n\"],\n\"names\":[\"goog\",\"module\",\"declareLegacyNamespace\",\"getIterator\",\"iterable\",\"global\",\"Symbol\",\"iterator\",\"exports\",\"forEach\",\"f\",\"result\",\"done\",\"next\",\"value\",\"MapIterator\",\"constructor\",\"childIter\",\"mapFn\",\"childIterator_\",\"mapFn_\",\"childResult\",\"undefined\",\"call\",\"map\",\"exports.map\",\"FilterIterator\",\"filterFn\",\"childIter_\",\"filterFn_\",\"passesFilter\",\"filter\",\"exports.filter\",\"ConcatIterator\",\"iterators\",\"iterators_\",\"iterIndex_\",\"length\",\"concat\",\"exports.concat\",\"iterables\",\"toArray\",\"exports.toArray\",\"arr\",\"e\",\"push\"]\n}\n"]