import { useApp } from '../lib/app-state'
import { glyphFor } from '../lib/badges'
import type { Achievement } from '../lib/types'

export function Badges({ items }: { items: Achievement[] }) {
  const { t, locale } = useApp()

  if (items.length === 0) return null

  const earned = items.filter((item) => item.unlockedAt !== null).length

  return (
    <section className="badges">
      <div className="hd">
        <h3>{t.badgesTitle}</h3>
        <hr />
        <span>
          {earned}/{items.length}
        </span>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.slug} className={item.unlockedAt === null ? 'badge locked' : 'badge'}>
            <i aria-hidden="true">{glyphFor(item.icon)}</i>
            <div>
              <strong>{item.title}</strong>
              <span>
                {item.unlockedAt === null
                  ? (item.description ?? t.badgeLocked)
                  : t.badgeUnlockedOn(
                      new Date(item.unlockedAt).toLocaleDateString(
                        locale === 'id' ? 'id-ID' : 'en-GB',
                        { day: 'numeric', month: 'short' },
                      ),
                    )}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
