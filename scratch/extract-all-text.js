const { PDFParse } = require('pdf-parse')
const fs = require('fs')
const path = require('path')

async function main() {
  const dir = 'C:\\Users\\Citizen2\\Desktop\\ChoutuppalPDFs'
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'))

  for (const file of files) {
    const filePath = path.join(dir, file)
    const buf = new Uint8Array(fs.readFileSync(filePath))
    try {
      const parser = new PDFParse(buf)
      const res = await parser.getText()
      console.log(`==================== ${file} ====================`)
      console.log(res.text)
    } catch (err) {
      console.error(`Failed ${file}:`, err.message)
    }
  }
}

main()
