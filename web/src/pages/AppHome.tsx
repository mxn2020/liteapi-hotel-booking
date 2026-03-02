import { Sparkles } from 'lucide-react'
import HotelSearch from '../components/HotelSearch'

export default function AppHome() {
    return (
        <div className="app-home">
            <div className="app-home__hero">
                <Sparkles size={48} style={{ color: 'var(--color-accent)' }} />
                <h1>Where to next?</h1>
                <p style={{ color: 'var(--color-smoke-gray)', maxWidth: '600px', margin: '16px auto 0', lineHeight: 1.7 }}>
                    Tell us what you're looking for, and our AI will find the perfect hotel for your stay. Just type naturally!
                </p>
            </div>

            <div className="app-home__search">
                <HotelSearch />
            </div>
        </div>
    )
}
