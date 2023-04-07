import RNDC_Protocol from "./lib/protocol.js"
const key = '/LWZSgY5dV8NHKPxcbtUPFSDjXQxNiv1d+HPAozgc3c=';
const algo = 'sha256';
const session = new RNDC_Protocol('192.168.1.250', 953, key, algo);

(async () => {
    await session.connect();
    const data = await session.sendCommand('status');
    console.log(data);
    session.end();
})();



