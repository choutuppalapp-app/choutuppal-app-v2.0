const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js')
const fs = require('fs')
const path = require('path')

async function inspectPdfObjects() {
  const filePath = 'C:\\Users\\Citizen2\\Desktop\\ChoutuppalPDFs\\CPL_Dir_2026-1.pdf'
  const data = new Uint8Array(fs.readFileSync(filePath))

  const loadingTask = pdfjsLib.getDocument({ data })
  const pdfDoc = await loadingTask.promise
  console.log(`PDF Pages: ${pdfDoc.numPages}`)

  for (let i = 1; i <= Math.min(3, pdfDoc.numPages); i++) {
    const page = await pdfDoc.getPage(i)
    const ops = await page.getOperatorList()
    console.log(`Page ${i} operator list length: ${ops.fnArray.length}`)
  }
}

inspectPdfObjects().catch(console.error)
