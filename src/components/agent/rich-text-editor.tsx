'use client'

import { useRef, useEffect } from 'react'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Table as TableIcon,
  Link2,
  Quote,
  Undo,
  Redo,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

/**
 * Lightweight rich text editor built on a contentEditable surface using
 * document.execCommand. Deliberately avoids heavy editors (Tiptap/Novel/Lexical)
 * to keep the bundle small on memory-constrained hosts. Supports H1, H2, Bold,
 * Italic, Lists (ul/ol), Tables, Links, and Blockquote.
 */
export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Initialise content once (and when the incoming value resets to empty).
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || ''
    }
  }, [])

  function exec(command: string, val?: string) {
    document.execCommand(command, false, val)
    ref.current?.focus()
    sync()
  }

  function addLink() {
    const url = prompt('Enter URL')
    if (url) exec('createLink', url)
  }

  function addTable() {
    const rows = Number(prompt('Rows?', '3'))
    const cols = Number(prompt('Columns?', '3'))
    if (!rows || !cols) return
    let html = '<table class="rt-table"><tbody>'
    for (let r = 0; r < rows; r++) {
      html += '<tr>'
      for (let c = 0; c < cols; c++) {
        html += r === 0 ? '<th>Header</th>' : '<td>&nbsp;</td>'
      }
      html += '</tr>'
    }
    html += '</tbody></table><p><br/></p>'
    exec('insertHTML', html)
  }

  function sync() {
    if (ref.current) onChange(ref.current.innerHTML)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-100 bg-slate-50/80 p-1.5">
        <button type="button" title="H1" aria-label="H1" onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', '<h1>') }} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-white hover:text-blue-600"><Heading1 className="h-4 w-4" /></button>
        <button type="button" title="H2" aria-label="H2" onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', '<h2>') }} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-white hover:text-blue-600"><Heading2 className="h-4 w-4" /></button>
        <button type="button" title="Bold" aria-label="Bold" onMouseDown={(e) => { e.preventDefault(); exec('bold') }} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-white hover:text-blue-600"><Bold className="h-4 w-4" /></button>
        <button type="button" title="Italic" aria-label="Italic" onMouseDown={(e) => { e.preventDefault(); exec('italic') }} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-white hover:text-blue-600"><Italic className="h-4 w-4" /></button>
        <button type="button" title="Bullet list" aria-label="Bullet list" onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList') }} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-white hover:text-blue-600"><List className="h-4 w-4" /></button>
        <button type="button" title="Numbered list" aria-label="Numbered list" onMouseDown={(e) => { e.preventDefault(); exec('insertOrderedList') }} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-white hover:text-blue-600"><ListOrdered className="h-4 w-4" /></button>
        <button type="button" title="Quote" aria-label="Quote" onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', '<blockquote>') }} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-white hover:text-blue-600"><Quote className="h-4 w-4" /></button>
        <button type="button" title="Table" aria-label="Table" onMouseDown={(e) => { e.preventDefault(); addTable() }} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-white hover:text-blue-600"><TableIcon className="h-4 w-4" /></button>
        <button type="button" title="Link" aria-label="Link" onMouseDown={(e) => { e.preventDefault(); addLink() }} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-white hover:text-blue-600"><Link2 className="h-4 w-4" /></button>
        <button type="button" title="Undo" aria-label="Undo" onMouseDown={(e) => { e.preventDefault(); exec('undo') }} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-white hover:text-blue-600"><Undo className="h-4 w-4" /></button>
        <button type="button" title="Redo" aria-label="Redo" onMouseDown={(e) => { e.preventDefault(); exec('redo') }} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-white hover:text-blue-600"><Redo className="h-4 w-4" /></button>
      </div>

      {/* Editable surface */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
        data-placeholder={placeholder}
        className={cn(
          'rt-surface min-h-[280px] max-h-[480px] overflow-y-auto p-4 text-sm text-slate-800 outline-none fancy-scroll',
          '[&_.rt-table]:my-3 [&_.rt-table]:w-full [&_.rt-table]:border-collapse',
          '[&_.rt-table_th]:border [&_.rt-table_th]:border-slate-300 [&_.rt-table_th]:bg-slate-100 [&_.rt-table_th]:p-2 [&_.rt-table_th]:text-left [&_.rt-table_th]:font-semibold',
          '[&_.rt-table_td]:border [&_.rt-table_td]:border-slate-300 [&_.rt-table_td]:p-2',
          '[&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-black',
          '[&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold',
          '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6',
          '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6',
          '[&_blockquote]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-300 [&_blockquote]:bg-blue-50/50 [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600',
          '[&_a]:text-blue-600 [&_a]:underline',
        )}
      />
    </div>
  )
}
