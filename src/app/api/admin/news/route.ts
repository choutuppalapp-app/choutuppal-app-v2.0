import { NextResponse, NextRequest } from 'next/server'
import { requireApiAdmin } from '@/lib/session'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { getOfflineNews, getOfflineBlogs } from '@/lib/offline-data'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'all' // 'news' | 'blogs' | 'all'

  try {
    const [dbNews, dbBlogs] = await Promise.all([
      safeDbQuery(
        () =>
          prisma.news.findMany({
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { id: true, name: true, username: true } } },
          }),
        null
      ),
      safeDbQuery(
        () =>
          prisma.blog.findMany({
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { id: true, name: true, username: true } } },
          }),
        null
      ),
    ])

    const newsList = dbNews && dbNews.length > 0 ? dbNews : getOfflineNews()
    const blogsList = dbBlogs && dbBlogs.length > 0 ? dbBlogs : getOfflineBlogs()

    return NextResponse.json({
      ok: true,
      news: type === 'blogs' ? [] : newsList,
      blogs: type === 'news' ? [] : blogsList,
    })
  } catch (error: any) {
    console.error('[Admin News GET] Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const { type = 'news', title, summary, content, image, tags, isPublished = true, category } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u0C00-\u0C7F]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 45) + '-' + Math.random().toString(36).substring(2, 6)

    if (type === 'blog') {
      const createdBlog = await safeDbQuery(
        () =>
          prisma.blog.create({
            data: {
              title,
              slug,
              excerpt: summary || content.slice(0, 150),
              content,
              coverImage: image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
              category: category || 'Business',
              tags: tags || ['Choutuppal', 'Guide'],
              isPublished: Boolean(isPublished),
              publishedAt: isPublished ? new Date() : null,
              authorId: auth.user.id,
            },
          }),
        null
      )
      return NextResponse.json({ ok: true, item: createdBlog, message: 'Blog created' })
    } else {
      const createdNews = await safeDbQuery(
        () =>
          prisma.news.create({
            data: {
              title,
              slug,
              summary: summary || content.slice(0, 150),
              content,
              image: image || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80',
              tags: tags || ['Choutuppal', 'News'],
              isPublished: Boolean(isPublished),
              publishedAt: isPublished ? new Date() : null,
              authorId: auth.user.id,
            },
          }),
        null
      )
      return NextResponse.json({ ok: true, item: createdNews, message: 'News article created' })
    }
  } catch (error: any) {
    console.error('[Admin News POST] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create article' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const { id, type = 'news', isPublished, title, summary, content, image } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (isPublished !== undefined) {
      updateData.isPublished = Boolean(isPublished)
      if (isPublished) updateData.publishedAt = new Date()
    }
    if (title !== undefined) updateData.title = title
    if (summary !== undefined) updateData.summary = summary
    if (content !== undefined) updateData.content = content
    if (image !== undefined) {
      if (type === 'blog') updateData.coverImage = image
      else updateData.image = image
    }

    if (type === 'blog') {
      await safeDbQuery(() => prisma.blog.update({ where: { id }, data: updateData }), null)
    } else {
      await safeDbQuery(() => prisma.news.update({ where: { id }, data: updateData }), null)
    }

    return NextResponse.json({ ok: true, message: 'Updated successfully' })
  } catch (error: any) {
    console.error('[Admin News PATCH] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update article' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type') || 'news'

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    if (type === 'blog') {
      await safeDbQuery(() => prisma.blog.delete({ where: { id } }), null)
    } else {
      await safeDbQuery(() => prisma.news.delete({ where: { id } }), null)
    }

    return NextResponse.json({ ok: true, message: 'Deleted successfully' })
  } catch (error: any) {
    console.error('[Admin News DELETE] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete' }, { status: 500 })
  }
}
