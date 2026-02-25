import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Building,
  CheckCircle,
  ChevronRight,
  Copy,
  CreditCard,
  Globe,
  Lock,
  Mail,
  Shield,
  Smartphone,
  User,
  Wallet,
} from 'lucide-react';
import { Product } from '../types';

type PaymentMethod = 'card' | 'bank' | 'ussd' | 'mobile';

type PaymentState = {
  product?: Product;
};

const PaymentSimulation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [receiptRef, setReceiptRef] = useState('');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    email: 'student@babcock.edu.ng',
    bank: '',
    accountNumber: '',
  });

  const paymentState = (location.state as PaymentState | null) ?? null;
  const selectedProduct = paymentState?.product;

  const product = useMemo(
    () => ({
      name: selectedProduct?.title ?? 'MacBook Pro 2023',
      price: selectedProduct?.price ?? 450000,
      seller: selectedProduct?.seller?.name ?? selectedProduct?.seller?.fullName ?? 'John Doe',
      image:
        selectedProduct?.images?.[0] ??
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    }),
    [selectedProduct],
  );

  useEffect(() => {
    if (!processing) {
      return;
    }

    const timer = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setProcessing(false);
          setSuccess(true);
          setReceiptRef(`PS_${Math.random().toString(36).slice(2, 9).toUpperCase()}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [processing]);

  const formatCardNumber = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '').slice(0, 16);
    return numbersOnly.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleBeginProcessing = () => {
    setCountdown(10);
    setProcessing(true);
  };

  const copyTestCard = async () => {
    await navigator.clipboard.writeText('4242 4242 4242 4242');
    window.alert('Test card copied!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#0F2744] to-[#1A3A5F] font-sans">
      <div className="bg-[#0D1E30] border-b border-[#1E3A5F] py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#00A3FF] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-white font-semibold text-xl">PayStack</span>
            <span className="text-[#6B8EB5] text-sm ml-2">⚡ Demo Mode</span>
          </div>
          <div className="flex items-center space-x-4">
            <Lock className="h-4 w-4 text-[#6B8EB5]" />
            <span className="text-[#6B8EB5] text-sm">Secured by PayStack</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[#6B8EB5] hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Marketplace
          </button>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <AnimatePresence mode="wait">
                {!success ? (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-[#0D2135] rounded-2xl border border-[#1E3A5F] overflow-hidden"
                  >
                    <div className="p-6 border-b border-[#1E3A5F]">
                      <div className="flex items-center">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-center flex-1">
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                step >= i ? 'bg-[#00A3FF] text-white' : 'bg-[#1E3A5F] text-[#6B8EB5]'
                              }`}
                            >
                              {step > i ? <CheckCircle className="h-4 w-4" /> : i}
                            </div>
                            {i < 3 && (
                              <div
                                className={`flex-1 h-0.5 mx-2 ${step > i ? 'bg-[#00A3FF]' : 'bg-[#1E3A5F]'}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-[#6B8EB5]">
                        <span>Payment Method</span>
                        <span>Details</span>
                        <span>Confirm</span>
                      </div>
                    </div>

                    <div className="p-6">
                      {step === 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                          <h3 className="text-white font-semibold text-lg mb-4">Select Payment Method</h3>

                          {[
                            {
                              id: 'card',
                              name: 'Credit/Debit Card',
                              icon: CreditCard,
                              desc: 'Pay with Visa, Mastercard, Verve',
                              popular: true,
                            },
                            { id: 'bank', name: 'Bank Transfer', icon: Building, desc: 'Transfer from your bank account' },
                            { id: 'ussd', name: 'USSD', icon: Smartphone, desc: 'Quick USSD banking' },
                            { id: 'mobile', name: 'Mobile Money', icon: Wallet, desc: 'Pay with mobile money' },
                          ].map(method => {
                            const Icon = method.icon;
                            const methodId = method.id as PaymentMethod;

                            return (
                              <button
                                key={method.id}
                                onClick={() => setPaymentMethod(methodId)}
                                className={`w-full p-4 rounded-xl border-2 transition-all ${
                                  paymentMethod === method.id
                                    ? 'border-[#00A3FF] bg-[#00A3FF]/10'
                                    : 'border-[#1E3A5F] hover:border-[#2E4A6F]'
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`p-3 rounded-lg ${
                                      paymentMethod === method.id ? 'bg-[#00A3FF]' : 'bg-[#1E3A5F]'
                                    }`}
                                  >
                                    <Icon
                                      className={`h-5 w-5 ${
                                        paymentMethod === method.id ? 'text-white' : 'text-[#6B8EB5]'
                                      }`}
                                    />
                                  </div>
                                  <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2">
                                      <span className="text-white font-medium">{method.name}</span>
                                      {method.popular && (
                                        <span className="text-xs bg-[#00A3FF]/20 text-[#00A3FF] px-2 py-0.5 rounded-full">
                                          Popular
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-[#6B8EB5]">{method.desc}</p>
                                  </div>
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 ${
                                      paymentMethod === method.id
                                        ? 'border-[#00A3FF] bg-[#00A3FF]'
                                        : 'border-[#1E3A5F]'
                                    }`}
                                  >
                                    {paymentMethod === method.id && <CheckCircle className="h-4 w-4 text-white" />}
                                  </div>
                                </div>
                              </button>
                            );
                          })}

                          <button
                            onClick={() => setStep(2)}
                            className="w-full mt-6 bg-[#00A3FF] hover:bg-[#0093E6] text-white font-semibold py-4 rounded-xl transition-colors"
                          >
                            Continue to Details
                            <ChevronRight className="h-5 w-5 inline ml-2" />
                          </button>
                        </motion.div>
                      )}

                      {step === 2 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                          <h3 className="text-white font-semibold text-lg mb-4">
                            {paymentMethod === 'card' && 'Enter Card Details'}
                            {paymentMethod === 'bank' && 'Select Your Bank'}
                            {paymentMethod === 'ussd' && 'USSD Payment'}
                            {paymentMethod === 'mobile' && 'Mobile Money'}
                          </h3>

                          {paymentMethod === 'card' && (
                            <>
                              <div>
                                <label className="block text-[#6B8EB5] text-sm mb-2">Card Number</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    value={formData.cardNumber}
                                    onChange={e =>
                                      setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })
                                    }
                                    maxLength={19}
                                    className="w-full bg-[#0A1929] border border-[#1E3A5F] rounded-xl px-4 py-3 text-white placeholder-[#3A5A7A] focus:border-[#00A3FF] focus:outline-none"
                                  />
                                  <CreditCard className="absolute right-4 top-3 h-5 w-5 text-[#6B8EB5]" />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[#6B8EB5] text-sm mb-2">Cardholder Name</label>
                                <input
                                  type="text"
                                  placeholder="JOHN DOE"
                                  value={formData.cardName}
                                  onChange={e =>
                                    setFormData({ ...formData, cardName: e.target.value.toUpperCase() })
                                  }
                                  className="w-full bg-[#0A1929] border border-[#1E3A5F] rounded-xl px-4 py-3 text-white placeholder-[#3A5A7A] focus:border-[#00A3FF] focus:outline-none"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[#6B8EB5] text-sm mb-2">Expiry Date</label>
                                  <input
                                    type="text"
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    value={formData.expiry}
                                    onChange={e => setFormData({ ...formData, expiry: e.target.value })}
                                    className="w-full bg-[#0A1929] border border-[#1E3A5F] rounded-xl px-4 py-3 text-white placeholder-[#3A5A7A] focus:border-[#00A3FF] focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[#6B8EB5] text-sm mb-2">CVV</label>
                                  <input
                                    type="password"
                                    placeholder="123"
                                    maxLength={3}
                                    value={formData.cvv}
                                    onChange={e => setFormData({ ...formData, cvv: e.target.value })}
                                    className="w-full bg-[#0A1929] border border-[#1E3A5F] rounded-xl px-4 py-3 text-white placeholder-[#3A5A7A] focus:border-[#00A3FF] focus:outline-none"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {paymentMethod === 'bank' && (
                            <>
                              <select
                                value={formData.bank}
                                onChange={e => setFormData({ ...formData, bank: e.target.value })}
                                className="w-full bg-[#0A1929] border border-[#1E3A5F] rounded-xl px-4 py-3 text-white focus:border-[#00A3FF] focus:outline-none"
                              >
                                <option value="">Select your bank</option>
                                <option>Access Bank</option>
                                <option>GTBank</option>
                                <option>First Bank</option>
                                <option>UBA</option>
                                <option>Zenith Bank</option>
                              </select>

                              <div>
                                <label className="block text-[#6B8EB5] text-sm mb-2">Account Number</label>
                                <input
                                  type="text"
                                  placeholder="0123456789"
                                  maxLength={10}
                                  value={formData.accountNumber}
                                  onChange={e =>
                                    setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })
                                  }
                                  className="w-full bg-[#0A1929] border border-[#1E3A5F] rounded-xl px-4 py-3 text-white focus:border-[#00A3FF] focus:outline-none"
                                />
                              </div>
                            </>
                          )}

                          {paymentMethod === 'ussd' && (
                            <div className="rounded-xl border border-[#1E3A5F] bg-[#0A1929] p-4 text-[#6B8EB5] text-sm">
                              Dial <span className="text-white font-semibold">*737*000*{product.price}#</span> on your
                              registered line and complete payment.
                            </div>
                          )}

                          {paymentMethod === 'mobile' && (
                            <div className="rounded-xl border border-[#1E3A5F] bg-[#0A1929] p-4 text-[#6B8EB5] text-sm">
                              Open your mobile wallet app and approve this transaction from your notifications.
                            </div>
                          )}

                          <div className="bg-[#0A1929] rounded-xl p-4 border border-[#1E3A5F]">
                            <div className="flex items-center gap-2 text-[#6B8EB5] text-sm mb-2">
                              <Mail className="h-4 w-4" />
                              <span>Receipt Email</span>
                            </div>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={e => setFormData({ ...formData, email: e.target.value })}
                              className="w-full bg-transparent text-white focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                              onClick={() => setStep(1)}
                              className="w-full border border-[#1E3A5F] text-[#6B8EB5] hover:text-white py-3 rounded-xl transition-colors"
                            >
                              Back
                            </button>
                            <button
                              onClick={() => setStep(3)}
                              className="w-full bg-[#00A3FF] hover:bg-[#0093E6] text-white font-semibold py-3 rounded-xl transition-colors"
                            >
                              Continue
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {step === 3 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                          <h3 className="text-white font-semibold text-lg">Confirm Payment</h3>
                          <div className="bg-[#0A1929] rounded-xl p-4 border border-[#1E3A5F] space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#6B8EB5]">Method</span>
                              <span className="text-white capitalize">{paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B8EB5]">Email</span>
                              <span className="text-white">{formData.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B8EB5]">Amount</span>
                              <span className="text-white font-bold">₦{product.price.toLocaleString()}</span>
                            </div>
                          </div>

                          <button
                            onClick={handleBeginProcessing}
                            className="w-full bg-[#00A3FF] hover:bg-[#0093E6] text-white font-semibold py-4 rounded-xl transition-colors"
                          >
                            Pay ₦{product.price.toLocaleString()}
                          </button>

                          <button
                            onClick={() => setStep(2)}
                            className="w-full text-[#6B8EB5] hover:text-white transition-colors"
                          >
                            Edit Details
                          </button>

                          <p className="text-center text-xs text-[#6B8EB5] flex items-center justify-center gap-1">
                            <Lock className="h-3 w-3" />
                            Your payment info is secured with 256-bit encryption
                          </p>
                        </motion.div>
                      )}
                    </div>

                    <div className="p-4 bg-[#0A1929] border-t border-[#1E3A5F]">
                      <div className="flex items-center gap-4 text-xs text-[#6B8EB5]">
                        <Shield className="h-4 w-4" />
                        <span>PCI DSS Level 1 Compliant</span>
                        <span className="w-1 h-1 rounded-full bg-[#1E3A5F]" />
                        <Globe className="h-4 w-4" />
                        <span>3D Secure Enabled</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0D2135] rounded-2xl border border-[#1E3A5F] p-12 text-center"
                  >
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
                    <p className="text-[#6B8EB5] mb-6">Your transaction was completed successfully</p>

                    <div className="bg-[#0A1929] rounded-xl p-6 mb-6 text-left">
                      <div className="flex justify-between mb-2">
                        <span className="text-[#6B8EB5]">Reference:</span>
                        <span className="text-white font-mono">{receiptRef}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-[#6B8EB5]">Amount:</span>
                        <span className="text-white font-bold">₦{product.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B8EB5]">Date:</span>
                        <span className="text-white">{new Date().toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/shop')}
                      className="bg-[#00A3FF] hover:bg-[#0093E6] text-white font-semibold px-8 py-4 rounded-xl"
                    >
                      Return to Marketplace
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="md:col-span-1">
              <div className="bg-[#0D2135] rounded-2xl border border-[#1E3A5F] p-6 sticky top-4">
                <h3 className="text-white font-semibold text-lg mb-4">Order Summary</h3>

                <div className="aspect-square bg-[#0A1929] rounded-xl mb-4 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={e => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500';
                    }}
                  />
                </div>

                <div className="space-y-3 mb-4">
                  <h4 className="text-white font-medium">{product.name}</h4>
                  <p className="text-sm text-[#6B8EB5]">Seller: {product.seller}</p>

                  <div className="flex items-center gap-2 text-sm text-[#6B8EB5]">
                    <User className="h-4 w-4" />
                    <span>Student Verified</span>
                  </div>
                </div>

                <div className="border-t border-[#1E3A5F] pt-4 space-y-2">
                  <div className="flex justify-between text-[#6B8EB5]">
                    <span>Subtotal</span>
                    <span>₦{product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#6B8EB5]">
                    <span>Transaction Fee</span>
                    <span>₦0</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-[#1E3A5F]">
                    <span>Total</span>
                    <span className="text-[#00A3FF]">₦{product.price.toLocaleString()}</span>
                  </div>
                </div>

                {processing && (
                  <div className="mt-6 p-4 bg-[#0A1929] rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-5 h-5 border-2 border-[#00A3FF] border-t-transparent rounded-full animate-spin" />
                      <span className="text-white text-sm">Processing payment...</span>
                    </div>
                    <div className="w-full bg-[#1E3A5F] rounded-full h-1.5">
                      <div
                        className="bg-[#00A3FF] h-1.5 rounded-full transition-all duration-1000"
                        style={{ width: `${(10 - countdown) * 10}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#6B8EB5] mt-2">Estimated time: {countdown}s</p>
                  </div>
                )}

                <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-yellow-500 font-medium">🔧 Demo Mode</p>
                      <p className="text-xs text-[#6B8EB5] mt-1">
                        This is a simulation. Use test card: 4242 4242 4242 4242
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={copyTestCard}
                  className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-[#6B8EB5] hover:text-white transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  Copy test card
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-[#6B8EB5]">
            <p>© 2026 PayStack (Demo) • This is a simulation for educational purposes</p>
            <p className="mt-1">Test Card: 4242 4242 4242 4242 | Exp: 12/25 | CVV: 123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSimulation;