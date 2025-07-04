"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const common_1 = require("@nestjs/common");
exports.getUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
});
//# sourceMappingURL=get-user.decorator.js.map