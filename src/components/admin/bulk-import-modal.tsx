'use client'

import React, { useState, useRef } from 'react'
import Papa from 'papaparse'
import {
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

interface BulkImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  categories: Array<{ id: string; name: string; slug: string }>
  villages: Array<{ id: string; name: string; slug: string }>
}

interface ColumnMapping {
  title: string
  phone: string
  whatsapp: string
  category: string
  address: string
  village: string
  description: string
  status: string
  isPremium: string
}

// Heuristics for common header variations
const HEADER_HEURISTICS: Record<keyof ColumnMapping, string[]> = {
  title: ['title', 'name', 'shop_name', 'shop name', 'business_name', 'business name', 'store_name', 'firm_name', 'company'],
  phone: ['phone', 'phone_number', 'mobile', 'contact', 'cell', 'tel', 'phone number', 'contact_number'],
  whatsapp: ['whatsapp', 'wa', 'wa_number', 'whatsapp_number', 'whatsapp phone', 'whatsapp_phone'],
  category: ['category', 'category_name', 'category name', 'type', 'cat', 'business_category', 'service'],
  address: ['address', 'location', 'street', 'place', 'area', 'address line', 'shop_address'],
  village: ['village', 'village_name', 'village name', 'town', 'mandal_village', 'area_village'],
  description: ['description', 'about', 'details', 'desc', 'bio', 'summary', 'info'],
  status: ['status', 'is_approved', 'approved', 'state'],
  isPremium: ['is_premium', 'ispremium', 'premium', 'gold_badge'],
}

export function BulkImportModal({
  open,
  onOpenChange,
  onSuccess,
  categories,
  villages,
}: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState<'csv' | 'json' | null>(null)
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([])
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({
    title: '',
    phone: '',
    whatsapp: '',
    category: '',
    address: '',
    village: '',
    description: '',
    status: '',
    isPremium: '',
  })
  const [step, setStep] = useState<'upload' | 'map' | 'preview' | 'importing'>('upload')
  const [importProgress, setImportProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = () => {
    setFile(null)
    setFileType(null)
    setParsedHeaders([])
    setParsedRows([])
    setMapping({
      title: '',
      phone: '',
      whatsapp: '',
      category: '',
      address: '',
      village: '',
      description: '',
      status: '',
      isPremium: '',
    })
    setStep('upload')
    setImportProgress(0)
    setIsProcessing(false)
  }

  // Auto-detect best column matches
  const autoDetectMapping = (headers: string[]) => {
    const normalizedHeaders = headers.map((h) => ({
      original: h,
      clean: h.toLowerCase().trim().replace(/[\s_-]+/g, ' '),
    }))

    const newMapping: ColumnMapping = {
      title: '',
      phone: '',
      whatsapp: '',
      category: '',
      address: '',
      village: '',
      description: '',
      status: '',
      isPremium: '',
    }

    ;(Object.keys(HEADER_HEURISTICS) as Array<keyof ColumnMapping>).forEach((field) => {
      const candidates = HEADER_HEURISTICS[field]
      const found = normalizedHeaders.find((h) =>
        candidates.some((c) => h.clean === c || h.clean.includes(c) || c.includes(h.clean))
      )
      if (found) {
        newMapping[field] = found.original
      }
    })

    setMapping(newMapping)
  }

  const handleFileProcess = (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase()

    if (ext === 'csv') {
      setFileType('csv')
      setFile(selectedFile)
      setIsProcessing(true)

      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setIsProcessing(false)
          if (results.data && results.data.length > 0) {
            const headers = results.meta.fields || Object.keys(results.data[0] as object)
            setParsedHeaders(headers)
            setParsedRows(results.data as any[])
            autoDetectMapping(headers)
            setStep('map')
          } else {
            toast({ title: 'Invalid CSV', description: 'The file contains no readable records.', variant: 'destructive' })
          }
        },
        error: (err) => {
          setIsProcessing(false)
          toast({ title: 'CSV Parse Error', description: err.message, variant: 'destructive' })
        },
      })
    } else if (ext === 'json') {
      setFileType('json')
      setFile(selectedFile)
      setIsProcessing(true)

      const reader = new FileReader()
      reader.onload = (e) => {
        setIsProcessing(false)
        try {
          const content = e.target?.result as string
          const parsed = JSON.parse(content)
          const rows = Array.isArray(parsed) ? parsed : parsed.listings || parsed.data || []

          if (!Array.isArray(rows) || rows.length === 0) {
            throw new Error('JSON file must contain an array of objects')
          }

          const headers = Object.keys(rows[0] || {})
          setParsedHeaders(headers)
          setParsedRows(rows)
          autoDetectMapping(headers)
          setStep('map')
        } catch (err: any) {
          toast({ title: 'Invalid JSON', description: err.message || 'Failed to parse JSON file.', variant: 'destructive' })
        }
      }
      reader.readAsText(selectedFile)
    } else {
      toast({ title: 'Unsupported Format', description: 'Please upload a .csv or .json file.', variant: 'destructive' })
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  // Transform rows based on user mappings
  const getMappedData = () => {
    return parsedRows.map((row) => ({
      title: mapping.title ? row[mapping.title] : '',
      phone: mapping.phone ? row[mapping.phone] : '',
      whatsapp: mapping.whatsapp ? row[mapping.whatsapp] : (mapping.phone ? row[mapping.phone] : ''),
      category: mapping.category ? row[mapping.category] : 'Services',
      address: mapping.address ? row[mapping.address] : 'Choutuppal, Telangana',
      village: mapping.village ? row[mapping.village] : 'Choutuppal',
      description: mapping.description ? row[mapping.description] : '',
      status: mapping.status ? row[mapping.status] : 'APPROVED',
      isPremium: mapping.isPremium ? Boolean(row[mapping.isPremium]) : false,
    })).filter((r) => Boolean(r.title))
  }

  const handleExecuteImport = async () => {
    const payload = getMappedData()

    if (payload.length === 0) {
      toast({
        title: 'No Valid Records',
        description: 'Please ensure Title / Shop Name is mapped correctly.',
        variant: 'destructive',
      })
      return
    }

    setStep('importing')
    setImportProgress(20)

    try {
      setImportProgress(50)
      const res = await fetch('/api/admin/listings/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listings: payload }),
      })

      setImportProgress(85)
      const data = await res.json()

      if (data.ok) {
        setImportProgress(100)
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${data.imported} listings into database.`,
        })
        setTimeout(() => {
          onSuccess()
          onOpenChange(false)
          resetState()
        }, 800)
      } else {
        toast({
          title: 'Import Failed',
          description: data.error || 'Server error occurred during bulk import.',
          variant: 'destructive',
        })
        setStep('preview')
      }
    } catch (err: any) {
      toast({
        title: 'Network Error',
        description: err.message || 'Failed to submit bulk import.',
        variant: 'destructive',
      })
      setStep('preview')
    }
  }

  const downloadSampleCsv = () => {
    const csvContent =
      'title,category,phone,whatsapp,address,village,description,status,is_premium\n' +
      'Sri Sai Ram Electricals & Plumber Works,Services,9494348175,9494348175,"Main Road, Near Bus Stand",Choutuppal,"All types of electrical wiring and motor pumps",APPROVED,false\n' +
      'Venkateshwara Medical & General Stores,Health & Medical,9849123456,9849123456,"Opp. Community Hospital",Choutuppal,"All 24/7 medicines and first aid",APPROVED,false\n' +
      'Sri Lakshmi Kirana & General Stores,Retail Shopping,9988776655,9988776655,"Gandhi Chowk",Choutuppal,"Fresh groceries, rice and provisions",APPROVED,false\n' +
      'Choutuppal Real Estate & Plots,Real Estate,9440123456,9440123456,"NH 65 Bypass",Choutuppal,"Open plots and agricultural lands",APPROVED,true'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'choutuppal_listings_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadSampleJson = () => {
    const jsonContent = JSON.stringify(
      [
        {
          title: 'Sri Sai Ram Electricals',
          category: 'Services',
          phone: '9494348175',
          whatsapp: '9494348175',
          address: 'Main Road, Choutuppal',
          village: 'Choutuppal',
          description: 'Electrical and plumbing contracting works',
          status: 'APPROVED',
          isPremium: false,
        },
        {
          title: 'Shiva Diagnostic Lab',
          category: 'Health & Medical',
          phone: '9849112233',
          whatsapp: '9849112233',
          address: 'Hospital Road, Choutuppal',
          village: 'Choutuppal',
          description: 'Complete blood tests and scanning services',
          status: 'APPROVED',
          isPremium: true,
        },
      ],
      null,
      2
    )

    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'choutuppal_listings_template.json')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const mappedPreview = getMappedData()

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetState(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6 bg-white rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Bulk Import Shop Listings
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Upload CSV or JSON files to bulk-insert merchant listings into Supabase database.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 border-y border-slate-100 py-3 my-2 text-xs">
          <div className={`flex items-center gap-1.5 font-semibold ${step === 'upload' ? 'text-blue-700' : 'text-slate-500'}`}>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${step === 'upload' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>1</span>
            <span>Upload File</span>
          </div>
          <div className={`flex items-center gap-1.5 font-semibold ${step === 'map' ? 'text-blue-700' : 'text-slate-500'}`}>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${step === 'map' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>2</span>
            <span>Map Columns</span>
          </div>
          <div className={`flex items-center gap-1.5 font-semibold ${step === 'preview' || step === 'importing' ? 'text-blue-700' : 'text-slate-500'}`}>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${step === 'preview' || step === 'importing' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>3</span>
            <span>Preview & Import</span>
          </div>
        </div>

        {/* STEP 1: UPLOAD */}
        {step === 'upload' && (
          <div className="space-y-4 py-2">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                isDragOver ? 'border-blue-700 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,application/json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileProcess(e.target.files[0])
                  }
                }}
              />
              <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Click to select or drag & drop CSV or JSON file
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supports .csv and .json files (up to 1,000 listings per upload)
                </p>
              </div>
            </div>

            {/* Template Download Section */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-slate-500" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Need a format template?</h4>
                  <p className="text-[11px] text-slate-500">Download ready-to-fill templates with standard columns.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Sample CSV</span>
                </button>
                <button
                  type="button"
                  onClick={downloadSampleJson}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Sample JSON</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: COLUMN MAPPING */}
        {step === 'map' && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3.5 py-2.5 text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-700" />
                <span>
                  Found <strong>{parsedRows.length}</strong> records in <strong>{file?.name}</strong>. Headers auto-mapped below:
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto p-1">
              {/* Title / Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Shop / Business Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={mapping.title}
                  onChange={(e) => setMapping({ ...mapping, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-700 focus:outline-none"
                >
                  <option value="">-- Select Column --</option>
                  {parsedHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Phone Number</label>
                <select
                  value={mapping.phone}
                  onChange={(e) => setMapping({ ...mapping, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-700 focus:outline-none"
                >
                  <option value="">-- Select Column --</option>
                  {parsedHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* WhatsApp */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">WhatsApp Number</label>
                <select
                  value={mapping.whatsapp}
                  onChange={(e) => setMapping({ ...mapping, whatsapp: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-700 focus:outline-none"
                >
                  <option value="">-- Same as Phone / Select --</option>
                  {parsedHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Category / Type</label>
                <select
                  value={mapping.category}
                  onChange={(e) => setMapping({ ...mapping, category: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-700 focus:outline-none"
                >
                  <option value="">-- Default (Services) --</option>
                  {parsedHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Address / Landmark</label>
                <select
                  value={mapping.address}
                  onChange={(e) => setMapping({ ...mapping, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-700 focus:outline-none"
                >
                  <option value="">-- Default (Choutuppal) --</option>
                  {parsedHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Village */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Village / Town</label>
                <select
                  value={mapping.village}
                  onChange={(e) => setMapping({ ...mapping, village: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-700 focus:outline-none"
                >
                  <option value="">-- Default (Choutuppal) --</option>
                  {parsedHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Description / Bio</label>
                <select
                  value={mapping.description}
                  onChange={(e) => setMapping({ ...mapping, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-700 focus:outline-none"
                >
                  <option value="">-- Auto-generate Description --</option>
                  {parsedHeaders.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PREVIEW & IMPORT */}
        {step === 'preview' && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Ready to Import: <strong className="text-blue-700">{mappedPreview.length}</strong> Listings
              </span>
              <span className="text-[11px] text-slate-500">
                Showing preview of first 5 items
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs max-h-[300px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-2.5">Shop Name</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Phone</th>
                    <th className="p-2.5">Address</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {mappedPreview.slice(0, 8).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-semibold text-slate-900">{row.title}</td>
                      <td className="p-2.5">{row.category}</td>
                      <td className="p-2.5 font-mono">{row.phone || '-'}</td>
                      <td className="p-2.5 text-slate-600 truncate max-w-[150px]">{row.address}</td>
                      <td className="p-2.5">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 4: IMPORTING PROGRESS */}
        {step === 'importing' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="h-10 w-10 text-blue-700 animate-spin" />
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Importing Listings into Supabase...</h4>
              <p className="text-xs text-slate-500">Upserting records, generating slugs, and linking taxonomy.</p>
            </div>
            <div className="w-64 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-700 h-2 transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              />
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-slate-100 pt-3 flex items-center justify-between sm:justify-between">
          <div>
            {step !== 'upload' && step !== 'importing' && (
              <button
                type="button"
                onClick={() => setStep(step === 'preview' ? 'map' : 'upload')}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            {step === 'map' && (
              <button
                type="button"
                disabled={!mapping.title}
                onClick={() => setStep('preview')}
                className="rounded-lg bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <span>Continue to Preview</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {step === 'preview' && (
              <button
                type="button"
                onClick={handleExecuteImport}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm & Import ({mappedPreview.length})</span>
              </button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
