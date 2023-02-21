import { detectEnvironment, Environment } from '../environment';

describe('detectEnvironment', () => {
  it('detects the correct environment', () => {
    expect(detectEnvironment(undefined)).toBe(Environment.Browser);
    expect(detectEnvironment({ browser: true })).toBe(Environment.Browser);
    expect(detectEnvironment({ type: 'renderer' })).toBe(Environment.Browser);
    expect(detectEnvironment({ __nwjs: true })).toBe(Environment.Browser);
    expect(detectEnvironment(process)).toBe(Environment.Server);
  });
});
