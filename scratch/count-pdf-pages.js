import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import fs from 'fs'
import path from 'path'

async function main() {
  const dir = 'C:\\Users\\Citizen2\\Desktop\\ChoutuppalPDFs'
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'))
  console.log(`Found ${files.length} PDFs`)

  let totalPages = 0
  for (const file of files) {
    const filePath = path.join(dir, file)
    const data = new Uint8Array(fs.readFileSync(filePath))
    const doc = await pdfjs.getDocument({ data }).promise
    console.log(`${file}: ${doc.numPages} pages`)
    totalPages += doc.numPages
  }
  console.log(`TOTAL PAGES ACROSS ALL PDFs: ${totalPages}`)
}

main().catch(console.error)
