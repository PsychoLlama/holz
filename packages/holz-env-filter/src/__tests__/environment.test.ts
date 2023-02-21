import { detectEnvironment } from '../environment';

describe('detectEnvironment', () => {
  it('detects the correct environment', () => {
    expect(detectEnvironment(undefined)).toMatchObject({ env: 'browser' });
    expect(detectEnvironment({ browser: true })).toMatchObject({
      env: 'browser',
    });

    expect(detectEnvironment({ type: 'renderer' })).toMatchObject({
      env: 'browser',
    });

    expect(detectEnvironment({ __nwjs: true })).toMatchObject({
      env: 'browser',
    });

    expect(detectEnvironment(process)).toMatchObject({ env: 'server' });
  });
});
