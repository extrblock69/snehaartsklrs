import { useState, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Calendar, Clock, User, MessageSquare, Compass, Send, CheckCircle2 } from 'lucide-react';
import { BookingState } from '../types';

export default function Booking() {
  const [formData, setFormData] = useState<BookingState>({
    studentName: '',
    studentEmail: '',
    selectedLessonId: 'lesson-1',
    preferredDate: '',
    preferredTime: '10:00 AM',
    experienceLevel: 'Beginner',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const timeSlots = ['9:00 AM', '11:00 AM', '2:05 PM', '4:30 PM']; // small adjustment

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.studentName.trim()) {
      nextErrors.studentName = 'Full name is required';
    }
    if (!formData.studentEmail.trim()) {
      nextErrors.studentEmail = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.studentEmail)) {
      nextErrors.studentEmail = 'Invalid email structure';
    }
    if (!formData.preferredDate) {
      nextErrors.preferredDate = 'Please select a session date';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate high-craft backend submission delays
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingConfirmed(true);
    }, 1500);
  };

  const closeConfirmation = () => {
    setBookingConfirmed(false);
    // Reset fields
    setFormData({
      studentName: '',
      studentEmail: '',
      selectedLessonId: 'lesson-1',
      preferredDate: '',
      preferredTime: '10:00 AM',
      experienceLevel: 'Beginner',
      message: ''
    });
  };

  const getSyllabusLabel = () => {
    switch (formData.selectedLessonId) {
      case 'lesson-1': return 'Foundations of Sight (Beginner)';
      case 'lesson-2': return 'Classical Portraiture Mastery (Intermediate)';
      case 'lesson-3': return 'Architectural & Masterwork (Advanced)';
      default: return 'Fine Art Consulting';
    }
  };

  return (
    <section
      id="book"
      className="py-24 bg-stone-50 dark:bg-stone-950 transition-colors duration-300 relative"
    >
      {/* Absolute faint background pattern */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.035] pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-left">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="font-mono text-xs text-wood font-semibold tracking-widest uppercase block">
            SESSION CONSULTATION
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-stone-900 dark:text-stone-100 tracking-tight">
            Schedule a Private Portfolio Review
          </h2>
          <div className="h-[1px] w-12 bg-wood mx-auto" />
          <p className="text-stone-500 dark:text-stone-400 font-light text-sm">
            Ready to learn? Complete the details below to request your complimentary 20-minute 
            one-on-one portfolio review and skills planning session with Sneha.
          </p>
        </div>

        {/* Core Form block with shadow boundaries */}
        <div className="bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-6 md:p-10 rounded-lg shadow-xl">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Entry */}
              <div className="space-y-1.5Col">
                <label className="block text-xs font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    placeholder="e.g., Benjamin Finch"
                    className={`w-full pl-9 pr-4 py-3 rounded border bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 transition-colors ${
                      errors.studentName ? 'border-red-400' : 'border-stone-250 dark:border-stone-800'
                    }`}
                  />
                </div>
                {errors.studentName && (
                  <p className="text-red-500 text-[11px] font-mono mt-1">{errors.studentName}</p>
                )}
              </div>

              {/* Email Entry */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    name="studentEmail"
                    value={formData.studentEmail}
                    onChange={handleInputChange}
                    placeholder="e.g., benjamin@finch.com"
                    className={`w-full pl-9 pr-4 py-3 rounded border bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 transition-colors ${
                      errors.studentEmail ? 'border-red-400' : 'border-stone-250 dark:border-stone-800'
                    }`}
                  />
                </div>
                {errors.studentEmail && (
                  <p className="text-red-500 text-[11px] font-mono mt-1">{errors.studentEmail}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course selection selection drop */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">
                  Syllabus Track Interest
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
                    <Compass className="w-4 h-4" />
                  </span>
                  <select
                    name="selectedLessonId"
                    value={formData.selectedLessonId}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-4 py-3 rounded border bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-105 text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 border-stone-250 dark:border-stone-800 cursor-pointer appearance-none"
                  >
                    <option value="lesson-1">Foundations of Sight (Beginner)</option>
                    <option value="lesson-2">Classical Portraiture Mastery (Intermediate)</option>
                    <option value="lesson-3">Architectural & Masterwork (Advanced)</option>
                  </select>
                </div>
              </div>

              {/* Experience selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">
                  Your Current Experience Level
                </label>
                <div className="flex gap-3">
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFormData({ ...formData, experienceLevel: lvl as any })}
                      className={`flex-grow py-3 px-1 border rounded text-xs transition-colors cursor-pointer text-center font-mono uppercase tracking-wider ${
                        formData.experienceLevel === lvl
                          ? 'bg-stone-950 text-white border-stone-950 dark:bg-stone-50 dark:text-stone-950 dark:border-stone-550 font-semibold shadow-sm'
                          : 'bg-stone-50 text-stone-500 hover:bg-stone-150 border-stone-250 dark:bg-stone-950 dark:text-stone-400 dark:border-stone-850 dark:hover:bg-stone-900'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">
                  Preferred Date
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    className={`w-full pl-9 pr-4 py-3 rounded border bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 transition-colors ${
                      errors.preferredDate ? 'border-red-400' : 'border-stone-250 dark:border-stone-800'
                    }`}
                  />
                </div>
                {errors.preferredDate && (
                  <p className="text-red-500 text-[11px] font-mono mt-1">{errors.preferredDate}</p>
                )}
              </div>

              {/* Time Capsules choice */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">
                  Preferred Time Slot
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredTime: time })}
                      className={`py-3.5 border rounded text-xs transition-colors cursor-pointer font-mono text-center leading-none ${
                        formData.preferredTime === time
                          ? 'bg-stone-950 text-white border-stone-950 dark:bg-stone-50 dark:text-stone-950 dark:border-stone-550 font-semibold shadow-inner'
                          : 'bg-stone-50 text-stone-500 hover:bg-stone-150 border-stone-255 dark:bg-stone-950 dark:text-stone-400 dark:border-stone-850 dark:hover:bg-stone-900'
                      }`}
                    >
                      {time.split(' ')[0]}
                      <span className="block text-[8px] opacity-75 mt-0.5">{time.split(' ')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Message Area */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-stone-500 dark:text-stone-405 uppercase tracking-wider font-semibold">
                Your Drawing Goals / Backstory (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-stone-400 pointer-events-none">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="e.g., 'I struggle with facial alignments and hand proportions. I want to build a portfolio of drawings for design university application.'"
                  className="w-full pl-9 pr-4 py-3 rounded border border-stone-250 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-sm focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
              </div>
            </div>

            {/* Submit button bar */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-stone-950 hover:bg-stone-900 dark:bg-stone-50 dark:hover:bg-white text-white dark:text-stone-950 rounded-lg font-bold tracking-widest text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-stone-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Transmitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Session Request</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Elegant Modal on booking success */}
        <AnimatePresence>
          {bookingConfirmed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 rounded-lg shadow-2xl max-w-lg w-full text-center space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-250 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="font-mono text-[9px] tracking-widest text-emerald-600 dark:text-emerald-400 block uppercase font-bold">
                    RESERVATION SUCCESSFUL
                  </span>
                  <h3 className="font-serif text-2xl font-light text-stone-900 dark:text-stone-50">
                    Your Sketch Session is Requested!
                  </h3>
                </div>

                <div className="p-4 bg-stone-100 dark:bg-stone-950 rounded border border-stone-200 dark:border-stone-850 text-left text-xs space-y-3 font-sans leading-relaxed">
                  <p className="text-stone-700 dark:text-stone-300">
                    Thank you, <strong>{formData.studentName}</strong>! Sneha has successfully received your fine-art diagnostic request.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-stone-500 dark:text-stone-400 pt-1 font-mono text-[11px]">
                    <div>
                      <span className="block uppercase text-[9px] text-stone-400">CLASS TYPE</span>
                      <span className="font-sans font-medium text-stone-805 dark:text-stone-250">{getSyllabusLabel()}</span>
                    </div>
                    <div>
                      <span className="block uppercase text-[9px] text-stone-400">SKILL LEVEL</span>
                      <span className="font-sans font-medium text-stone-805 dark:text-stone-250">{formData.experienceLevel}</span>
                    </div>
                    <div className="pt-1.5">
                      <span className="block uppercase text-[9px] text-stone-400">DESIRED DATE</span>
                      <span className="font-sans font-medium text-stone-805 dark:text-stone-250">{formData.preferredDate}</span>
                    </div>
                    <div className="pt-1.5">
                      <span className="block uppercase text-[9px] text-stone-400">TIME SLOT</span>
                      <span className="font-sans font-medium text-stone-855 dark:text-stone-250">{formData.preferredTime}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-500 leading-relaxed italic font-serif">
                  "Sneha will email you at {formData.studentEmail} within 24 hours to secure your live Google Meet URL link. Keep your sketchbooks ready."
                </p>

                <div className="pt-2">
                  <button
                    onClick={closeConfirmation}
                    className="w-full py-3 bg-stone-950 hover:bg-stone-900 dark:bg-stone-50 dark:hover:bg-white text-white dark:text-stone-950 font-mono text-xs tracking-widest uppercase rounded-lg cursor-pointer font-bold transition-all duration-300 shadow-sm"
                  >
                    Confirm & Underwrite
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
