import * as fs from 'fs';

let isDockerCached: boolean;

function hasDockerEnv(): boolean {
  try {
    fs.statSync('/.dockerenv');
    return true;
  } catch {
    return false;
  }
}

function hasDockerCGroup(): boolean {
  try {
    return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
  } catch {
    return false;
  }
}

export function isDocker(): boolean {
  // TODO: Use `??=` when targeting Node.js 16.
  if (isDockerCached === undefined) {
    isDockerCached = hasDockerEnv() || hasDockerCGroup();
  }

  return isDockerCached;
}
