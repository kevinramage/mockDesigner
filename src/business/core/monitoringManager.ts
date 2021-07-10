import { RequestReceived } from "../monitoring/requestReceived";
import { ResponseSent } from "../monitoring/responseSent";

import * as express from "express";
import * as winston from "winston";
import { ObjectUtils } from "../utils/objectUtils";

export class MonitoringManager {
    private static _instance : MonitoringManager;
    private _requests : RequestReceived[];
    private _responses : ResponseSent[];

    constructor() {
        this._requests = [];
        this._responses = [];
    }

    public saveRequest(req: express.Request) {
        const request = RequestReceived.createFromExpress(req);
        this.requests.push(request);
    }

    public saveResponse(statusCode: number, headers: {[key: string]: string | null}, body: string | null, res: express.Response) {
        const response = ResponseSent.create(statusCode, headers, body);
        this.responses.push(response);

        // Link request and response
        this.identifyRequest(res.req).then((requestIdentified) => {
            response.request = requestIdentified;
            requestIdentified.response = response;

        }).catch((err) => {
            // Avoid crash, error will be ignored (already log)
            // Link between request and response will be not set
        });
    }

    public identifyRequest(req: express.Request) {
        return new Promise<RequestReceived>(async (resolve, reject) => {
            try {
                const requestToIdentify = RequestReceived.createFromExpress(req);
                const hashToIdentify = await requestToIdentify.getHash();
                const hashsTested : string[] = [];
                let requestIdentified : RequestReceived | null = null;
                for (var i = 0; i < this.requests.length; i++) {
                    const hashToTest = await this.requests[i].getHash();
                    hashsTested.push(hashToTest);
                    if (hashToIdentify === hashToTest) {
                        requestIdentified = this.requests[i];
                    }
                }
                if (requestIdentified) {
                    resolve(requestIdentified);
                } else {
                    winston.error("MonitoringManager.identifyRequest - No request identified");
                    winston.error("Hash to identify: " + hashToIdentify);
                    winston.error("Hash tested: " + hashsTested.join(", "));
                    reject(new Error("No request identified"));
                }
            } catch (err) {
                winston.error("MonitoringManager.identifyRequest - Impossible to identify equest: ", err);
                reject(err);
            }
        });
    }

    public getRequests(filterKey: string, filterValue: string, limit: number) {
        const sortByDate = (a, b) => { return a.sentDate.getTime() > b.sentDate.getTime() ? -1 : 1};
        let requests = this._requests.sort(sortByDate);
        if (filterKey != "") {
            requests = requests.filter((req) => { return ObjectUtils.filterObject(req, filterKey, filterValue); });
        }
        requests = requests.slice(0, limit);
        return requests;
    }

    public getResponses(filterKey: string, filterValue: string, limit: number) {
        const sortByDate = (a, b) => { return a.sentDate.getTime() > b.sentDate.getTime() ? -1 : 1};
        let responses = this._responses.sort(sortByDate);
        if (filterKey != "") {
            responses = responses.filter((res) => { return ObjectUtils.filterObject(res, filterKey, filterValue) });
        }
        responses = responses.slice(0, limit);
        return responses;
    }

    public get requests() {
        return this._requests;
    }

    public get responses() {
        return this._responses;
    }

    public static get instance() {
        if (!MonitoringManager._instance) {
            MonitoringManager._instance = new MonitoringManager();
        }
        return MonitoringManager._instance;
    }
}