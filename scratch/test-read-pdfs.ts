import fs from 'fs'
import path from 'path'
const pdfParse = require('pdf-parse')

async function inspectPDFs() {
  const dir = 'C:\\Users\\Citizen2\\Desktop\\ChoutuppalPDFs'
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'))
  console.log(`Found ${files.length} PDFs in ${dir}`)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const dataBuffer = fs.readFileSync(filePath)
    try {
      const data = await pdfParse(dataBuffer)
      console.log(`\n--- ${file} (Pages: ${data.numpages}, Text Length: ${data.text.length}) ---`)
      console.log(data.text.slice(0, 300))
    } catch (e: any) {
      console.error(`Error reading ${file}:`, e.message)
    }
  }
}

inspectPDFs()
