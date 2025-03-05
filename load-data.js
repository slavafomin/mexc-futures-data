
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const ENDPOINT = `https://contract.mexc.com/api/v1/contract/kline`;

const SYMBOL = 'THE_USDT';
const INTERVAL = 'Min1';
const DATE_START = new Date('2025-02-12T15:00:00Z');
const DATE_END = new Date('2025-02-13T07:00:00Z');

// -----

const url = new URL(`${ENDPOINT}/${SYMBOL}`);

url.searchParams.set('interval', INTERVAL);

url.searchParams.set('start',
  Math.floor(DATE_START.getTime() / 1_000).toString()
);

url.searchParams.set('end',
  Math.floor(DATE_END.getTime() / 1_000).toString()
);

console.log(`Fetching data from URL: ${url}`);

const response = await fetch(url);

const data = await response.json();

assert.equal(data.success, true);
assert.equal(data.code, 0);

await writeFile(`data.json`,
  JSON.stringify(data, null, 2),
  'utf-8'
);
