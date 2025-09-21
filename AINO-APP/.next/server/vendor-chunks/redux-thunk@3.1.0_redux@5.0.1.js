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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   thunk: () => (/* binding */ thunk),\n/* harmony export */   withExtraArgument: () => (/* binding */ withExtraArgument)\n/* harmony export */ });\n// src/index.ts\nfunction createThunkMiddleware(extraArgument) {\n  const middleware = ({ dispatch, getState }) => (next) => (action) => {\n    if (typeof action === \"function\") {\n      return action(dispatch, getState, extraArgument);\n    }\n    return next(action);\n  };\n  return middleware;\n}\nvar thunk = createThunkMiddleware();\nvar withExtraArgument = createThunkMiddleware;\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vcmVkdXgtdGh1bmtAMy4xLjBfcmVkdXhANS4wLjEvbm9kZV9tb2R1bGVzL3JlZHV4LXRodW5rL2Rpc3QvcmVkdXgtdGh1bmsubWpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBLHdCQUF3QixvQkFBb0I7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSUUiLCJzb3VyY2VzIjpbIi9Vc2Vycy9kZXZpbi9Eb2N1bWVudHMvQUlOTy1kZXZlbG9wL0FJTk8tQVBQL25vZGVfbW9kdWxlcy8ucG5wbS9yZWR1eC10aHVua0AzLjEuMF9yZWR1eEA1LjAuMS9ub2RlX21vZHVsZXMvcmVkdXgtdGh1bmsvZGlzdC9yZWR1eC10aHVuay5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gc3JjL2luZGV4LnRzXG5mdW5jdGlvbiBjcmVhdGVUaHVua01pZGRsZXdhcmUoZXh0cmFBcmd1bWVudCkge1xuICBjb25zdCBtaWRkbGV3YXJlID0gKHsgZGlzcGF0Y2gsIGdldFN0YXRlIH0pID0+IChuZXh0KSA9PiAoYWN0aW9uKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBhY3Rpb24gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmV0dXJuIGFjdGlvbihkaXNwYXRjaCwgZ2V0U3RhdGUsIGV4dHJhQXJndW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gbmV4dChhY3Rpb24pO1xuICB9O1xuICByZXR1cm4gbWlkZGxld2FyZTtcbn1cbnZhciB0aHVuayA9IGNyZWF0ZVRodW5rTWlkZGxld2FyZSgpO1xudmFyIHdpdGhFeHRyYUFyZ3VtZW50ID0gY3JlYXRlVGh1bmtNaWRkbGV3YXJlO1xuZXhwb3J0IHtcbiAgdGh1bmssXG4gIHdpdGhFeHRyYUFyZ3VtZW50XG59O1xuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/redux-thunk@3.1.0_redux@5.0.1/node_modules/redux-thunk/dist/redux-thunk.mjs\n");

/***/ })

};
;