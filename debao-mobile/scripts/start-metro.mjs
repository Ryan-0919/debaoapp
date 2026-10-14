import http from 'node:http';

// Node rejects Chinese filesystem paths in HTTP header values. React Native's
// status middleware publishes the project root in a header, so encode only
// that header while leaving Metro's actual project root unchanged.
const originalSetHeader = http.ServerResponse.prototype.setHeader;
http.ServerResponse.prototype.setHeader = function setHeader(name, value) {
  if (name.toLowerCase() === 'x-react-native-project-root' && typeof value === 'string') {
    value = encodeURIComponent(value);
  }
  return originalSetHeader.call(this, name, value);
};

if (process.argv[2] !== 'start') {
  process.argv.splice(2, 0, 'start');
}
const {run} = await import('@react-native-community/cli');
run();
