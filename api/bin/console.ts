/*
|--------------------------------------------------------------------------
| Ace entry point
|--------------------------------------------------------------------------
|
| The "console.ts" file is the entrypoint for booting the AdonisJS
| command-line framework and executing commands.
|
| Commands do not boot the application, unless the currently running command
| has "options.startApp" flag set to true.
|
*/

import 'reflect-metadata'
import { Ignitor, prettyPrintError } from '@adonisjs/core'

/**
 * URL to the application root. AdonisJS need it to resolve
 * paths to file and directories for scaffolding commands
 */
const APP_ROOT = new URL('../', import.meta.url)

/**
 * The importer is used to import files in context of the
 * application.
 */
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

/**
 * Safety check for destructive commands
 * These commands will DELETE ALL DATA and should only run in test environment
 * unless explicitly bypassed with --dangerously-force-on-non-test-db
 */
const DESTRUCTIVE_COMMANDS = ['migration:fresh', 'migration:reset', 'db:wipe']
const args = process.argv.slice(2)
const command = args[0]
const nodeEnv = process.env.NODE_ENV || 'development'
const hasDangerousForce = args.includes('--dangerously-force-on-non-test-db')

if (DESTRUCTIVE_COMMANDS.includes(command) && nodeEnv !== 'test' && !hasDangerousForce) {
  console.error('\x1b[31m%s\x1b[0m', '╔══════════════════════════════════════════════════════════════╗')
  console.error('\x1b[31m%s\x1b[0m', '║                    ⚠️  SAFETY CHECK FAILED                    ║')
  console.error('\x1b[31m%s\x1b[0m', '╚══════════════════════════════════════════════════════════════╝')
  console.error('')
  console.error('\x1b[31m%s\x1b[0m', `Command "${command}" is DESTRUCTIVE and will DELETE ALL DATA.`)
  console.error('')
  console.error(`Current environment: \x1b[33m${nodeEnv}\x1b[0m`)
  console.error('')
  console.error('This command is only allowed in \x1b[32mtest\x1b[0m environment.')
  console.error('')
  console.error('To run on test database:')
  console.error('\x1b[36m%s\x1b[0m', `  NODE_ENV=test node ace ${command}`)
  console.error('')
  console.error('To apply new migrations safely (production-safe):')
  console.error('\x1b[36m%s\x1b[0m', '  node ace migration:run')
  console.error('')
  console.error('To reset dev database (keeps schema, loses data):')
  console.error('\x1b[36m%s\x1b[0m', '  node ace migration:rollback --batch=0 && node ace migration:run')
  console.error('')
  console.error('To force destructive command (DANGER - data loss):')
  console.error('\x1b[36m%s\x1b[0m', `  node ace ${command} --dangerously-force-on-non-test-db`)
  console.error('')
  process.exit(1)
}

// Remove our custom flag before passing to ace (it doesn't know about it)
const filteredArgs = args.filter((arg) => arg !== '--dangerously-force-on-non-test-db')
process.argv = [...process.argv.slice(0, 2), ...filteredArgs]

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  .ace()
  .handle(process.argv.splice(2))
  .catch((error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })
