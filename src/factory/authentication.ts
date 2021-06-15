import { APIKEY_SOURCES, AUTHENTICATIONS } from "../business/utils/enum";
import { IApiKeyAuthentication } from "../interface/authentication/apikeyAuthentication";
import { IBasicAuthentication } from "../interface/authentication/basicAuthentication";
import { IAuthentication } from "../interface/authentication";
import { BasicAuthentication } from "../business/project/authentication/basicAuthentication";
import { ApiKeyAuthentication } from "../business/project/authentication/apiKeyAuthentication";
import { ITokenAuthentication } from "../interface/authentication/tokenAuthentication";
import { TokenAutentication } from "../business/project/authentication/tokenAuthentication";

export class AuthenticationFactory {

    public static build(authenticationData : IAuthentication) {
        if (authenticationData.type.toUpperCase() === AUTHENTICATIONS.BASIC) {
            return AuthenticationFactory.buildBasicAuthentication(authenticationData as IBasicAuthentication);

        } else if (authenticationData.type.toUpperCase() === AUTHENTICATIONS.APIKEY) {
            return AuthenticationFactory.buildApiKeyAuthentication(authenticationData as IApiKeyAuthentication);

        } else if (authenticationData.type.toUpperCase() === AUTHENTICATIONS.TOKEN) {
            return AuthenticationFactory.buildTokenAuthentication(authenticationData as ITokenAuthentication);

        } else {
            return null;
        }
    }

    private static buildBasicAuthentication(authenticationData : IBasicAuthentication) {
        const basicAuthentication = new BasicAuthentication();

        if (authenticationData.username) { basicAuthentication.username = authenticationData.username; }
        if (authenticationData.password) { basicAuthentication.password = authenticationData.password; }

        return basicAuthentication;
    }

    private static buildApiKeyAuthentication(authenticationData : IApiKeyAuthentication) {
        const apikeyAuthentication = new ApiKeyAuthentication();

        if (authenticationData.source && authenticationData.source.toUpperCase() === APIKEY_SOURCES.HEADER) {
            apikeyAuthentication.source = APIKEY_SOURCES.HEADER;
        }
        if (authenticationData.source && authenticationData.source.toUpperCase() === APIKEY_SOURCES.QUERY) {
            apikeyAuthentication.source = APIKEY_SOURCES.QUERY;
        }
        if (authenticationData.key) { apikeyAuthentication.key = authenticationData.key; }
        if (authenticationData.value) { apikeyAuthentication.value = authenticationData.value; }

        return apikeyAuthentication;
    }

    private static buildTokenAuthentication(authenticationData : ITokenAuthentication) {
        const tokenAuthentication = new TokenAutentication();

        if (authenticationData.token) { tokenAuthentication.token = authenticationData.token; }

        return tokenAuthentication;
    }
}