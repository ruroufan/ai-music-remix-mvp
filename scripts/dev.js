import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const webCommand = process.platform === 'win32' ? 'cmd.exe' : npmCommand;
const webArgs = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm run dev:web'] : ['run', 'dev:web'];

const commands = [
  ['api', 'node', ['server/index.js']],
  ['web', webCommand, webArgs],
];

const children = commands.map(([name, command, args]) => {
  const child = spawn(command, args, {
    stdio: 'pipe',
  });

  child.stdout.on('data', (chunk) => process.stdout.write(`[${name}] ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`[${name}] ${chunk}`));
  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
      children.forEach((runningChild) => runningChild.kill());
    }
  });

  return child;
});

const shutdown = () => {
  children.forEach((child) => child.kill());
  process.exit();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
