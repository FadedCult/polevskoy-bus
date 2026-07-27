import { copyFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

const root = process.cwd()
const source = resolve(root, "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk")
const target = resolve(root, "CityBus-debug.apk")

if (!existsSync(source)) {
  console.error(`APK not found: ${source}`)
  process.exit(1)
}

copyFileSync(source, target)
console.log(`Copied to ${target}`)
