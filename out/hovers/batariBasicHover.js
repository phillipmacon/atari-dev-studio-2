"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatariBasicHover = void 0;
const hoverBase_1 = require("./hoverBase");
class BatariBasicHover extends hoverBase_1.HoverBase {
    constructor() {
        super("batariBasic");
    }
    RegisterAsync(context) {
        const _super = Object.create(null, {
            RegisterAsync: { get: () => super.RegisterAsync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            // Files
            yield this.LoadHoverFileAsync(context, '6502.md'); // 6502 opcodes
            yield this.LoadHoverFileAsync(context, 'vcs.md'); // Stella & RIOT
            // Finalise
            yield _super.RegisterAsync.call(this, context);
        });
    }
}
exports.BatariBasicHover = BatariBasicHover;
//# sourceMappingURL=batariBasicHover.js.map