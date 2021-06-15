import { IApiKeyAuthentication } from "./authentication/apikeyAuthentication";
import { IBasicAuthentication } from "./authentication/basicAuthentication";
import { ITokenAuthentication } from "./authentication/tokenAuthentication";

export type IAuthentication = IBasicAuthentication | IApiKeyAuthentication | ITokenAuthentication;