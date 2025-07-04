import { Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { Model } from 'mongoose';
import { Auth, AuthDocument } from './auth.schema';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private authModel;
    constructor(authModel: Model<AuthDocument>);
    validate(payload: JwtPayload): Promise<Auth>;
}
export {};
