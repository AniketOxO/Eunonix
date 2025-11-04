import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { SubscriptionTier } from '@/types/subscription'
import { SUBSCRIPTION_PLANS } from '@/config/subscriptionPlans'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  tier: SubscriptionTier
  billingCycle: 'monthly' | 'yearly'
  onSuccess: () => void
}

interface CardInfo {
  number: string
  name: string
  expiry: string
  cvv: string
}

export const PaymentModal = ({ isOpen, onClose, tier, billingCycle, onSuccess }: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardInfo, setCardInfo] = useState<CardInfo>({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  })
  const [upiId, setUpiId] = useState('')

  const plan = SUBSCRIPTION_PLANS[tier]
  const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly
  const total = price

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const groups = cleaned.match(/.{1,4}/g)
    return groups ? groups.join(' ') : cleaned
  }

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    if (cleaned.length <= 16 && /^\d*$/.test(cleaned)) {
      setCardInfo({ ...cardInfo, number: formatCardNumber(cleaned) })
    }
  }

  const handleExpiryChange = (value: string) => {
    const cleaned = value.replace(/\//g, '')
    if (cleaned.length <= 4 && /^\d*$/.test(cleaned)) {
      if (cleaned.length >= 2) {
        setCardInfo({ ...cardInfo, expiry: cleaned.slice(0, 2) + '/' + cleaned.slice(2) })
      } else {
        setCardInfo({ ...cardInfo, expiry: cleaned })
      }
    }
  }

  const handleCvvChange = (value: string) => {
    if (value.length <= 3 && /^\d*$/.test(value)) {
      setCardInfo({ ...cardInfo, cvv: value })
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsProcessing(false)
    onSuccess()
    onClose()
  }

  const isFormValid = () => {
    if (paymentMethod === 'card') {
      return (
        cardInfo.number.replace(/\s/g, '').length === 16 &&
        cardInfo.name.trim().length > 0 &&
        cardInfo.expiry.length === 5 &&
        cardInfo.cvv.length === 3
      )
    }
    if (paymentMethod === 'upi') {
      return upiId.trim().length > 0 && upiId.includes('@')
    }
    return true // netbanking
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-ink-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-ink-200/30 px-8 py-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-ink-900">Complete Payment</h2>
                  <p className="text-sm text-ink-600 mt-1">Subscribe to {plan.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-ink-100 hover:bg-ink-200 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Order Summary */}
              <div className="bg-gradient-to-br from-lilac-50 to-blue-50 rounded-2xl p-6 mb-8">
                <h3 className="font-medium text-ink-800 mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-600">Plan</span>
                    <span className="font-medium text-ink-900">{plan.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-600">Billing</span>
                    <span className="font-medium text-ink-900 capitalize">{billingCycle}</span>
                  </div>
                  <div className="border-t border-ink-200/30 my-3"></div>
                  <div className="flex justify-between">
                    <span className="font-medium text-ink-800">Total</span>
                    <span className="text-2xl font-semibold text-ink-900">
                      ${total}
                      <span className="text-sm text-ink-600 font-normal">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <h3 className="font-medium text-ink-800 mb-4">Payment Method</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-lilac-500 bg-lilac-50'
                        : 'border-ink-200/30 hover:border-ink-300'
                    }`}
                  >
                    <svg className="w-8 h-8 mx-auto mb-2 text-ink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="text-sm font-medium text-ink-800">Card</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-lilac-500 bg-lilac-50'
                        : 'border-ink-200/30 hover:border-ink-300'
                    }`}
                  >
                    <svg className="w-8 h-8 mx-auto mb-2 text-ink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-ink-800">UPI</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'border-lilac-500 bg-lilac-50'
                        : 'border-ink-200/30 hover:border-ink-300'
                    }`}
                  >
                    <svg className="w-8 h-8 mx-auto mb-2 text-ink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-sm font-medium text-ink-800">Net Banking</span>
                  </button>
                </div>
              </div>

              {/* Payment Forms */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      value={cardInfo.number}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 rounded-xl border border-ink-200/30 focus:outline-none focus:ring-2 focus:ring-lilac-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardInfo.name}
                      onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
                      placeholder="ANIKET SHARMA"
                      className="w-full px-4 py-3 rounded-xl border border-ink-200/30 focus:outline-none focus:ring-2 focus:ring-lilac-400 uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        value={cardInfo.expiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 rounded-xl border border-ink-200/30 focus:outline-none focus:ring-2 focus:ring-lilac-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">CVV</label>
                      <input
                        type="password"
                        value={cardInfo.cvv}
                        onChange={(e) => handleCvvChange(e.target.value)}
                        placeholder="123"
                        className="w-full px-4 py-3 rounded-xl border border-ink-200/30 focus:outline-none focus:ring-2 focus:ring-lilac-400 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full px-4 py-3 rounded-xl border border-ink-200/30 focus:outline-none focus:ring-2 focus:ring-lilac-400"
                  />
                  <p className="text-xs text-ink-500 mt-2">Enter your UPI ID (e.g., yourname@paytm, yourname@phonepe)</p>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">Select Bank</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-ink-200/30 focus:outline-none focus:ring-2 focus:ring-lilac-400">
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                    <option>Punjab National Bank</option>
                    <option>Bank of Baroda</option>
                    <option>Other</option>
                  </select>
                  <p className="text-xs text-ink-500 mt-2">You'll be redirected to your bank's website</p>
                </div>
              )}

              {/* Security Badge */}
              <div className="mt-6 flex items-center gap-2 text-sm text-ink-600">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Secured by 256-bit SSL encryption</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayment}
                  className="flex-1"
                  disabled={!isFormValid() || isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    `Pay $${total}`
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
