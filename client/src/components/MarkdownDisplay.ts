import { unsafeHTML } from 'lit-html/directives/unsafe-html.js'
import { html, memo } from 'solit-html'
import DOMPurify from 'dompurify'
import { parse } from 'marked'
import { useDocument } from '../dataService'

export function MarkdownDisplay(content: () => string) {
  const htmlContent = memo(() => {
    const rawContent = content()
    const contentWithEmbeds = expandEmbeddedDocs(rawContent)
    const htmlContent = parse(contentWithEmbeds, {
      async: false,
      gfm: true,
    })
    const cleanContent = DOMPurify.sanitize(htmlContent)
    return unsafeHTML(cleanContent)
  })
  return html`${htmlContent}`
}

const expandEmbeddedDocs = (markdown: string): string => {
  return markdown.replace(/\[!embed\]\(\/?(.+)\)/g, (original, href) => {
    const doc = useDocument(() => href)
    if (!doc()) {
      return original
    }
    return expandEmbeddedDocs(doc()?.content ?? '')
  })
}
