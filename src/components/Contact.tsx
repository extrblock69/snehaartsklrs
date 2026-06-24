import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle2, User, HelpCircle, Palette, Sparkles } from 'lucide-react';
import { useContent } from '../context/ContentContext';

export default function Contact() {
  const { content } = useContent();
  const contact = content.contact || {
    badgeText: "START YOUR EDUCATION",
    title: "Connect with Sneha Bansal",
    description: "Have questions about group programs, specialized portfolio reviews, or personalized coaching? Fill out the portfolio inquiry form below and elevate your sketching foundations.",
    phone: "+91 7562 224809",
    email: "sneha@fineart-morena.com",
    address: "Studio 12, Main Road, Kailaras, Morena, Madhya Pradesh, 476224, India",
    infoCardText: "Based out of Kailaras, Morena, Sneha offers structural art training worldwide. Whether you prefer traditional paper workshops or live interactive screens, get structured answers.",
    infoCardQuote: "Art is not just a collection of drawings. It is a systematic, lovely discipline of learning to see depth, space, and accurate value hierarchies.",
    infoCardQuoteAuthor: "Sneha Bansal",
    metricLeftVal: "24 Hour",
    metricLeftLabel: "Typical Reply Time",
    metricRightVal: "Global",
    metricRightLabel: "India & International"
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '1-on-1 Mentorship',
    mediumOfInterest: 'Charcoal & Graphite',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const inquiryTypes = [
    '1-on-1 Mentorship',
    'Online Group Classes',
    'School/Institutional Workshop',
    'Creative Collaboration / Art Project',
    'General Inquiry',
  ];

  const mediums = [
    'Charcoal & Graphite',
    'Watercolor & Acrylics',
    'Portraiture Principles',
    'Basic Foundations for Young Creators',
    'Custom Artworks',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill out all required fields.');
      return;
    }

    setStatus('submitting');
    
    try {
      const apiBaseUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
      const res = await fetch(`${apiBaseUrl}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'The server could not accept this inquiry. Please verify server logs.');
        setStatus('idle');
      }
    } catch (err: any) {
      console.error('Contact submit error:', err);
      alert('Network transmission failed. Please check your connection or contact Sneha directly.');
      setStatus('idle');
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      inquiryType: '1-on-1 Mentorship',
      mediumOfInterest: 'Charcoal & Graphite',
      message: '',
    });
    setStatus('idle');
  };

  const formattedPhoneUrl = contact.phone.replace(/\s+/g, '');

  return (
    <section id="contact" className="py-24 bg-stone-50 dark:bg-stone-950 border-t border-stone-200/40 dark:border-stone-900/60 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative background grid and blurs */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[radial-gradient(#937562_1px,transparent_1px)] [background-size:24px_24px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs text-wood dark:text-wood font-semibold tracking-widest uppercase block mb-3">
            {contact.badgeText}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
            {contact.title}
          </h2>
          <div className="h-[1px] w-12 bg-wood mx-auto my-4" />
          <p className="text-stone-550 dark:text-stone-300 font-light text-sm leading-relaxed">
            {contact.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Essential Studio Details & Aesthetic Info Card */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-stone-100 dark:bg-stone-900/80 p-8 rounded-xl border border-stone-200/50 dark:border-stone-800/50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 rounded-full bg-wood/5 opacity-50 blur-xl" />
              
              <h3 className="font-serif text-xl font-light text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-wood stroke-[1.5]" />
                Direct Studio Contacts
              </h3>
              
              <p className="text-stone-600 dark:text-stone-300 font-light text-xs leading-relaxed mb-8">
                {contact.infoCardText}
              </p>

              <div className="space-y-6 text-xs">
                <div id="contact-info-phone" className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-wood flex-shrink-0">
                    <Phone className="w-4 h-4 stroke-[1.5]" />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-stone-400 dark:text-stone-500 block uppercase tracking-wider mb-0.5">PHONE INQUIRY</span>
                    <a href={`tel:${formattedPhoneUrl}`} className="text-stone-800 dark:text-stone-200 hover:text-wood font-medium font-mono text-xs transition-colors">
                      {contact.phone}
                    </a>
                  </div>
                </div>

                <div id="contact-info-email" className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-wood flex-shrink-0">
                    <Mail className="w-4 h-4 stroke-[1.5]" />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-stone-400 dark:text-stone-500 block uppercase tracking-wider mb-0.5">DIRECT EMAIL</span>
                    <a href={`mailto:${contact.email}`} className="text-stone-800 dark:text-stone-200 hover:text-wood font-medium font-mono text-xs transition-colors">
                      {contact.email}
                    </a>
                  </div>
                </div>

                <div id="contact-info-location" className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-wood flex-shrink-0">
                    <MapPin className="w-4 h-4 stroke-[1.5]" />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-stone-400 dark:text-stone-500 block uppercase tracking-wider mb-0.5">THE WORKSPACE</span>
                    <span className="text-stone-700 dark:text-stone-300 font-light leading-relaxed block whitespace-pre-line">
                      {contact.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Aesthetic quote in card */}
              <div className="border-t border-stone-200 dark:border-stone-800 mt-8 pt-6">
                <blockquote className="italic font-serif text-stone-500 dark:text-stone-400 text-xs leading-relaxed">
                  "{contact.infoCardQuote}"
                </blockquote>
                <span className="block font-mono text-[9px] text-wood font-semibold mt-2 tracking-widest uppercase">
                  &mdash; {contact.infoCardQuoteAuthor}
                </span>
              </div>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-stone-100/50 dark:bg-stone-900/40 p-4 rounded-xl border border-stone-200/30 dark:border-stone-800/40 text-center">
                <span className="block text-2xl font-serif text-wood font-light leading-none mb-1">{contact.metricLeftVal}</span>
                <span className="block font-mono text-[9px] text-stone-400 uppercase tracking-widest">{contact.metricLeftLabel}</span>
              </div>
              <div className="bg-stone-100/50 dark:bg-stone-900/40 p-4 rounded-xl border border-stone-200/30 dark:border-stone-800/40 text-center">
                <span className="block text-2xl font-serif text-wood font-light leading-none mb-1">{contact.metricRightVal}</span>
                <span className="block font-mono text-[9px] text-stone-400 uppercase tracking-widest">{contact.metricRightLabel}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Custom Interactive Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-stone-900 p-8 sm:p-10 rounded-xl border border-stone-200/60 dark:border-stone-800/80 shadow-md relative min-h-[500px] flex flex-col justify-between">
              
              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    onSubmit={handleSubmit} 
                    className="space-y-6 text-left"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-mono text-stone-550 dark:text-stone-400 uppercase tracking-wider font-semibold">
                          Your Full Name <span className="text-wood">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400/80" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Aarav Sharma"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-950/60 border border-stone-250 dark:border-stone-800 rounded-lg py-2.5 pl-10 pr-4 text-xs font-sans text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-wood focus:ring-1 focus:ring-wood/50 transition-all"
                          />
                        </div>
                      </div>

                      {/* Email input */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-mono text-stone-550 dark:text-stone-400 uppercase tracking-wider font-semibold">
                          Email Address <span className="text-wood">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400/80" />
                          <input
                            type="email"
                            required
                            placeholder="e.g. aarav@gmail.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-950/60 border border-stone-250 dark:border-stone-800 rounded-lg py-2.5 pl-10 pr-4 text-xs font-sans text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-wood focus:ring-1 focus:ring-wood/50 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Phone input */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-mono text-stone-550 dark:text-stone-400 uppercase tracking-wider">
                          Phone Number <span className="text-xs text-stone-400">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400/80" />
                          <input
                            type="tel"
                            placeholder="e.g. +91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-950/60 border border-stone-250 dark:border-stone-800 rounded-lg py-2.5 pl-10 pr-4 text-xs font-sans text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-wood focus:ring-1 focus:ring-wood/50 transition-all"
                          />
                        </div>
                      </div>

                      {/* Inquiry Type */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-mono text-stone-550 dark:text-stone-400 uppercase tracking-wider font-semibold">
                          Inquiry Type
                        </label>
                        <div className="relative">
                          <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400/80 pointer-events-none" />
                          <select
                            value={formData.inquiryType}
                            onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-950/60 border border-stone-250 dark:border-stone-800 rounded-lg py-2.5 pl-10 pr-4 text-xs font-sans text-stone-800 dark:text-stone-100 focus:outline-none focus:border-wood focus:ring-1 focus:ring-wood/50 transition-all appearance-none cursor-pointer"
                          >
                            {inquiryTypes.map((type, i) => (
                              <option key={i} value={type} className="dark:bg-stone-900 bg-white">
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Message textarea */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-stone-550 dark:text-stone-400 uppercase tracking-wider font-semibold">
                        Your Message <span className="text-wood">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell Sneha about your previous drawing experience, creative goals, or scheduling preferences..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-950/60 border border-stone-250 dark:border-stone-800 rounded-lg py-2.5 px-4 text-xs font-sans text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-wood focus:ring-1 focus:ring-wood/50 transition-all resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full h-11 bg-stone-950 hover:bg-stone-900 dark:bg-stone-50 dark:hover:bg-white text-white dark:text-stone-950 font-mono text-xs tracking-widest uppercase rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {status === 'submitting' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-stone-400 dark:border-stone-600 border-t-stone-100 dark:border-t-stone-900 rounded-full animate-spin" />
                          <span>SENDING INQUIRY...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>SUBMIT INQUIRY</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center text-center py-12 px-4 space-y-6 my-auto"
                  >
                    <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 border border-wood/20 flex items-center justify-center text-wood shadow-sm">
                      <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-serif text-2xl font-light text-stone-900 dark:text-stone-100">
                        Inquiry Received
                      </h3>
                      <p className="text-xs font-mono text-wood uppercase tracking-widest">
                        Thank you, {formData.name}
                      </p>
                    </div>

                    <p className="text-stone-550 dark:text-stone-300 font-light text-sm max-w-md leading-relaxed">
                      Your inquiry regarding <strong className="font-medium text-stone-850 dark:text-stone-100">{formData.inquiryType}</strong> has been transmitted successfully. 
                      Sneha will personally review your goals and reach back to you at <strong className="font-medium text-stone-850 dark:text-stone-100">{formData.email}</strong> within 24 hours.
                    </p>

                    <button
                      onClick={handleReset}
                      className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer border border-stone-250 dark:border-stone-800"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
