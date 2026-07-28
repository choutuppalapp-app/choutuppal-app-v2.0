const fs = require('fs')
const path = require('path')

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return
  fs.mkdirSync(to, { recursive: true })
  fs.readdirSync(from).forEach((element) => {
    const fromPath = path.join(from, element)
    const toPath = path.join(to, element)
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath)
    } else {
      fs.copyFileSync(fromPath, toPath)
    }
  })
}

try {
  copyFolderSync('.next/static', '.next/standalone/.next/static')
  copyFolderSync('public', '.next/standalone/public')
  console.log('Post-build static asset copy completed successfully.')
} catch (err) {
  console.error('Post-build static asset copy failed:', err)
  process.exit(1)
}
