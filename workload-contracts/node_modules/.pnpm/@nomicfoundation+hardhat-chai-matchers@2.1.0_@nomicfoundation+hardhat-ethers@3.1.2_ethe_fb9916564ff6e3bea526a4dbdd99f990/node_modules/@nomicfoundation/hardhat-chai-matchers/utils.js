"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAssert = void 0;
const chai_1 = require("chai");
function evalMessage(message) {
    if (message === undefined) {
        throw new Error("Assertion doesn't have an error message. Please open an issue to report this.");
    }
    return typeof message === "function" ? message() : message;
}
function buildNegated(ssfi) {
    return function (condition, _messageFalse, messageTrue) {
        if (condition) {
            const message = evalMessage(messageTrue);
            throw new chai_1.AssertionError(message, undefined, ssfi);
        }
    };
}
function buildNormal(ssfi) {
    return function (condition, messageFalse, _messageTrue) {
        if (!condition) {
            const message = evalMessage(messageFalse);
            throw new chai_1.AssertionError(message, undefined, ssfi);
        }
    };
}
/**
 * This function is used by the matchers to obtain an `assert` function, which
 * should be used instead of `this.assert`.
 *
 * The first parameter is the value of the `negated` flag. Keep in mind that
 * this value should be captured at the beginning of the matcher's
 * implementation, before any async code is executed. Otherwise things like
 * `.to.emit().and.not.to.emit()` won't work, because by the time the async part
 * of the first emit is executed, the `.not` (executed synchronously) has already
 * modified the flag.
 *
 * The second parameter is what Chai calls the "start stack function indicator",
 * a function that is used to build the stack trace. It's unclear to us what's
 * the best way to use this value, so this needs some trial-and-error. Use the
 * existing matchers for a reference of something that works well enough.
 */
function buildAssert(negated, ssfi) {
    return negated ? buildNegated(ssfi) : buildNormal(ssfi);
}
exports.buildAssert = buildAssert;
//# sourceMappingURL=utils.js.map