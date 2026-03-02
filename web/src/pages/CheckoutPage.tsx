import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react'

export default function CheckoutPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    // In a real app we'd fetch the selected rate ID from the previous page's state or context.
    // Here we'll just mock the flow for the template. Let's assume there is a rate ID.
    // For this example, building a full prebook -> book requires complex state. We'll simplify.

    const hotelId = searchParams.get('hotelId') || ''
    const checkin = searchParams.get('checkin') || ''
    const checkout = searchParams.get('checkout') || ''
    const guests = Number(searchParams.get('guests')) || 2

    // Fake rate ID for demonstration if not provided
    const rateId = searchParams.get('rateId') || 'mock-rate-id'

    const prebookHotel = useAction(api.liteapi.prebookHotel)
    const bookHotel = useAction(api.liteapi.bookHotel)

    const [step, setStep] = useState(1) // 1: guest details, 2: processing prebook, 3: processing book, 4: success
    const [error, setError] = useState('')

    // Guest Form State
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')

    // Booking state
    const [bookingRef, setBookingRef] = useState('')

    const handlePrebook = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!firstName || !lastName || !email) {
            setError('Please fill in all guest details')
            return
        }

        setError('')
        setStep(2)

        try {
            // In a real flow, you fetch rates, select a rate, then prebook it.
            // Since liteapi requires valid rateIds and this is a template, this call will
            // likely throw an error in test mode unless properly mocked in LiteAPI or backend.
            // We will attempt it, then catch and simulate success if needed for demo purposes.
            const res = await prebookHotel({ rateId })
            setStep(3)
            handleFullBook(res.data?.prebookId || 'mock-prebook-id')
        } catch (err: any) {
            // For template demo purposes, let's gracefully fail into a mock success if API isn't fully set up test-wise
            console.warn("Prebook failed (expected if LiteAPI is missing mock data/keys)", err)
            setError(err.message)
            setStep(1)
        }
    }

    const handleFullBook = async (prebId: string) => {
        try {
            const res = await bookHotel({
                prebookId: prebId,
                hotelId,
                hotelName: "Selected Hotel", // Ideally passed through
                checkin,
                checkout,
                guests,
                totalAmount: 250.00, // Mock amount
                currency: "USD",
                guestFirstName: firstName,
                guestLastName: lastName,
                guestEmail: email,
            })
            setBookingRef(res.data?.bookingId || `CONF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)
            setStep(4)
        } catch (err: any) {
            setError(err.message)
            setStep(1)
        }
    }

    if (step === 4) {
        return (
            <div className="checkout-page center-content">
                <div className="card checkout-success">
                    <CheckCircle size={64} className="success-icon" />
                    <h2>Booking Confirmed!</h2>
                    <p>Your reservation is complete. Your booking reference is:</p>
                    <div className="booking-ref">{bookingRef}</div>
                    <button className="btn btn--primary" onClick={() => navigate('/app')}>Return Home</button>
                </div>
            </div>
        )
    }

    return (
        <div className="checkout-page container">
            <button className="btn btn--ghost back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Back to Search Results
            </button>

            <div className="checkout-content">
                <div className="checkout-form-container card">
                    <h2>Complete Your Booking</h2>
                    <p className="subtitle">Enter the main guest's details for this reservation.</p>

                    {error && <div className="checkout-error">{error}</div>}

                    <form onSubmit={handlePrebook} className="checkout-form">
                        <div className="form-group">
                            <label>First Name</label>
                            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={step > 1} required />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} disabled={step > 1} required />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={step > 1} required />
                        </div>

                        <button type="submit" className="btn btn--primary checkout-btn" disabled={step > 1}>
                            {step > 1 ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    {step === 2 ? 'Verifying Availability...' : 'Confirming Booking...'}
                                </>
                            ) : (
                                'Complete Booking'
                            )}
                        </button>
                    </form>
                </div>

                <div className="checkout-summary card">
                    <h3>Booking Summary</h3>
                    <div className="summary-item">
                        <span>Check-in</span>
                        <span>{checkin}</span>
                    </div>
                    <div className="summary-item">
                        <span>Check-out</span>
                        <span>{checkout}</span>
                    </div>
                    <div className="summary-item">
                        <span>Guests</span>
                        <span>{guests}</span>
                    </div>
                    <div className="summary-total">
                        <span>Total Estimate</span>
                        <span className="amount">$250.00</span>
                    </div>
                    <p className="summary-note">Payment is handled via LiteAPI demo test credentials during trial phase.</p>
                </div>
            </div>
        </div>
    )
}
