import { IMockBasicAuthentication } from "./mockBasicAuthentication";
import { IMockApiKeyAuthentication } from "./mockApiKeyAuthentication";

export type IMockAuthentication = IMockBasicAuthentication | IMockApiKeyAuthentication;