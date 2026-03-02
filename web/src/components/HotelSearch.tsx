import { useState } from 'react'
import { useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Search, Loader2, MapPin, Calendar, Users, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function HotelSearch() {
    const searchHotels = useAction(api.hotelSearch.searchWithAI)
    const [query, setQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [results, setResults] = useState<any>(null)
    const [error, setError] = useState('')

    const navigate = useNavigate()

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setIsLoading(true)
        setError('')
        setResults(null)

        try {
            const data = await searchHotels({ query })
            setResults(data)
        } catch (err: any) {
            setError(err.message || "Failed to search hotels. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const rates = results?.rates?.data || []
    const stats = results?.stats?.extractedParams

    return (
        <div className="hotel-search-container">
            <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={24} />
                    <input
                        type="text"
                        placeholder="Find an oceanfront resort in Miami for next weekend for 2 people..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isLoading}
                        className="search-input"
                    />
                    <button type="submit" disabled={isLoading || !query.trim()} className="search-button">
                        {isLoading ? <Loader2 className="spinner" size={20} /> : 'Search'}
                    </button>
                </div>
            </form>

            {error && <div className="error-message">{error}</div>}

            {stats && (
                <div className="search-stats">
                    <div className="stat-badge"><MapPin size={16} /> {stats.destination}, {stats.country}</div>
                    <div className="stat-badge"><Calendar size={16} /> {stats.checkin} to {stats.checkout}</div>
                    <div className="stat-badge"><Users size={16} /> {stats.guests} Guests</div>
                </div>
            )}

            {results && rates.length === 0 && (
                <div className="no-results">
                    No hotels found matching your search. Give it another try!
                </div>
            )}

            {rates.length > 0 && (
                <div className="hotel-grid">
                    {rates.map((hotel: any, idx: number) => {
                        // LiteAPI responses can vary, picking some likely fields
                        const minPrice = hotel.price || hotel.minPrice || hotel.rates?.[0]?.price || 0;
                        const currency = hotel.currency || hotel.rates?.[0]?.currency || 'USD';
                        const name = hotel.hotelName || hotel.name || "Unknown Hotel";
                        const stars = hotel.starRating || hotel.stars || 4;

                        // Grab first image if available, else a placeholder
                        const imgUrl = hotel.images?.[0]?.url || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop&q=80&auto=format&seed=${idx}`

                        return (
                            <div key={hotel.hotelId || idx} className="hotel-card">
                                <div className="hotel-card__image-container">
                                    <img src={imgUrl} alt={name} className="hotel-card__image" loading="lazy" />
                                    <div className="hotel-card__price">
                                        <span className="amount">{minPrice}</span>
                                        <span className="currency">{currency}</span>
                                        <span className="period">/ stay</span>
                                    </div>
                                </div>
                                <div className="hotel-card__content">
                                    <div className="hotel-card__header">
                                        <h3 className="hotel-card__title">{name}</h3>
                                        <div className="hotel-card__stars">
                                            <Star size={16} fill="var(--color-accent)" color="var(--color-accent)" />
                                            <span>{stars}</span>
                                        </div>
                                    </div>
                                    <p className="hotel-card__location">{hotel.address || `${stats?.destination || ''}`}</p>

                                    <button
                                        className="hotel-card__book-btn"
                                        onClick={() => navigate(`/checkout?hotelId=${hotel.hotelId}&checkin=${stats.checkin}&checkout=${stats.checkout}&guests=${stats.guests}`)}
                                    >
                                        Select Room
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
