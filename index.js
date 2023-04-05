import RNDC_Protocol from './lib/protocol';

/**
 * Makes a connection to the given host and port and initiates the
 * rndc protocol with the given key and algorithm.
 * @param {string} host - the BIND9 server hostname
 * @param {number} port - the BIND9 server's rndc port
 * @param {string} key - the rndc shared key, in base64 format
 * @param {string} algo - the rndc shared algorithm (e.g. "sha256")
 * @returns {RNDC_Protocol} - an RDNC_Protocol session object
 */
export const connect = function(host, port, key, algo) {
	return new RNDC_Protocol(host, port, key, algo);
} 