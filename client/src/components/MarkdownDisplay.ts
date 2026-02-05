import { unsafeHTML } from 'lit-html/directives/unsafe-html.js'
import { html, memo } from 'solit-html'
import DOMPurify from 'dompurify'
import { parse } from 'marked'

export function MarkdownDisplay(content: () => string) {
  const htmlContent = memo(() => {
    const htmlContent = parse(content(), { async: false, gfm: true })
    const cleanContent = DOMPurify.sanitize(htmlContent)
    return unsafeHTML(cleanContent)
  })
  return html`${htmlContent}`
}
