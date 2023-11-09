import type { Options } from '@wdio/types'
import { spawn, spawnSync } from 'child_process'
import os from 'os'
import path from 'path'

let tauriDriver

export const config: Options.Testrunner = {
  specs: ['./tests/specs/**/*.ts'],
  // Patterns to exclude.
  exclude: [
    // 'path/to/excluded/files'
  ],
  maxInstances: 1,
  hostname: 'localhost',
  port: 4444,
  capabilities: [
    {
      // @ts-expect-error
      browserName: 'wry',
      // @ts-expect-error
      maxInstances: 1,
      'tauri:options': {
        // @ts-ignore
        application:
          './backend/target/release/wbook' +
          (os.platform() === 'win32' ? '.exe' : '')
      }
    }
  ],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  },
  onPrepare: () => spawnSync('pnpm', ['tauri', 'build'], {
    stdio: [null, process.stdout, process.stderr]
  }),

  // ensure we are running `tauri-driver` before the session starts so that we can proxy the webdriver requests
  beforeSession: async () =>
    (tauriDriver = spawn(
      path.resolve(
        os.homedir(),
        '.cargo',
        'bin',
        'tauri-driver' + (os.platform() === 'win32' ? '.exe' : '')
      ),
      [],
      { stdio: [null, process.stdout, process.stderr] }
    )),

  // clean up the `tauri-driver` process we spawned at the start of the session
  afterSession: () => tauriDriver.kill()
}
