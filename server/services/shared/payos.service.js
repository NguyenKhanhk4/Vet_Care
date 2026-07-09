const PayOS = require('@payos/node');
const PayOSClass = PayOS.PayOS || PayOS;

const payOS = new PayOSClass(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

module.exports = payOS;
