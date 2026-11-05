#!/usr/bin/env node
// Wrapper de `vite build` que redirige TEMP/TMP a una carpeta local del proyecto.
//
// Motivo: en este equipo, esbuild falla con "Access is denied" al intentar
// borrar sus archivos temporales dentro de %TEMP% (bloqueo de antivirus/ACL
// sobre C:\Users\...\AppData\Local\Temp). Usar una carpeta propia del proyecto
// y gitignoreada evita el fallo sin tocar la configuracion global de Windows.
//
// Uso: npm run build          (usa este wrapper)
//      npm run build:vite     (vite build directo, por si hiciera falta depurar)

import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const tmp = path.join(root, '.tmp-esbuild')

mkdirSync(tmp, { recursive: true })

const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')

const child = spawn(process.execPath, [viteBin, 'build'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, TEMP: tmp, TMP: tmp },
})

child.on('error', (err) => {
  console.error('No se pudo ejecutar vite:', err.message)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) process.exit(1)
  process.exit(code ?? 1)
})
