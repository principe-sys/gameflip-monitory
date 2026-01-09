const net = require('net');
const tls = require('tls');

function buildCommand(args) {
  return `*${args.length}\r\n${args
    .map((arg) => {
      const value = String(arg);
      return `$${Buffer.byteLength(value)}\r\n${value}\r\n`;
    })
    .join('')}`;
}

function parseSimpleString(buffer) {
  const end = buffer.indexOf('\r\n');
  if (end === -1) return null;
  return { value: buffer.slice(1, end).toString(), rest: buffer.slice(end + 2) };
}

function parseInteger(buffer) {
  const end = buffer.indexOf('\r\n');
  if (end === -1) return null;
  return { value: parseInt(buffer.slice(1, end).toString(), 10), rest: buffer.slice(end + 2) };
}

function parseBulkString(buffer) {
  const end = buffer.indexOf('\r\n');
  if (end === -1) return null;
  const length = parseInt(buffer.slice(1, end).toString(), 10);
  if (Number.isNaN(length)) return null;
  if (length === -1) {
    return { value: null, rest: buffer.slice(end + 2) };
  }
  const start = end + 2;
  const finish = start + length;
  if (buffer.length < finish + 2) return null;
  const value = buffer.slice(start, finish).toString();
  return { value, rest: buffer.slice(finish + 2) };
}

function parseResponse(buffer) {
  if (buffer.length === 0) return null;
  const prefix = buffer[0];
  if (prefix === 43) return parseSimpleString(buffer); // +
  if (prefix === 58) return parseInteger(buffer); // :
  if (prefix === 36) return parseBulkString(buffer); // $
  if (prefix === 45) {
    const parsed = parseSimpleString(buffer);
    if (!parsed) return null;
    throw new Error(parsed.value);
  }
  return null;
}

async function sendCommand(url, args, authArgs) {
  const command = authArgs ? buildCommand(['AUTH', ...authArgs]) + buildCommand(args) : buildCommand(args);
  const useTls = url.protocol === 'rediss:';

  return new Promise((resolve, reject) => {
    const socket = useTls
      ? tls.connect({
          host: url.hostname,
          port: Number(url.port || 6379),
          servername: url.hostname
        })
      : net.connect({
          host: url.hostname,
          port: Number(url.port || 6379)
        });

    let buffer = Buffer.alloc(0);
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error('Redis command timeout'));
    }, 5000);

    socket.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    let responses = 0;
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      try {
        const parsed = parseResponse(buffer);
        if (parsed) {
          responses += 1;
          buffer = parsed.rest;
          if (!authArgs || responses === 2) {
            clearTimeout(timeout);
            socket.end();
            resolve(parsed.value);
          }
        }
      } catch (err) {
        clearTimeout(timeout);
        socket.end();
        reject(err);
      }
    });

    socket.on('connect', () => {
      socket.write(command);
    });
  });
}

function getRedisClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  const url = new URL(process.env.REDIS_URL);
  const authArgs = url.username || url.password ? (url.password ? [url.username, url.password] : [url.username]) : null;

  return {
    async get(key) {
      return sendCommand(url, ['GET', key], authArgs);
    },
    async set(key, value) {
      await sendCommand(url, ['SET', key, value], authArgs);
    },
    async del(key) {
      await sendCommand(url, ['DEL', key], authArgs);
    }
  };
}

module.exports = { getRedisClient };
