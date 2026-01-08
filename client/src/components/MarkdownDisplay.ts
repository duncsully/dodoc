import { unsafeHTML } from 'lit-html/directives/unsafe-html.js'
import { html } from 'solit-html'
import DOMPurify from 'dompurify'
import { parse } from 'marked'

export function MarkdownDisplay(content: string) {
  const htmlContent = parse(content, { async: false })
  const cleanContent = DOMPurify.sanitize(htmlContent)
  return html`${unsafeHTML(cleanContent)}`
}
