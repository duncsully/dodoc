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

/**
 * Recursively expand embedded documents in the markdown content using the [!embed](href) syntax.
 * Will only embed documents that haven't already been embedded to prevent infinite loops.
 */
const expandEmbeddedDocs = (
  markdown: string,
  embedded = new Set<string>()
): string => {
  return markdown.replace(/\[!embed\]\(\/?(.+)\)/g, (original, href) => {
    const doc = useDocument(() => href)
    if (!doc() || embedded.has(href)) {
      return original
    }
    embedded.add(href)
    return expandEmbeddedDocs(doc()?.content ?? '', embedded)
  })
}
