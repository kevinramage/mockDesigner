import { Request, Response } from "express";
import * as winston from "winston";
import * as util from "util";
import * as querystring from "querystring";

export module APIKEY_SOURCE {
    export const HEADER = "HEADER";
    export const QUERY = "QUERY";
}

export class AuthenticationManager {

    public static basicAuthentication(userNameExpected: string, passwordExpected: string, req: Request, res: Response) {
        winston.debug("AuthenticationManager.basicAuthentication");
        var basicAuthenticationHeader = req.headers["authorization"];
        if ( basicAuthenticationHeader ) {
            basicAuthenticationHeader = basicAuthenticationHeader as string;
            if ( basicAuthenticationHeader.startsWith("Basic ") ) {
                const data = basicAuthenticationHeader.substring(("Basic ").length);
                const buffer = Buffer.from(data, "base64");
                const decoded = buffer.toString("ascii");
                const index = decoded.indexOf(":");
                if ( index != -1 ) {
                    const userName = decoded.substring(0, index);
                    const password = decoded.substring(index+1);
                    winston.info(util.format("AuthenticationManager.basicAuthentication: userName: '%s', password: '%s'", userName, password));
                    if ( userName == userNameExpected && password == passwordExpected ) {
                        return true;
                    } else {
                        this.authenticationFailed(req, res);
                        return false;
                    }
                } else {
                    winston.error("The authorization is not a correct basic authentication. The header decoded must contains semi colon separator");
                    this.authenticationRequired(req, res);
                    return false;
                }
            } else {
                winston.error("The authorization is not a correct basic authentication. The header must startsWith 'Basic'");
                this.authenticationRequired(req, res);
                return false;
            }
        } else {
            winston.warn("Authorization header not present");
            this.authenticationRequired(req, res);
            return false;
        }
    }

    public static apiKeyAuthentication(source: string, keyName: string, keyValue: string, req: Request, res: Response) {
        winston.debug("AuthenticationManager.apiKeyAuthentication");
        switch ( source ) {
            case APIKEY_SOURCE.HEADER:
                return AuthenticationManager.apiKeyAuthenticationFromHeader(keyName, keyValue, req, res);

            case APIKEY_SOURCE.QUERY:
                return AuthenticationManager.apiKeyAuthenticationFromQuery(keyName, keyValue, req, res);
        }
        return false;
    }

    private static apiKeyAuthenticationFromHeader(keyName: string, keyValue: string, req: Request, res: Response) {
        winston.debug("AuthenticationManager.apiKeyAuthenticationFromHeader");
        var apiKey = req.headers[keyName];
        if ( apiKey ) {
            if ( apiKey == keyValue ) {
                return true
            } else {
                this.authenticationFailed(req, res);
                return false;
            }
        } else {
            winston.warn("API header not present");
            this.authenticationRequired(req, res);
            return false;
        }
    }

    private static apiKeyAuthenticationFromQuery(keyName: string, keyValue: string, req: Request, res: Response) {
        winston.info("apiKeyAuthenticationFromQuery - Url" + req.url);
        const query = querystring.parse(req.url);
        var apiValue = query[keyName];
        if ( apiValue ) {
            apiValue = apiValue as string;
            if ( apiValue == keyValue ) {
                return true;
            } else {
                this.authenticationFailed(req, res);
                return false;
            }
        } else {
            winston.error("Api key header not present");
            this.authenticationRequired(req, res);
            return false;
        }
    }

    public static bearerAuthentication(req: Request, res: Response) {
        winston.debug("AuthenticationManager.bearerAuthentication");
    }

    public static digestAuthentication(req: Request, res: Response) {
        winston.debug("AuthenticationManager.digestAuthentication");
    }

    public static oAuthAuthentication(req: Request, res: Response) {
        winston.debug("AuthenticationManager.oAuthAuthentication");
    }

    public static oAuth2Authentication(req: Request, res: Response) {
        winston.debug("AuthenticationManager.oAuth2Authentication");
    }

    public static hawkAuthentication(req: Request, res: Response) {
        winston.debug("AuthenticationManager.hawkAuthentication");
    }

    public static authenticationRequired(req: Request, res: Response) {
        winston.debug("AuthenticationManager.authenticationRequired");
        res.status(401);
        res.setHeader("Content-Type", "text/plain");
        res.write("Authentication required");
        res.end();
    }

    public static authenticationFailed(req: Request, res: Response) {
        winston.debug("AuthenticationManager.authenticationFailed");
        res.status(403);
        res.setHeader("Content-Type", "text/plain");
        res.write("Authentication failed");
        res.end();
    }
}