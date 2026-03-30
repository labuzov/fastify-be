import { UAParser } from 'ua-parser-js';

export const getNormalizedUserAgent = (userAgent?: string): string => {
  if (!userAgent) return 'Unknown Device';

  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();
  
  const browserName = browser.name || 'Unknown Browser';
  const osName = os.name || 'Unknown OS';
  const deviceType = device.type ? ` (${device.type})` : '';

  return `${browserName}, ${osName}${deviceType}`;
};