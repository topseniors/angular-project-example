const wsProtocol = (location.protocol === 'http:') ? 'ws:' : 'wss:';
const wsHost = location.host;

export const environment = {
  production: true,
  envPath: '/',
  apiPath: 'ddm/rest/',
  webSocket: {
    syncSystemBase: `${wsProtocol}//${wsHost}/sync`,
    auditBase: `${wsProtocol}//${wsHost}/audit`
  }
};
