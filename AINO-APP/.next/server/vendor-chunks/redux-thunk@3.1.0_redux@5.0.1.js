"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/redux-thunk@3.1.0_redux@5.0.1";
exports.ids = ["vendor-chunks/redux-thunk@3.1.0_redux@5.0.1"];
exports.modules = {

/***/ "(ssr)/./node_modules/.pnpm/redux-thunk@3.1.0_redux@5.0.1/node_modules/redux-thunk/dist/redux-thunk.mjs":
/*!********************************************************************************************************!*\
  !*** ./node_modules/.pnpm/redux-thunk@3.1.0_redux@5.0.1/node_modules/redux-thunk/dist/redux-thunk.mjs ***!
  \********************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   thunk: () => (/* binding */ thunk),\n/* harmony export */   withExtraArgument: () => (/* binding */ withExtraArgument)\n/* harmony export */ });\n// src/index.ts\nfunction createThunkMiddleware(extraArgument) {\n  const middleware = ({ dispatch, getState }) => (next) => (action) => {\n    if (typeof action === \"function\") {\n      return action(dispatch, getState, extraArgument);\n    }\n    return next(action);\n  };\n  return middleware;\n}\nvar thunk = createThunkMiddleware();\nvar withExtraArgument = createThunkMiddleware;\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vcmVkdXgtdGh1bmtAMy4xLjBfcmVkdXhANS4wLjEvbm9kZV9tb2R1bGVzL3JlZHV4LXRodW5rL2Rpc3QvcmVkdXgtdGh1bmsubWpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBLHdCQUF3QixvQkFBb0I7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSUUiLCJzb3VyY2VzIjpbIi9Vc2Vycy93ZW1vL25ldy1mbG93L2FpL0FJTk8vQUlOTy1BUFAvbm9kZV9tb2R1bGVzLy5wbnBtL3JlZHV4LXRodW5rQDMuMS4wX3JlZHV4QDUuMC4xL25vZGVfbW9kdWxlcy9yZWR1eC10aHVuay9kaXN0L3JlZHV4LXRodW5rLm1qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBzcmMvaW5kZXgudHNcbmZ1bmN0aW9uIGNyZWF0ZVRodW5rTWlkZGxld2FyZShleHRyYUFyZ3VtZW50KSB7XG4gIGNvbnN0IG1pZGRsZXdhcmUgPSAoeyBkaXNwYXRjaCwgZ2V0U3RhdGUgfSkgPT4gKG5leHQpID0+IChhY3Rpb24pID0+IHtcbiAgICBpZiAodHlwZW9mIGFjdGlvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICByZXR1cm4gYWN0aW9uKGRpc3BhdGNoLCBnZXRTdGF0ZSwgZXh0cmFBcmd1bWVudCk7XG4gICAgfVxuICAgIHJldHVybiBuZXh0KGFjdGlvbik7XG4gIH07XG4gIHJldHVybiBtaWRkbGV3YXJlO1xufVxudmFyIHRodW5rID0gY3JlYXRlVGh1bmtNaWRkbGV3YXJlKCk7XG52YXIgd2l0aEV4dHJhQXJndW1lbnQgPSBjcmVhdGVUaHVua01pZGRsZXdhcmU7XG5leHBvcnQge1xuICB0aHVuayxcbiAgd2l0aEV4dHJhQXJndW1lbnRcbn07XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/redux-thunk@3.1.0_redux@5.0.1/node_modules/redux-thunk/dist/redux-thunk.mjs\n");

/***/ })

};
;