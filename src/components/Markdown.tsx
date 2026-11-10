import { renderInline } from '../lib/markdown'

type Props = { source: string | null | undefined; as?: 'span' | 'p' | 'div' }

export function Markdown({ source, as = 'span' }: Props) {
  const html = renderInline(source)
  const Tag = as

  return <Tag dangerouslySetInnerHTML={{ __html: html }} />
}
