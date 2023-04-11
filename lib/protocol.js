import RNDC_Serialiser from './serialiser.js';
import { PromiseSocket } from "promise-socket"

/**
 * Class encapsulating a connection to a BIND9 server's rndc port 
 */
class RNDC_Protocol {

	/**
	 * Constructs an RNDC_Protocol object that makes a connection to the
	 * specified host and port and initiates the rndc protocol using the given
	 * key and algorithm.
	 * @param {string} host - the BIND9 server hostname
	 * @param {number} port - the BIND9 server's rndc port
	 * @param {string} key - the rndc shared key, in base64 format
	 * @param {string} algo - the rndc shared algorithm (e.g. "sha256")
	 */
	constructor(host, port, key, algo) {		

		const serialiser = new RNDC_Serialiser(key, algo);
		let serial = Math.floor(Math.pow(2, 32) * Math.random());
		let nonce;
		let buffer = new Buffer([]);
		const socket = new PromiseSocket();

		const send = async (obj) => {
			const now = Math.floor(Date.now() / 1000);
			let ctrl = obj._ctrl = obj._ctrl || new Map();
			ctrl._ser = ++serial;
			ctrl._tim = now;
			ctrl._exp = now + 60;
			await socket.write(serialiser.encode(obj));
		}

		const handle_packet = (packet) => {
			let resp = serialiser.decode(packet);
			if (resp && resp._ctrl && resp._ctrl._nonce) {
				nonce = resp._ctrl._nonce;
			}

			return resp._data
		}

		const processData = (data) => {
			buffer = Buffer.concat([buffer, data]);
			let response;
			if (buffer.length >= 4) {
				let len = buffer.readUInt32BE(0);
				if (buffer.length >= 4 + len) {
					let packet = buffer.slice(0, 4 + len);					
					buffer = buffer.slice(4 + len);
					response = handle_packet(packet);
				}
			}
			return response;
		}

		this.connect = async () => {			
			const promise =  socket.once('data');			
			socket.setTimeout(30000);
			await socket.connect(port, host)
			await send({_data: {type: 'null'}}); // send null to set nonce			
			const data = await promise;
			processData(data);					
		}

		this.sendCommand = async (cmd) => {
			const promise =  socket.once('data');
			let data = null;
			await send({_ctrl: {_nonce: nonce}, _data: {type: cmd}});
			data = await promise;			
			return processData(data);			
		}

		/**
		 * terminates the rndc connection.
		 */
		this.end = () => {
			socket.end();
		}	
	}
}

export default RNDC_Protocol;
