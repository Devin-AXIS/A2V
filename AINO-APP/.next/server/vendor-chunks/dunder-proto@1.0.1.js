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

eval("\n\nvar callBind = __webpack_require__(/*! call-bind-apply-helpers */ \"(ssr)/./node_modules/.pnpm/call-bind-apply-helpers@1.0.2/node_modules/call-bind-apply-helpers/index.js\");\nvar gOPD = __webpack_require__(/*! gopd */ \"(ssr)/./node_modules/.pnpm/gopd@1.2.0/node_modules/gopd/index.js\");\n\nvar hasProtoAccessor;\ntry {\n\t// eslint-disable-next-line no-extra-parens, no-proto\n\thasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */ ([]).__proto__ === Array.prototype;\n} catch (e) {\n\tif (!e || typeof e !== 'object' || !('code' in e) || e.code !== 'ERR_PROTO_ACCESS') {\n\t\tthrow e;\n\t}\n}\n\n// eslint-disable-next-line no-extra-parens\nvar desc = !!hasProtoAccessor && gOPD && gOPD(Object.prototype, /** @type {keyof typeof Object.prototype} */ ('__proto__'));\n\nvar $Object = Object;\nvar $getPrototypeOf = $Object.getPrototypeOf;\n\n/** @type {import('./get')} */\nmodule.exports = desc && typeof desc.get === 'function'\n\t? callBind([desc.get])\n\t: typeof $getPrototypeOf === 'function'\n\t\t? /** @type {import('./get')} */ function getDunder(value) {\n\t\t\t// eslint-disable-next-line eqeqeq\n\t\t\treturn $getPrototypeOf(value == null ? value : $Object(value));\n\t\t}\n\t\t: false;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vZHVuZGVyLXByb3RvQDEuMC4xL25vZGVfbW9kdWxlcy9kdW5kZXItcHJvdG8vZ2V0LmpzIiwibWFwcGluZ3MiOiJBQUFhOztBQUViLGVBQWUsbUJBQU8sQ0FBQyx1SUFBeUI7QUFDaEQsV0FBVyxtQkFBTyxDQUFDLDhFQUFNOztBQUV6QjtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsc0NBQXNDO0FBQ3ZFLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDJFQUEyRSwrQkFBK0I7O0FBRTFHO0FBQ0E7O0FBRUEsV0FBVyxpQkFBaUI7QUFDNUI7QUFDQTtBQUNBO0FBQ0EsZUFBZSxpQkFBaUI7QUFDaEM7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIi9Vc2Vycy9kZXZpbi9Eb2N1bWVudHMvQUlOTy9BSU5PLUFQUC9ub2RlX21vZHVsZXMvLnBucG0vZHVuZGVyLXByb3RvQDEuMC4xL25vZGVfbW9kdWxlcy9kdW5kZXItcHJvdG8vZ2V0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIGNhbGxCaW5kID0gcmVxdWlyZSgnY2FsbC1iaW5kLWFwcGx5LWhlbHBlcnMnKTtcbnZhciBnT1BEID0gcmVxdWlyZSgnZ29wZCcpO1xuXG52YXIgaGFzUHJvdG9BY2Nlc3NvcjtcbnRyeSB7XG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1leHRyYS1wYXJlbnMsIG5vLXByb3RvXG5cdGhhc1Byb3RvQWNjZXNzb3IgPSAvKiogQHR5cGUge3sgX19wcm90b19fPzogdHlwZW9mIEFycmF5LnByb3RvdHlwZSB9fSAqLyAoW10pLl9fcHJvdG9fXyA9PT0gQXJyYXkucHJvdG90eXBlO1xufSBjYXRjaCAoZSkge1xuXHRpZiAoIWUgfHwgdHlwZW9mIGUgIT09ICdvYmplY3QnIHx8ICEoJ2NvZGUnIGluIGUpIHx8IGUuY29kZSAhPT0gJ0VSUl9QUk9UT19BQ0NFU1MnKSB7XG5cdFx0dGhyb3cgZTtcblx0fVxufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZXh0cmEtcGFyZW5zXG52YXIgZGVzYyA9ICEhaGFzUHJvdG9BY2Nlc3NvciAmJiBnT1BEICYmIGdPUEQoT2JqZWN0LnByb3RvdHlwZSwgLyoqIEB0eXBlIHtrZXlvZiB0eXBlb2YgT2JqZWN0LnByb3RvdHlwZX0gKi8gKCdfX3Byb3RvX18nKSk7XG5cbnZhciAkT2JqZWN0ID0gT2JqZWN0O1xudmFyICRnZXRQcm90b3R5cGVPZiA9ICRPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG5cbi8qKiBAdHlwZSB7aW1wb3J0KCcuL2dldCcpfSAqL1xubW9kdWxlLmV4cG9ydHMgPSBkZXNjICYmIHR5cGVvZiBkZXNjLmdldCA9PT0gJ2Z1bmN0aW9uJ1xuXHQ/IGNhbGxCaW5kKFtkZXNjLmdldF0pXG5cdDogdHlwZW9mICRnZXRQcm90b3R5cGVPZiA9PT0gJ2Z1bmN0aW9uJ1xuXHRcdD8gLyoqIEB0eXBlIHtpbXBvcnQoJy4vZ2V0Jyl9ICovIGZ1bmN0aW9uIGdldER1bmRlcih2YWx1ZSkge1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGVxZXFlcVxuXHRcdFx0cmV0dXJuICRnZXRQcm90b3R5cGVPZih2YWx1ZSA9PSBudWxsID8gdmFsdWUgOiAkT2JqZWN0KHZhbHVlKSk7XG5cdFx0fVxuXHRcdDogZmFsc2U7XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/dunder-proto@1.0.1/node_modules/dunder-proto/get.js\n");

/***/ })

};
;