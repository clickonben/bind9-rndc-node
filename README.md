# BIND9 rndc for NodeJS with promises

This module implements the BIND9 rndc management protocol and is
compatible with BIND 9.9 and later.

This project is a fork of [BIND9 rndc for NodeJS](<https://github.com/isc-projects/bind9-rndc-node>) by [Internet Systems Consortium](<https://github.com/isc-projects>).

The functionality is identical to the original but it has been converted to use promises instead of events. If you prefer to use an event based model please use the original.

This is unsupported software and is provided without warranty.

## Example usage

The code below sends the "status" command to the default rndc port
on the machine `localhost`.   The key data is base64 encoded, as per
the usual `rndc.conf` syntax.

```js
    import RNDC from 'bind9-rndc';
    var key = '2or79WFROyibcP/qixhklCiZIL4aHfRIQj7yyodzQBw=';
    var algo = 'sha256';

    const session = new RNDC.create('localhost', 953, key, algo);

    (async () => {
        try {
            await session.connect();
            const data = await session.sendCommand('status');
            console.log(data);
            session.end();   
        } catch (error) {
            console.error(error);
        }    
    })();
```

Each call to `.sendCommand()` sends a single command string to the server.
A persistent connection is maintained to the rndc port until `end()` is called, alowing multiple commands to be sent and achieving higher throughput than is possible compared to opening a new rndc connection for each command.

In BIND 9.11 and later a valid response will contain a `result`
key with a (string) variable containing the value `0`, or an error
code otherwise.

Valid crypto algorithms are `md5`, `sha1`, `sha224`, `sha256`,
`sha384`, and `sha512`.
