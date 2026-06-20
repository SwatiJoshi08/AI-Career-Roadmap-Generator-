import { checkLinkHealth } from './src/integrations/linkHealth/linkHealthService';

const urls = [
  'https://developer.mozilla.org/en-US/docs/Web/',
  'https://www.freecodecamp.org/learn',
  'https://www.theodinproject.com/paths',
  'https://javascript.info/',
  'https://react.dev/',
  'https://nodejs.org/en/docs/',
  'https://github.com/search?q=',
  'https://www.google.com/search?q=+vercel.com',
  'https://www.google.com/search?q=+linkedin.com'
];

async function run() {
  for (const url of urls) {
    const res = await checkLinkHealth(url);
    console.log(`${url} - isAlive: ${res.isAlive}, statusCode: ${res.statusCode}`);
  }
}

run();
