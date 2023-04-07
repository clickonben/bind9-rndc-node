import net from 'net';
class SocketWrapper {
  constructor(socket) {
    this.socket = socket ?? new net.Socket();            
  }

  connect(port, host) {
    return new Promise((resolve, reject) => {
      const errorHandler = (error) => {
        this.socket.off('connect', connectHandler);
        reject(error);
      };
  
      const connectHandler = () => {
        this.socket.off('error', errorHandler);
        resolve();
      };
  
      this.socket.connect(port, host, connectHandler);
      this.socket.once('error', errorHandler);
    });
  }  
  
  once(eventName)  {
    const promise = new Promise((resolve, reject) => {
        const errorHandler = (error) => {
          this.socket.off(eventName, eventNameHandler);
          this.socket.off('error', errorHandler);            
          reject(error);
        };
  
        const eventNameHandler = (data) => {
          this.socket.off(eventName, eventNameHandler);
          this.socket.off('error', errorHandler);            
          resolve(data);           
        };
  
        this.socket.once(eventName, eventNameHandler);
        this.socket.once('error', errorHandler);
      });    
      
      return promise;
  }  

  async *on(eventName) {
    let queue = [];
    let resolveNext;

    const eventNameHandler = (data) => {
      if (resolveNext) {
        resolveNext({ value: data, done: false });
        resolveNext = null;
      } else {
        queue.push(data);
      }
    };

    this.socket.on(eventName, eventNameHandler);

    try {
      while (true) {
        if (queue.length > 0) {
          yield queue.shift();
        } else {
          const nextItem = new Promise((resolve) => {
            resolveNext = resolve;
          });
          yield await nextItem;
        }
      }
    } finally {
      this.socket.off(eventName, eventNameHandler);
    }
  } 

  write(data) {
    return new Promise((resolve, reject) => {
      this.socket.write(data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  end() {
    this.socket.end();
  }

  setTimeout(timeout) {
    this.socket.setTimeout(timeout);
  }
}

export default SocketWrapper;
