"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const auth_schema_1 = require("./auth.schema");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    constructor(authModel, jwtService) {
        this.authModel = authModel;
        this.jwtService = jwtService;
    }
    ;
    async signUp(createUserDto) {
        const { name, password } = createUserDto;
        const existingUser = await this.authModel.findOne({ name });
        if (existingUser) {
            throw new common_1.ConflictException('this username is already taken', {
                cause: new Error(),
                description: '409 this action cause confliction on existing resource'
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const User = new this.authModel({
            name: name,
            password: hashedPassword
        });
        try {
            await User.save();
        }
        catch (error) {
            console.error('Error saving user:', error);
            throw new common_1.InternalServerErrorException('Failed to create user');
        }
    }
    async signIn(createUserDto) {
        const { name, password } = createUserDto;
        const user = await this.authModel.findOne({ name });
        if (user && await bcrypt.compare(password, user.password)) {
            const payload = { name };
            const accessToken = await this.jwtService.sign(payload);
            return { accessToken };
        }
        else {
            throw new common_1.UnauthorizedException('invalid credentials, check your password and name again');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(auth_schema_1.Auth.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map