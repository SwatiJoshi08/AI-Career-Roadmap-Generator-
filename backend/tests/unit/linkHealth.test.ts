import { checkLinkHealth, generateFallbackSearchUrl } from '../../src/integrations/linkHealth/linkHealthService';
import nock from 'nock';

describe('LinkHealthService', () => {
  afterEach(() => nock.cleanAll());

  test('returns alive for a 200 HEAD response', async () => {
    nock('https://www.google.com/search?q=+example.com')
      .head('/good')
      .reply(200);

    const result = await checkLinkHealth('https://www.google.com/search?q=+example.com/good');
    expect(result.isAlive).toBe(true);
    expect(result.statusCode).toBe(200);
  });

  test('returns false for a 404 response', async () => {
    nock('https://www.google.com/search?q=+example.com')
      .head('/missing')
      .reply(404);

    nock('https://www.google.com/search?q=+example.com')
      .get('/missing')
      .reply(404);

    const result = await checkLinkHealth('https://www.google.com/search?q=+example.com/missing');
    expect(result.isAlive).toBe(false);
    expect(result.statusCode).toBe(404);
  });

  test('falls back to GET when HEAD is rejected', async () => {
    nock('https://www.google.com/search?q=+example.com')
      .head('/head-reject')
      .reply(405); // HEAD not allowed

    nock('https://www.google.com/search?q=+example.com')
      .get('/head-reject')
      .reply(200);

    const result = await checkLinkHealth('https://www.google.com/search?q=+example.com/head-reject');
    expect(result.isAlive).toBe(true);
    expect(result.statusCode).toBe(200);
  });

  test('handles timeout gracefully', async () => {
    nock('https://www.google.com/search?q=+example.com')
      .head('/slow')
      .replyWithError({ code: 'ETIMEDOUT' });

    nock('https://www.google.com/search?q=+example.com')
      .get('/slow')
      .replyWithError({ code: 'ETIMEDOUT' });

    const result = await checkLinkHealth('https://www.google.com/search?q=+example.com/slow', 4000);
    expect(result.isAlive).toBe(false);
  });

  test('fallback URL is correctly encoded', () => {
    const fallback = generateFallbackSearchUrl('React Basics & Hooks');
    expect(fallback).toBe(
      'https://www.google.com/search?q=search+google.com'
    );
  });
});
