"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/dunder-proto@1.0.1";
exports.ids = ["vendor-chunks/dunder-proto@1.0.1"];
exports.modules = {

/***/ "(ssr)/./node_modules/.pnpm/dunder-proto@1.0.1/node_modules/dunder-proto/get.js":
/*!********************************************************************************!*\
  !*** ./node_modules/.pnpm/dunder-proto@1.0.1/node_modules/dunder-proto/get.js ***!
  \********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nvar callBind = __webpack_require__(/*! call-bind-apply-helpers */ \"(ssr)/./node_modules/.pnpm/call-bind-apply-helpers@1.0.2/node_modules/call-bind-apply-helpers/index.js\");\nvar gOPD = __webpack_require__(/*! gopd */ \"(ssr)/./node_modules/.pnpm/gopd@1.2.0/node_modules/gopd/index.js\");\n\nvar hasProtoAccessor;\ntry {\n\t// eslint-disable-next-line no-extra-parens, no-proto\n\thasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */ ([]).__proto__ === Array.prototype;\n} catch (e) {\n\tif (!e || typeof e !== 'object' || !('code' in e) || e.code !== 'ERR_PROTO_ACCESS') {\n\t\tthrow e;\n\t}\n}\n\n// eslint-disable-next-line no-extra-parens\nvar desc = !!hasProtoAccessor && gOPD && gOPD(Object.prototype, /** @type {keyof typeof Object.prototype} */ ('__proto__'));\n\nvar $Object = Object;\nvar $getPrototypeOf = $Object.getPrototypeOf;\n\n/** @type {import('./get')} */\nmodule.exports = desc && typeof desc.get === 'function'\n\t? callBind([desc.get])\n\t: typeof $getPrototypeOf === 'function'\n\t\t? /** @type {import('./get')} */ function getDunder(value) {\n\t\t\t// eslint-disable-next-line eqeqeq\n\t\t\treturn $getPrototypeOf(value == null ? value : $Object(value));\n\t\t}\n\t\t: false;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vZHVuZGVyLXByb3RvQDEuMC4xL25vZGVfbW9kdWxlcy9kdW5kZXItcHJvdG8vZ2V0LmpzIiwibWFwcGluZ3MiOiJBQUFhOztBQUViLGVBQWUsbUJBQU8sQ0FBQyx1SUFBeUI7QUFDaEQsV0FBVyxtQkFBTyxDQUFDLDhFQUFNOztBQUV6QjtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsc0NBQXNDO0FBQ3ZFLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDJFQUEyRSwrQkFBK0I7O0FBRTFHO0FBQ0E7O0FBRUEsV0FBVyxpQkFBaUI7QUFDNUI7QUFDQTtBQUNBO0FBQ0EsZUFBZSxpQkFBaUI7QUFDaEM7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIi9Vc2Vycy93ZW1vL25ldy1mbG93L2FpL0FJTk8vQUlOTy1BUFAvbm9kZV9tb2R1bGVzLy5wbnBtL2R1bmRlci1wcm90b0AxLjAuMS9ub2RlX21vZHVsZXMvZHVuZGVyLXByb3RvL2dldC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhciBjYWxsQmluZCA9IHJlcXVpcmUoJ2NhbGwtYmluZC1hcHBseS1oZWxwZXJzJyk7XG52YXIgZ09QRCA9IHJlcXVpcmUoJ2dvcGQnKTtcblxudmFyIGhhc1Byb3RvQWNjZXNzb3I7XG50cnkge1xuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZXh0cmEtcGFyZW5zLCBuby1wcm90b1xuXHRoYXNQcm90b0FjY2Vzc29yID0gLyoqIEB0eXBlIHt7IF9fcHJvdG9fXz86IHR5cGVvZiBBcnJheS5wcm90b3R5cGUgfX0gKi8gKFtdKS5fX3Byb3RvX18gPT09IEFycmF5LnByb3RvdHlwZTtcbn0gY2F0Y2ggKGUpIHtcblx0aWYgKCFlIHx8IHR5cGVvZiBlICE9PSAnb2JqZWN0JyB8fCAhKCdjb2RlJyBpbiBlKSB8fCBlLmNvZGUgIT09ICdFUlJfUFJPVE9fQUNDRVNTJykge1xuXHRcdHRocm93IGU7XG5cdH1cbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWV4dHJhLXBhcmVuc1xudmFyIGRlc2MgPSAhIWhhc1Byb3RvQWNjZXNzb3IgJiYgZ09QRCAmJiBnT1BEKE9iamVjdC5wcm90b3R5cGUsIC8qKiBAdHlwZSB7a2V5b2YgdHlwZW9mIE9iamVjdC5wcm90b3R5cGV9ICovICgnX19wcm90b19fJykpO1xuXG52YXIgJE9iamVjdCA9IE9iamVjdDtcbnZhciAkZ2V0UHJvdG90eXBlT2YgPSAkT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuXG4vKiogQHR5cGUge2ltcG9ydCgnLi9nZXQnKX0gKi9cbm1vZHVsZS5leHBvcnRzID0gZGVzYyAmJiB0eXBlb2YgZGVzYy5nZXQgPT09ICdmdW5jdGlvbidcblx0PyBjYWxsQmluZChbZGVzYy5nZXRdKVxuXHQ6IHR5cGVvZiAkZ2V0UHJvdG90eXBlT2YgPT09ICdmdW5jdGlvbidcblx0XHQ/IC8qKiBAdHlwZSB7aW1wb3J0KCcuL2dldCcpfSAqLyBmdW5jdGlvbiBnZXREdW5kZXIodmFsdWUpIHtcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBlcWVxZXFcblx0XHRcdHJldHVybiAkZ2V0UHJvdG90eXBlT2YodmFsdWUgPT0gbnVsbCA/IHZhbHVlIDogJE9iamVjdCh2YWx1ZSkpO1xuXHRcdH1cblx0XHQ6IGZhbHNlO1xuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/dunder-proto@1.0.1/node_modules/dunder-proto/get.js\n");

/***/ })

};
;