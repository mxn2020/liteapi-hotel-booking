import { useState } from "react";
import { Search, MapPin, Star, Loader2, Hotel } from "lucide-react";

export default function AppHome() {
    const [destination, setDestination] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(2);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!destination || !checkIn || !checkOut) return;
        setLoading(true);
        try {
            // Wire to hotelSearch backend when ready
            await new Promise(r => setTimeout(r, 1500));
            setResults([
                { id: "1", name: "Grand Palace Hotel", location: destination, price: 189, rating: 4.8, image: "🏨" },
                { id: "2", name: "Ocean View Resort", location: destination, price: 245, rating: 4.6, image: "🌊" },
                { id: "3", name: "City Center Inn", location: destination, price: 129, rating: 4.3, image: "🏙️" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
            {/* Hero */}
            <div style={{
                textAlign: "center", marginBottom: "2rem",
                background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(16,185,129,0.08))",
                borderRadius: 16, padding: "2.5rem 1.5rem", border: "1px solid rgba(59,130,246,0.2)"
            }}>
                <Hotel size={48} style={{ color: "var(--color-accent)", marginBottom: 12 }} />
                <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>Find Your Perfect Stay</h1>
                <p style={{ color: "var(--color-text-secondary)" }}>AI-powered hotel search with the best rates worldwide</p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto auto", gap: "0.75rem",
                marginBottom: "2rem", alignItems: "end"
            }}>
                <div>
                    <label style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: 4, display: "block" }}>Destination</label>
                    <div style={{ position: "relative" }}>
                        <MapPin size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-secondary)" }} />
                        <input value={destination} onChange={e => setDestination(e.target.value)}
                            placeholder="City or hotel name"
                            style={{ width: "100%", padding: "0.6rem 0.6rem 0.6rem 2rem", borderRadius: 8, background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "inherit" }} />
                    </div>
                </div>
                <div>
                    <label style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: 4, display: "block" }}>Check-in</label>
                    <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                        style={{ width: "100%", padding: "0.6rem", borderRadius: 8, background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "inherit" }} />
                </div>
                <div>
                    <label style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: 4, display: "block" }}>Check-out</label>
                    <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                        style={{ width: "100%", padding: "0.6rem", borderRadius: 8, background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "inherit" }} />
                </div>
                <div>
                    <label style={{ fontSize: "0.85rem", fontWeight: 500, marginBottom: 4, display: "block" }}>Guests</label>
                    <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                        style={{ padding: "0.6rem", borderRadius: 8, background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "inherit" }}>
                        {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>)}
                    </select>
                </div>
                <button type="submit" disabled={loading}
                    style={{
                        padding: "0.6rem 1.5rem", borderRadius: 8, background: "var(--color-accent)",
                        color: "white", fontWeight: 600, border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6
                    }}>
                    {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={16} />}
                    Search
                </button>
            </form>

            {/* Results */}
            {results.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {results.map(hotel => (
                        <div key={hotel.id} style={{
                            display: "flex", gap: "1.25rem", padding: "1.25rem", borderRadius: 14,
                            background: "var(--color-surface)", border: "1px solid var(--color-border)",
                            alignItems: "center"
                        }}>
                            <span style={{ fontSize: "2.5rem" }}>{hotel.image}</span>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{hotel.name}</h3>
                                <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                                    <MapPin size={14} /> {hotel.location}
                                    <span style={{ marginLeft: 8, display: "flex", alignItems: "center", gap: 2 }}>
                                        <Star size={14} style={{ color: "#F59E0B" }} /> {hotel.rating}
                                    </span>
                                </p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-accent)" }}>${hotel.price}</div>
                                <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>per night</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );
}
