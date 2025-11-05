import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const SEARCH_INDEX = [
  {
    title: 'Pricing Plans',
    description: 'Compare the Free, Premium, and Pro plans and start your 30-day trial.',
    href: '/pricing',
    keywords: ['pricing', 'plan', 'premium', 'trial', 'cost']
  },
  {
    title: 'Marketplace Plugins',
    description: 'Extend Eunonix with emotion analytics, focus tools, and automation plugins.',
    href: '/marketplace',
    keywords: ['plugin', 'marketplace', 'extension', 'integration']
  },
  {
    title: 'Neuroadaptive Overview',
    description: 'Explore the neuroadaptive engine that personalizes your routines and insights.',
    href: '/sensory-expansion',
    keywords: ['neuroadaptive', 'sensory', 'engine', 'ai']
  },
  {
    title: 'Developer Portal',
    description: 'Build and publish Eunonix plugins and integrate the Emotional API.',
    href: '/developer',
    keywords: ['developer', 'api', 'sdk', 'build']
  }
]

const normalize = (value: string) => value.toLowerCase().trim()

const Search = () => {
  const [params] = useSearchParams()
  const query = params.get('q') ?? ''

  const results = useMemo(() => {
    if (!query) {
      return SEARCH_INDEX
    }

    const normalized = normalize(query)
    return SEARCH_INDEX.filter((item) => {
      if (normalize(item.title).includes(normalized)) return true
      if (normalize(item.description).includes(normalized)) return true
      return item.keywords.some((keyword) => normalize(keyword).includes(normalized) || normalized.includes(normalize(keyword)))
    })
  }, [query])

  return (
    <div className="min-h-screen bg-sand-50 text-ink-900">
      <div className="max-w-3xl mx-auto px-6 py-20 space-y-10">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-widest text-lilac-500 font-semibold">Eunonix Search</p>
          <h1 className="text-4xl font-semibold">Search results{query ? ` for “${query}”` : ''}</h1>
          <p className="text-ink-600">Jump into the right part of Eunonix. These links highlight the most visited product areas.</p>
        </header>

        <section className="space-y-6">
          {results.map((item) => (
            <article key={item.href} className="glass-card p-6 border border-white/60 shadow-lg">
              <h2 className="text-2xl font-medium">
                <Link to={item.href} className="text-lilac-600 hover:text-lilac-700 transition-colors">
                  {item.title}
                </Link>
              </h2>
              <p className="mt-2 text-ink-600">{item.description}</p>
              <p className="mt-3 text-sm text-ink-400">{new URL(`https://www.eunonix.com${item.href}`).href}</p>
            </article>
          ))}

          {results.length === 0 && (
            <div className="glass-card p-6 text-ink-600">
              <p>No matches yet. Try searching for pricing, marketplace, or developer tools.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Search
