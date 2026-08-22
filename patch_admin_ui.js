const fs = require('fs');
const file = 'src/components/admin/admin-panel.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Settings Tab: Hero Settings
const settingsMarker = `{/* Banner price */}`;
const heroSettingsCard = `
      {/* Hero Section Settings */}
      <div className="rounded-3xl glass p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
          <ImageIcon className="h-4 w-4 text-purple-500" /> Hero Section Content
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-700">Hero Title</Label>
            <Input
              value={settings.hero_title ?? ''}
              onChange={(e) => update('hero_title', e.target.value)}
              placeholder="Choutuppal App"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-700">Hero Subtitle</Label>
            <Input
              value={settings.hero_subtitle ?? ''}
              onChange={(e) => update('hero_subtitle', e.target.value)}
              placeholder="Your Town, All In One App"
            />
          </div>
        </div>
        <div className="mt-4">
          <Label className="mb-1 block text-xs font-semibold text-slate-700">Background Image URL</Label>
          <div className="flex gap-2">
            <Input
              value={settings.hero_bg_image ?? ''}
              onChange={(e) => update('hero_bg_image', e.target.value)}
              placeholder="/images/hero-banner.png"
            />
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="hero-upload-input" 
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if(!file) return
                const fd = new FormData()
                fd.append('file', file)
                toast.loading('Uploading...', { id: 'hero-upload' })
                try {
                  const res = await fetch('/api/upload', { method: 'POST', body: fd })
                  const j = await res.json()
                  if(j.ok && j.url) {
                    update('hero_bg_image', j.url)
                    toast.success('Uploaded', { id: 'hero-upload' })
                  } else {
                    throw new Error('Upload failed')
                  }
                } catch(err) {
                  toast.error('Failed to upload', { id: 'hero-upload' })
                }
              }} 
            />
            <Button asChild variant="outline" className="cursor-pointer whitespace-nowrap">
              <label htmlFor="hero-upload-input">
                <Upload className="h-4 w-4 mr-2" /> Upload
              </label>
            </Button>
          </div>
        </div>
      </div>

      `;
code = code.replace(settingsMarker, heroSettingsCard + settingsMarker);


// 2. Stories Tab: Upload Button
const storyUrlMarker = `<Input
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://images.choutuppal.in/..."
                  />`;

const storyUploadReplacement = `<div className="flex gap-2">
                    <Input
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://images.choutuppal.in/..."
                    />
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      className="hidden" 
                      id="story-upload-input" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if(!file) return
                        const fd = new FormData()
                        fd.append('file', file)
                        toast.loading('Uploading...', { id: 'story-upload' })
                        try {
                          const res = await fetch('/api/upload', { method: 'POST', body: fd })
                          const j = await res.json()
                          if(j.ok && j.url) {
                            setMediaUrl(j.url)
                            setMediaType(file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE')
                            toast.success('Uploaded', { id: 'story-upload' })
                          } else {
                            throw new Error('Upload failed')
                          }
                        } catch(err) {
                          toast.error('Failed to upload', { id: 'story-upload' })
                        }
                      }} 
                    />
                    <Button asChild variant="outline" className="cursor-pointer whitespace-nowrap shrink-0">
                      <label htmlFor="story-upload-input">
                        <Upload className="h-4 w-4 mr-2" /> Upload File
                      </label>
                    </Button>
                  </div>`;

code = code.replace(storyUrlMarker, storyUploadReplacement);

fs.writeFileSync(file, code);
console.log('patched admin panel');
