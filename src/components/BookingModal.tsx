import React, { useState } from 'react';
import { Calendar, Clock, User, Mail, Phone, MapPin, Video, MessageSquare, CheckCircle2, ShieldCheck, Download, Loader2, Sparkles, CreditCard, QrCode } from 'lucide-react';
import { ASTROLOGY_SERVICES } from '../data/astrologyData';
import { Booking } from '../types';

interface BookingModalProps {
  initialServiceId?: string;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ initialServiceId, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const defaultService =
    ASTROLOGY_SERVICES.find((s) => s.id === initialServiceId) || ASTROLOGY_SERVICES[0];

  const [selectedService, setSelectedService] = useState(defaultService);
  const [consultationType, setConsultationType] = useState<'video' | 'audio' | 'in_person' | 'whatsapp'>('video');
  const [selectedDate, setSelectedDate] = useState('2026-08-06');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('11:00 AM - 12:00 PM');

  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '1995-04-14',
    tob: '08:30',
    pob: 'New Delhi, India',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const timeSlots = [
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '05:00 PM - 06:00 PM',
    '07:00 PM - 08:00 PM',
  ];

  const handleCompleteBooking = async () => {
    setLoadingPayment(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          serviceTitle: selectedService.title,
          clientName: clientForm.name,
          clientEmail: clientForm.email,
          clientPhone: clientForm.phone,
          dob: clientForm.dob,
          tob: clientForm.tob,
          pob: clientForm.pob,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          consultationType,
          notes: clientForm.notes,
          amount: selectedService.priceINR,
          paymentMethod: paymentMethod.toUpperCase(),
        }),
      });

      const data = await res.json();
      if (data.success && data.booking) {
        setConfirmedBooking(data.booking);
        setStep(5);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayment(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B18]/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#050B18] border border-[#D4AF37]/40 text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/50 hover:text-white text-2xl font-bold cursor-pointer"
        >
          ✕
        </button>

        {/* Progress Step Indicator */}
        {step < 5 && (
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center space-x-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step >= s ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18]' : 'bg-white/5 text-white/40'
                  }`}
                >
                  {s}
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-white/70 hidden sm:inline">
                  {s === 1 && 'सेवा चयन'}
                  {s === 2 && 'तिथि व समय'}
                  {s === 3 && 'जन्म विवरण'}
                  {s === 4 && 'सुरक्षित भुगतान'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: Select Service & Mode */}
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-xl font-serif font-bold text-[#D4AF37] flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-[#FF9933]" />
              चरण 1: ज्योतिष सेवा एवं परामर्श माध्यम चुनें
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#D4AF37] mb-1">ज्योतिष सेवा का चयन करें</label>
              <select
                value={selectedService.id}
                onChange={(e) => {
                  const s = ASTROLOGY_SERVICES.find((serv) => serv.id === e.target.value);
                  if (s) setSelectedService(s);
                }}
                className="w-full bg-white/5 border border-white/10 text-[#D4AF37] text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
              >
                {ASTROLOGY_SERVICES.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#050B18] text-white">
                    {s.title} — ₹{s.priceINR} (${s.priceUSD})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D4AF37] mb-2">परामर्श का माध्यम चुनें</label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setConsultationType('video')}
                  className={`p-3.5 rounded-2xl border flex items-center space-x-3 transition-all cursor-pointer ${
                    consultationType === 'video'
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                      : 'bg-white/5 border-white/10 text-white/70'
                  }`}
                >
                  <Video className="w-5 h-5 text-[#D4AF37]" />
                  <div className="text-left">
                    <span className="block font-bold">वीडियो कॉल परामर्श</span>
                    <span className="text-[10px] text-white/50">Google Meet / Zoom</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setConsultationType('audio')}
                  className={`p-3.5 rounded-2xl border flex items-center space-x-3 transition-all cursor-pointer ${
                    consultationType === 'audio'
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                      : 'bg-white/5 border-white/10 text-white/70'
                  }`}
                >
                  <Phone className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <span className="block font-bold">फोन कॉल परामर्श</span>
                    <span className="text-[10px] text-white/50">डायरेक्ट मोबाइल / ऑडियो</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setConsultationType('whatsapp')}
                  className={`p-3.5 rounded-2xl border flex items-center space-x-3 transition-all cursor-pointer ${
                    consultationType === 'whatsapp'
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                      : 'bg-white/5 border-white/10 text-white/70'
                  }`}
                >
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <div className="text-left">
                    <span className="block font-bold">व्हाट्सऐप परामर्श</span>
                    <span className="text-[10px] text-white/50">लाइव वॉयस नोट व चैट</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setConsultationType('in_person')}
                  className={`p-3.5 rounded-2xl border flex items-center space-x-3 transition-all cursor-pointer ${
                    consultationType === 'in_person'
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                      : 'bg-white/5 border-white/10 text-white/70'
                  }`}
                >
                  <MapPin className="w-5 h-5 text-purple-400" />
                  <div className="text-left">
                    <span className="block font-bold">कार्यालय में व्यक्तिगत भेंट</span>
                    <span className="text-[10px] text-white/50">छिंदवाड़ा (म.प्र.) आश्रम केंद्र</span>
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-full font-bold tracking-wider text-[#050B18] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:scale-[1.02] transition-transform text-xs cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              आगे बढ़ें: तिथि एवं समय चयन →
            </button>
          </div>
        )}

        {/* STEP 2: Date & Time Slot */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-xl font-serif font-bold text-[#D4AF37] flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-[#FF9933]" />
              चरण 2: परामर्श तिथि एवं समय का चुनाव
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#D4AF37] mb-1">अपॉइंटमेंट तिथि दर्ज करें</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D4AF37] mb-2">उपलब्ध समय (Time Slots)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`p-3 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                      selectedTimeSlot === slot
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#050B18] font-bold border-transparent shadow-md'
                        : 'bg-white/5 border-white/10 text-white/70 hover:text-[#D4AF37]'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-full font-semibold bg-white/5 border border-white/10 text-white/70 text-xs cursor-pointer"
              >
                ← पीछे जाएँ
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-3 rounded-full font-bold tracking-wider text-[#050B18] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-xs sm:text-sm hover:scale-[1.02] transition-transform cursor-pointer"
              >
                आगे बढ़ें: जन्म विवरण दर्ज करें →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Client Birth & Contact Info */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-bold text-[#D4AF37] flex items-center">
              <User className="w-5 h-5 mr-2 text-[#FF9933]" />
              चरण 3: जातक का नाम एवं जन्म विवरण
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-white/70 font-semibold mb-1">आपका पूरा नाम *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. स्वाति मलोत्रा"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">ईमेल पता *</label>
                <input
                  type="email"
                  required
                  placeholder="उदा. swati@gmail.com"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">व्हाट्सऐप / मोबाइल नंबर *</label>
                <input
                  type="tel"
                  required
                  placeholder="उदा. 8319885134"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">जन्म तिथि (Date of Birth) *</label>
                <input
                  type="date"
                  required
                  value={clientForm.dob}
                  onChange={(e) => setClientForm({ ...clientForm, dob: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">जन्म समय (Time of Birth) *</label>
                <input
                  type="time"
                  required
                  value={clientForm.tob}
                  onChange={(e) => setClientForm({ ...clientForm, tob: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">जन्म स्थान (Place of Birth) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. जयपुर, राजस्थान"
                  value={clientForm.pob}
                  onChange={(e) => setClientForm({ ...clientForm, pob: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/70 font-semibold mb-1 text-xs">राजन कैथवास (मंटू) के लिए विशेष प्रश्न / टिप्पणी (Optional)</label>
              <textarea
                rows={2}
                placeholder="विवाह, करियर, स्वास्थ्य आदि संबंधित विशेष समस्या लिखें..."
                value={clientForm.notes}
                onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3 rounded-full font-semibold bg-white/5 border border-white/10 text-white/70 text-xs cursor-pointer"
              >
                ← पीछे जाएँ
              </button>
              <button
                disabled={!clientForm.name || !clientForm.email || !clientForm.phone}
                onClick={() => setStep(4)}
                className="w-2/3 py-3 rounded-full font-bold tracking-wider text-[#050B18] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-xs sm:text-sm disabled:opacity-50 cursor-pointer"
              >
                आगे बढ़ें: सुरक्षित भुगतान →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Payment Gateway Simulation */}
        {step === 4 && (
          <div className="space-y-5">
            <h3 className="text-xl font-serif font-bold text-[#D4AF37] flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-[#FF9933]" />
              चरण 4: सुरक्षित भुगतान गेटवे
            </h3>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/60">चयनित सेवा:</span>
                <span className="font-bold text-[#D4AF37]">{selectedService.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">तिथि व समय स्लॉट:</span>
                <span className="text-white/80">{selectedDate} ({selectedTimeSlot})</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 text-sm">
                <span className="font-bold text-white/80">कुल दक्षिण / शुल्क:</span>
                <span className="font-serif font-bold text-[#D4AF37]">₹{selectedService.priceINR}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border flex items-center space-x-2 cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                    : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>BHIM UPI / GPay / PhonePe</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border flex items-center space-x-2 cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                    : 'bg-white/5 border-white/10 text-white/70'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>क्रेडिट / डेबिट कार्ड</span>
              </button>
            </div>

            {/* UPI QR Display Simulation */}
            {paymentMethod === 'upi' && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                <div className="w-28 h-28 mx-auto bg-white p-2 rounded-xl flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-slate-900" />
                </div>
                <p className="text-xs text-[#D4AF37] font-semibold">क्यूआर कोड स्कैन करें अथवा UPI ID: <span className="text-white">rajan.kaithwas@upi</span></p>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setStep(3)}
                className="w-1/3 py-3 rounded-full font-semibold bg-white/5 border border-white/10 text-white/70 text-xs cursor-pointer"
              >
                ← पीछे जाएँ
              </button>
              <button
                onClick={handleCompleteBooking}
                disabled={loadingPayment}
                className="w-2/3 py-3.5 rounded-full font-bold tracking-wider text-[#050B18] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-xs sm:text-sm shadow-xl flex items-center justify-center cursor-pointer"
              >
                {loadingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    भुगतान संसाधित हो रहा है...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    भुगतान पूर्ण करें एवं बुकिंग पुष्टि प्राप्त करें
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Booking Confirmation & Printable Invoice */}
        {step === 5 && confirmedBooking && (
          <div id="printable-invoice" className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>

            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">बुकिंग सफलतापूर्वक संपन्न!</span>
              <h3 className="text-2xl font-serif font-extrabold text-[#D4AF37] mt-1">
                रसीद संख्या: {confirmedBooking.bookingRef}
              </h3>
              <p className="text-xs text-white/70 mt-1">
                पुष्टि पत्र एवं परामर्श लिंक आपकी ईमेल <span className="text-[#D4AF37]">{confirmedBooking.clientEmail}</span> पर भेज दिया गया है।
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-left text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-white/50">जातक का नाम:</span>
                <span className="font-bold text-white">{confirmedBooking.clientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-white/50">ज्योतिष सेवा:</span>
                <span className="font-bold text-[#D4AF37]">{confirmedBooking.serviceTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-white/50">तिथि व समय स्लॉट:</span>
                <span className="text-white">{confirmedBooking.date} ({confirmedBooking.timeSlot})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-white/50">परामर्श लिंक / स्थान:</span>
                <a href={confirmedBooking.meetingLink} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] underline font-semibold truncate max-w-[200px]">
                  {confirmedBooking.meetingLink}
                </a>
              </div>
              <div className="flex justify-between py-1 text-sm font-bold pt-2">
                <span className="text-white/70">भुगतान की गई राशि:</span>
                <span className="text-[#D4AF37]">₹{confirmedBooking.amount} (सफलतापूर्वक प्राप्त)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handlePrintInvoice}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-white/10 flex items-center cursor-pointer"
              >
                <Download className="w-4 h-4 mr-2" />
                रसीद डाउनलोड करें (PDF/Print)
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full text-xs font-bold tracking-wider text-[#050B18] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] cursor-pointer"
              >
                मुख्य पृष्ठ पर लौटें
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
