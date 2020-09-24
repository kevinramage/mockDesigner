import * as net from "net";

export class PortManager {

    public static isFreePort(port: number) {
        return new Promise<boolean>((resolve) => {
            var server = net.createServer();
            server.listen(port, function () {
                server.once('close', function () {
                    resolve(true);
                })
                server.close()
            });
            server.on('error', function (err) {
              resolve(false);
            })
        });
    }
}