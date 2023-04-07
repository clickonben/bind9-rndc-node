import { expect } from 'chai';
import sinon from 'sinon';
import net from 'net';
import SocketWrapper from '../lib/socketWrapper.js';
import EventEmitter from 'events';

describe('SocketWrapper', () => {
  
    const createSocketMockWithEvents = () => {
    const socketMock = new EventEmitter();
    sinon.stub(socketMock, 'once').callsFake(function (event, callback) {
      EventEmitter.prototype.once.call(this, event, callback);
    });
    sinon.stub(socketMock, 'off').callsFake(function (event, callback) {
      EventEmitter.prototype.off.call(this, event, callback);
    });
  
    return socketMock;
  }

  afterEach(() => {
    sinon.restore();
  });

  describe('connect', () => {        
    let socketMock;
    let socketWrapper;

    it('should connect and resolve the promise', async () => {
      const port = 1234;
      const host = 'localhost';
      socketMock = sinon.createStubInstance(net.Socket);
      socketWrapper = new SocketWrapper(socketMock);
  
      socketMock.connect.callsArgWith(2); // Simulate a successful connection by calling the connectHandler
  
      await socketWrapper.connect(port, host);
  
      expect(socketMock.connect.calledWith(port, host)).to.be.true;
    });
  
    it('should reject the promise on error', async () => {
      const port = 1234;
      const host = 'localhost';
      const error = new Error('Connection error');
      socketMock = sinon.createStubInstance(net.Socket);
      socketWrapper = new SocketWrapper(socketMock);
  
      socketMock.connect.callsArgWith(2); // Simulate a successful connection by calling the connectHandler
      socketMock.once.withArgs('error').callsArgWith(1, error); // Simulate an error event
  
      try {
        await socketWrapper.connect(port, host);
      } catch (err) {
        expect(err).to.equal(error);
      }
  
      expect(socketMock.connect.calledWith(port, host)).to.be.true;
    });
  });

  describe('once', () => {
    const socketMock = createSocketMockWithEvents();
    const socketWrapper = new SocketWrapper(socketMock) ;

    it('should resolve the promise when the event is emitted', async () => {
        const testData = 'test-data';

        var promise = socketWrapper.once('data');
        socketMock.emit('data', testData);

        const result = await promise;
        expect(result).to.equal(testData);
    });

    it('should reject the promise when an error event is emitted', async () => {
        const testError = new Error('test-error');
    
        const promise = socketWrapper.once('data');
        socketMock.emit('error', testError); 
    
        try {
          await promise;
          expect.fail('The promise should have been rejected');
        } catch (error) {
          expect(error).to.equal(testError);
        }
      });
  });
  
});


