"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@radix-ui+react-id@1.1.0_@types+react@18.3.24_react@19.1.1";
exports.ids = ["vendor-chunks/@radix-ui+react-id@1.1.0_@types+react@18.3.24_react@19.1.1"];
exports.modules = {

/***/ "(ssr)/./node_modules/.pnpm/@radix-ui+react-id@1.1.0_@types+react@18.3.24_react@19.1.1/node_modules/@radix-ui/react-id/dist/index.mjs":
/*!**************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@radix-ui+react-id@1.1.0_@types+react@18.3.24_react@19.1.1/node_modules/@radix-ui/react-id/dist/index.mjs ***!
  \**************************************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("var react__WEBPACK_IMPORTED_MODULE_0___namespace_cache;\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   useId: () => (/* binding */ useId)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"(ssr)/./node_modules/.pnpm/next@15.5.2_react-dom@19.1.1_react@19.1.1__react@19.1.1/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js\");\n/* harmony import */ var _radix_ui_react_use_layout_effect__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @radix-ui/react-use-layout-effect */ \"(ssr)/./node_modules/.pnpm/@radix-ui+react-use-layout-effect@1.1.0_@types+react@18.3.24_react@19.1.1/node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs\");\n// packages/react/id/src/id.tsx\n\n\nvar useReactId = /*#__PURE__*/ (react__WEBPACK_IMPORTED_MODULE_0___namespace_cache || (react__WEBPACK_IMPORTED_MODULE_0___namespace_cache = __webpack_require__.t(react__WEBPACK_IMPORTED_MODULE_0__, 2)))[\"useId\".toString()] || (() => void 0);\nvar count = 0;\nfunction useId(deterministicId) {\n  const [id, setId] = react__WEBPACK_IMPORTED_MODULE_0__.useState(useReactId());\n  (0,_radix_ui_react_use_layout_effect__WEBPACK_IMPORTED_MODULE_1__.useLayoutEffect)(() => {\n    if (!deterministicId) setId((reactId) => reactId ?? String(count++));\n  }, [deterministicId]);\n  return deterministicId || (id ? `radix-${id}` : \"\");\n}\n\n//# sourceMappingURL=index.mjs.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vQHJhZGl4LXVpK3JlYWN0LWlkQDEuMS4wX0B0eXBlcytyZWFjdEAxOC4zLjI0X3JlYWN0QDE5LjEuMS9ub2RlX21vZHVsZXMvQHJhZGl4LXVpL3JlYWN0LWlkL2Rpc3QvaW5kZXgubWpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTtBQUMrQjtBQUNxQztBQUNwRSxpQkFBaUIseUxBQUs7QUFDdEI7QUFDQTtBQUNBLHNCQUFzQiwyQ0FBYztBQUNwQyxFQUFFLGtGQUFlO0FBQ2pCO0FBQ0EsR0FBRztBQUNILDJDQUEyQyxHQUFHO0FBQzlDO0FBR0U7QUFDRiIsInNvdXJjZXMiOlsiL1VzZXJzL3dlbW8vbmV3LWZsb3cvYWkvQUlOTy9BSU5PLUFQUC9ub2RlX21vZHVsZXMvLnBucG0vQHJhZGl4LXVpK3JlYWN0LWlkQDEuMS4wX0B0eXBlcytyZWFjdEAxOC4zLjI0X3JlYWN0QDE5LjEuMS9ub2RlX21vZHVsZXMvQHJhZGl4LXVpL3JlYWN0LWlkL2Rpc3QvaW5kZXgubWpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIHBhY2thZ2VzL3JlYWN0L2lkL3NyYy9pZC50c3hcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlTGF5b3V0RWZmZWN0IH0gZnJvbSBcIkByYWRpeC11aS9yZWFjdC11c2UtbGF5b3V0LWVmZmVjdFwiO1xudmFyIHVzZVJlYWN0SWQgPSBSZWFjdFtcInVzZUlkXCIudG9TdHJpbmcoKV0gfHwgKCgpID0+IHZvaWQgMCk7XG52YXIgY291bnQgPSAwO1xuZnVuY3Rpb24gdXNlSWQoZGV0ZXJtaW5pc3RpY0lkKSB7XG4gIGNvbnN0IFtpZCwgc2V0SWRdID0gUmVhY3QudXNlU3RhdGUodXNlUmVhY3RJZCgpKTtcbiAgdXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWRldGVybWluaXN0aWNJZCkgc2V0SWQoKHJlYWN0SWQpID0+IHJlYWN0SWQgPz8gU3RyaW5nKGNvdW50KyspKTtcbiAgfSwgW2RldGVybWluaXN0aWNJZF0pO1xuICByZXR1cm4gZGV0ZXJtaW5pc3RpY0lkIHx8IChpZCA/IGByYWRpeC0ke2lkfWAgOiBcIlwiKTtcbn1cbmV4cG9ydCB7XG4gIHVzZUlkXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcFxuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/@radix-ui+react-id@1.1.0_@types+react@18.3.24_react@19.1.1/node_modules/@radix-ui/react-id/dist/index.mjs\n");

/***/ })

};
;