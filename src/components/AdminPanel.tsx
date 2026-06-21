import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { 
  Settings, LogOut, Check, Save, Plus, Trash2, Edit3, Image, 
  HelpCircle, Sparkles, BookOpen, User, Phone, Mail, MapPin, Star, Eye, Upload
} from 'lucide-react';
import { Artwork, Lesson, Testimonial, StudentProject, ArtCategory, LessonLevel } from '../types';

interface FileUploaderProps {
  value: string;
  onChange: (url: string) => void;
  adminToken: string | null;
  label?: string;
  placeholder?: string;
}

function FileUploader({ value, onChange, adminToken, label, placeholder }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError('File is too large. Max size is 15MB.');
      return;
    }

    setUploading(true);
    setError('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
          },
          body: JSON.stringify({
            filename: file.name,
            base64Data
          })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          onChange(data.url);
        } else {
          setError(data.error || 'Failed to upload image.');
        }
      } catch (err) {
        console.error('Upload request failed:', err);
        setError('Server network error uploading file.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-1.5 text-left w-full">
      {label && <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase block">{label}</label>}
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs font-mono"
          placeholder={placeholder || "https://... or choose file on right"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <label className="relative shrink-0 flex items-center justify-center px-4 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-350 hover:text-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg cursor-pointer text-xs transition duration-150 select-none">
          {uploading ? (
            <span className="flex items-center gap-1.5 font-bold font-mono text-[10px] uppercase tracking-wide">
              <span className="w-3.5 h-3.5 border-2 border-stone-500 border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-bold font-mono text-[10px] uppercase tracking-wide">
              <Upload className="w-3.5 h-3.5" />
              Upload
            </span>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            disabled={uploading}
            onChange={handleFileChange}
          />
        </label>
      </div>
      {error && <span className="text-[10px] text-red-500 font-mono block mt-1">{error}</span>}
    </div>
  );
}

export default function AdminPanel() {
  const { content, login, logout, isAdmin, updateContent, adminToken } = useContent();
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab ] = useState<'hero' | 'about' | 'contact' | 'gallery' | 'showcase' | 'lessons' | 'testimonials' | 'security'>('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password alteration states
  const [newPassphrase, setNewPassphrase] = useState('');
  const [passphraseStatus, setPassphraseStatus] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' });
  const [isChangingPassphrase, setIsChangingPassphrase] = useState(false);

  // Core CMS state copies for editing
  const [heroForm, setHeroForm] = useState({ 
    badgeText: content.hero.badgeText || '',
    headingTextMain: content.hero.headingTextMain || '',
    headingTextHighlight: content.hero.headingTextHighlight || '',
    headingTextSuffix: content.hero.headingTextSuffix || '',
    subheadingText: content.hero.subheadingText || '',
    ctaPrimaryText: content.hero.ctaPrimaryText || '',
    ctaSecondaryText: content.hero.ctaSecondaryText || '',
    teacherPhotoUrl: content.hero.teacherPhotoUrl || '',
    underlayPhotoUrl: content.hero.underlayPhotoUrl || '',
    sigQuote: content.hero.sigQuote || '',
    sigSub: content.hero.sigSub || '',
  });

  const [aboutForm, setAboutForm] = useState({
    badgeText: content.about.badgeText || '',
    title: content.about.title || '',
    paragraphs: content.about.paragraphs || [],
    experienceYears: content.about.experienceYears || '',
    studentsMentored: content.about.studentsMentored || '',
    quote: content.about.quote || '',
    avatarUrl: content.about.avatarUrl || '',
    authorName: content.about.authorName || '',
    authorRole: content.about.authorRole || '',
  });

  const [contactForm, setContactForm] = useState({
    badgeText: content.contact?.badgeText || "START YOUR EDUCATION",
    title: content.contact?.title || "Connect with Sneha Bansal",
    description: content.contact?.description || "",
    phone: content.contact?.phone || "",
    email: content.contact?.email || "",
    address: content.contact?.address || "",
    infoCardText: content.contact?.infoCardText || "",
    infoCardQuote: content.contact?.infoCardQuote || "",
    infoCardQuoteAuthor: content.contact?.infoCardQuoteAuthor || "",
    metricLeftVal: content.contact?.metricLeftVal || "",
    metricLeftLabel: content.contact?.metricLeftLabel || "",
    metricRightVal: content.contact?.metricRightVal || "",
    metricRightLabel: content.contact?.metricRightLabel || "",
  });

  const [galleryList, setGalleryList] = useState<Artwork[]>([...content.gallery]);
  const [showcaseList, setShowcaseList] = useState<StudentProject[]>([...content.studentShowcase]);
  const [lessonsList, setLessonsList] = useState<Lesson[]>([...content.lessons]);
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([...content.testimonials]);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!password) {
      setLoginError('Password is required');
      return;
    }
    const success = await login(password);
    if (!success) {
      setLoginError('Incorrect password. Please verify and retry.');
    } else {
      // Reload lists when logged in
      setHeroForm({
        badgeText: content.hero.badgeText || '',
        headingTextMain: content.hero.headingTextMain || '',
        headingTextHighlight: content.hero.headingTextHighlight || '',
        headingTextSuffix: content.hero.headingTextSuffix || '',
        subheadingText: content.hero.subheadingText || '',
        ctaPrimaryText: content.hero.ctaPrimaryText || '',
        ctaSecondaryText: content.hero.ctaSecondaryText || '',
        teacherPhotoUrl: content.hero.teacherPhotoUrl || '',
        underlayPhotoUrl: content.hero.underlayPhotoUrl || '',
        sigQuote: content.hero.sigQuote || '',
        sigSub: content.hero.sigSub || '',
      });
      setAboutForm({
        badgeText: content.about.badgeText || '',
        title: content.about.title || '',
        paragraphs: content.about.paragraphs || [],
        experienceYears: content.about.experienceYears || '',
        studentsMentored: content.about.studentsMentored || '',
        quote: content.about.quote || '',
        avatarUrl: content.about.avatarUrl || '',
        authorName: content.about.authorName || '',
        authorRole: content.about.authorRole || '',
      });
      setContactForm({
        badgeText: content.contact?.badgeText || "START YOUR EDUCATION",
        title: content.contact?.title || "Connect with Sneha Bansal",
        description: content.contact?.description || "",
        phone: content.contact?.phone || "",
        email: content.contact?.email || "",
        address: content.contact?.address || "",
        infoCardText: content.contact?.infoCardText || "",
        infoCardQuote: content.contact?.infoCardQuote || "",
        infoCardQuoteAuthor: content.contact?.infoCardQuoteAuthor || "",
        metricLeftVal: content.contact?.metricLeftVal || "",
        metricLeftLabel: content.contact?.metricLeftLabel || "",
        metricRightVal: content.contact?.metricRightVal || "",
        metricRightLabel: content.contact?.metricRightLabel || "",
      });
      setGalleryList([...content.gallery]);
      setShowcaseList([...content.studentShowcase]);
      setLessonsList([...content.lessons]);
      setTestimonialsList([...content.testimonials]);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassphraseStatus({ type: '', message: '' });
    if (!newPassphrase.trim()) {
      setPassphraseStatus({ type: 'error', message: 'Passphrase cannot be empty' });
      return;
    }
    
    setIsChangingPassphrase(true);
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ newPassword: newPassphrase })
      });
      
      const result = await response.json();
      if (response.ok) {
        setPassphraseStatus({ type: 'success', message: result.message || 'Passphrase changed successfully!' });
        setNewPassphrase('');
      } else {
        setPassphraseStatus({ type: 'error', message: result.error || 'Failed to update passphrase' });
      }
    } catch (err: any) {
      setPassphraseStatus({ type: 'error', message: err.message || 'Network error updating passphrase' });
    } finally {
      setIsChangingPassphrase(false);
    }
  };

  // Handle General Site Content Save
  const handlePersistChanges = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const updatedPayload = {
      hero: heroForm,
      about: aboutForm,
      contact: contactForm,
      gallery: galleryList,
      studentShowcase: showcaseList,
      lessons: lessonsList,
      testimonials: testimonialsList,
    };

    const success = await updateContent(updatedPayload);
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      alert('Error: Could not save settings to the server database. Ensure details are correct.');
    }
  };

  // --- ABOUT SECTION Helpers ---
  const handleAboutParagraphChange = (index: number, val: string) => {
    const nextParas = [...aboutForm.paragraphs];
    nextParas[index] = val;
    setAboutForm({ ...aboutForm, paragraphs: nextParas });
  };

  const handleAddAboutParagraph = () => {
    setAboutForm({ ...aboutForm, paragraphs: [...aboutForm.paragraphs, "New academic philosophy paragraph."] });
  };

  const handleRemoveAboutParagraph = (index: number) => {
    const nextParas = aboutForm.paragraphs.filter((_, i) => i !== index);
    setAboutForm({ ...aboutForm, paragraphs: nextParas });
  };

  // --- GALLERY TABLE HELPERS ---
  const handleAddGalleryItem = () => {
    const newItem: Artwork = {
      id: 'art-' + Date.now().toString(36),
      title: 'New Painting Title',
      category: 'charcoal',
      medium: 'Charcoal & Willow on Rag Board',
      dimensions: '18" x 24"',
      year: new Date().getFullYear().toString(),
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800',
      description: 'Describe the texture, perspective study points, or values of the artwork here.',
    };
    setGalleryList([...galleryList, newItem]);
  };

  const handleRemoveGalleryItem = (id: string) => {
    setGalleryList(galleryList.filter(item => item.id !== id));
  };

  const handleUpdateGalleryItem = (id: string, field: keyof Artwork, val: any) => {
    setGalleryList(galleryList.map(item => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  // --- SHOWCASE HELPERS ---
  const handleAddShowcaseItem = () => {
    const newItem: StudentProject = {
      id: 'proj-' + Date.now().toString(36),
      title: 'Dante Bargue Study',
      studentName: 'New Student Name',
      durationInAcademy: '4 Weeks of Training',
      level: 'Beginner',
      medium: 'Academic Graphite H9 on Drawing Rag',
      imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&q=80&w=800',
      description: 'Outline study techniques.',
      teacherMentorshipNotes: 'Explain how you guided this student systematically.',
    };
    setShowcaseList([...showcaseList, newItem]);
  };

  const handleRemoveShowcaseItem = (id: string) => {
    setShowcaseList(showcaseList.filter(item => item.id !== id));
  };

  const handleUpdateShowcaseItem = (id: string, field: keyof StudentProject, val: any) => {
    setShowcaseList(showcaseList.map(item => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  // --- LESSONS HELPERS ---
  const handleAddLessonItem = () => {
    const newItem: Lesson = {
      id: 'lesson-' + Date.now().toString(36),
      title: 'New Master Course',
      level: 'Beginner',
      duration: '8-Week Individual Mentorship',
      price: 350,
      description: 'Detail the course outcomes, targeted visual skills, and structural drawing foundations.',
      curriculum: ['Topic A: Alignments', 'Topic B: Chiaroscuro Blockouts'],
    };
    setLessonsList([...lessonsList, newItem]);
  };

  const handleRemoveLessonItem = (id: string) => {
    setLessonsList(lessonsList.filter(item => item.id !== id));
  };

  const handleUpdateLessonItem = (id: string, field: keyof Lesson, val: any) => {
    setLessonsList(lessonsList.map(item => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  const handleLessonCurriculumChange = (lessonId: string, topicIdx: number, val: string) => {
    setLessonsList(lessonsList.map(item => {
      if (item.id === lessonId) {
        const nextCur = [...item.curriculum];
        nextCur[topicIdx] = val;
        return { ...item, curriculum: nextCur };
      }
      return item;
    }));
  };

  const handleAddLessonCurriculum = (lessonId: string) => {
    setLessonsList(lessonsList.map(item => {
      if (item.id === lessonId) {
        return { ...item, curriculum: [...item.curriculum, "New Curriculum Topic"] };
      }
      return item;
    }));
  };

  const handleRemoveLessonCurriculum = (lessonId: string, topicIdx: number) => {
    setLessonsList(lessonsList.map(item => {
      if (item.id === lessonId) {
        const nextCur = item.curriculum.filter((_, idx) => idx !== topicIdx);
        return { ...item, curriculum: nextCur };
      }
      return item;
    }));
  };

  // --- TESTIMONIALS HELPERS ---
  const handleAddTestimonialItem = () => {
    const newItem: Testimonial = {
      id: 'test-' + Date.now().toString(36),
      studentName: 'New Graduate Student',
      courseTaken: 'classical portraiture',
      reviewText: 'Before working with Sneha, my proportions were off...',
      rating: 5,
      beforeImage: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?auto=format&fit=crop&q=80&w=500',
      afterImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=500',
    };
    setTestimonialsList([...testimonialsList, newItem]);
  };

  const handleRemoveTestimonialItem = (id: string) => {
    setTestimonialsList(testimonialsList.filter(item => item.id !== id));
  };

  const handleUpdateTestimonialItem = (id: string, field: keyof Testimonial, val: any) => {
    setTestimonialsList(testimonialsList.map(item => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  // --- RENDERING FLOW ---

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex flex-col items-center justify-center p-6 text-stone-900 dark:text-stone-150">
        <div className="absolute top-4 left-6">
          <a href="/" className="text-xs font-mono tracking-widest text-wood hover:underline">
            &larr; BACK TO ART STUDIO
          </a>
        </div>

        <div className="w-full max-w-md bg-white dark:bg-stone-900 p-8 rounded-xl border border-stone-250 dark:border-stone-800 shadow-md">
          <div className="text-center space-y-3 mb-8">
            <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 text-wood rounded-full flex items-center justify-center mx-auto border border-wood/20">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <h1 className="font-serif text-2xl font-light tracking-tight">
              Art Director Core
            </h1>
            <p className="text-xs text-stone-500 font-mono tracking-wide uppercase">
              Sneha's Art WordPress-like CMS
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-mono tracking-wider text-stone-500 dark:text-stone-400 uppercase font-semibold">
                ADMINISTRATION SECURITY PASSPHRASE
              </label>
              <input
                type="password"
                required
                placeholder="Enter admin password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-250 dark:border-stone-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all"
              />
              <span className="block text-[10px] text-stone-500 font-sans mt-1 leading-relaxed">
                Default credentials: Enter <code className="bg-stone-150 dark:bg-stone-800 px-1 py-0.5 rounded font-mono font-bold text-wood">sneha_admin_2026</code> or <code className="bg-stone-150 dark:bg-stone-800 px-1 py-0.5 rounded font-mono font-bold text-wood">admin</code>
              </span>
            </div>

            {loginError && (
              <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 py-2 px-3 rounded-md text-left font-sans">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-11 bg-stone-950 hover:bg-stone-900 dark:bg-stone-50 dark:hover:bg-white text-white dark:text-stone-950 font-mono text-xs tracking-widest uppercase rounded-lg transition-all cursor-pointer font-semibold shadow-sm"
            >
              ACCESS DASHBOARD
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-200 font-sans transition-colors duration-300">
      
      {/* CMS Header panel */}
      <header className="sticky top-0 z-40 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-left">
          <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 text-wood flex items-center justify-center border border-wood/10">
            <Settings className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-light flex items-center gap-2">
              Website Command Hub <span className="text-[10px] bg-wood/10 text-wood border border-wood/25 font-mono uppercase px-2 py-0.5 rounded-full font-bold">LIVE CMS</span>
            </h1>
            <p className="text-[10px] font-mono text-stone-400 tracking-wider">
              EDIT THE SNEHA BANSAL ART ACADEMY LANDING
            </p>
          </div>
        </div>

        {/* Global actions: Preview, Save, Logout */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="h-10 px-4 border border-stone-300 hover:border-stone-400 dark:border-stone-700 dark:hover:border-stone-600 text-stone-700 dark:text-stone-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all uppercase tracking-wider font-mono"
          >
            <Eye className="w-4 h-4" />
            <span>PREVIEW SITE</span>
          </a>

          <button
            onClick={handlePersistChanges}
            disabled={isSaving}
            className="h-10 px-5 bg-wood hover:bg-wood/90 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all uppercase tracking-widest font-mono disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-stone-300 border-t-white rounded-full animate-spin" />
                <span>SAVING...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SAVE CHANGES</span>
              </>
            )}
          </button>

          <button
            onClick={logout}
            className="h-10 w-10 text-stone-500 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg flex items-center justify-center transition-all cursor-pointer border border-stone-200 dark:border-stone-800"
            title="Log Out From Panel"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Tabs - Vertical List on Left */}
        <div className="lg:col-span-3 space-y-1.5 text-left">
          <h2 className="text-[10px] font-mono font-bold text-stone-400 tracking-widest uppercase px-3 mb-3">
            CMS MODULES
          </h2>
          {[
            { id: 'hero', label: '✏️ Hero Banner' },
            { id: 'about', label: '✨ Biography & Stats' },
            { id: 'contact', label: '📞 Contact Details' },
            { id: 'gallery', label: '🖼️ Gallery (Artworks)' },
            { id: 'showcase', label: '🎓 Student Showroom' },
            { id: 'lessons', label: '📚 Study Programs' },
            { id: 'testimonials', label: '⭐ Testimonials Review' },
            { id: 'security', label: '🛡️ Security Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full px-4 py-3 text-xs font-semibold tracking-wide rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'bg-stone-900 text-stone-50 dark:bg-white dark:text-stone-950 shadow-md'
                  : 'bg-white hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-850 text-stone-600 dark:text-stone-300 border border-stone-250/50 dark:border-stone-800/80'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {saveSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-xs space-y-1 animate-pulse">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider font-mono text-[10px]">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>SAVED LIVE</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Changes compiled successfully! Edits are now live across all mobile devices, tablets, and computers worldwide.
              </p>
            </div>
          )}
        </div>

        {/* CMS Editor Forms Panel */}
        <div className="lg:col-span-9 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 md:p-8 shadow-sm">
          
          <div className="border-b border-stone-100 dark:border-stone-800 pb-5 mb-8 text-left">
            <h2 className="font-serif text-xl font-light text-stone-900 dark:text-stone-100">
              {activeTab === 'hero' && 'Hero Banner Editor'}
              {activeTab === 'about' && 'Biography & Academy Metrics Editor'}
              {activeTab === 'contact' && 'Contact Form & Studio Address Editor'}
              {activeTab === 'gallery' && 'Fine Art Portfolio Manager'}
              {activeTab === 'showcase' && 'Student Success Showroom'}
              {activeTab === 'lessons' && 'Academic Study Programs & Curriculum'}
              {activeTab === 'testimonials' && 'Before & After Drawing Slider Testimonials'}
              {activeTab === 'security' && 'Security Credits & Admin Passphrase'}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              {activeTab === 'hero' && 'Customize the introductory section, main punchlines, and action buttons.'}
              {activeTab === 'about' && 'Update Sneha\'s teacher bio narrative paragraphs, years of training, and students mentored.'}
              {activeTab === 'contact' && 'Change the direct phone line, email address, physical layout workspace coordinates, metrics, and quotes.'}
              {activeTab === 'gallery' && 'Add, remove, or modify high-fidelity drawings, sizes, mediums, techniques and gallery categories.'}
              {activeTab === 'showcase' && 'Display exemplary artworks made by students under Sneha\'s precise supervision.'}
              {activeTab === 'lessons' && 'Define the actual syllabus, hourly mentoring prices, key subtopics, and difficulty levels.'}
              {activeTab === 'testimonials' && 'Log actual before-and-after progress slider images showing academic student improvement.'}
              {activeTab === 'security' && 'Change the credential passphrase needed to access the Sneha Art Academy dashboard.'}
            </p>
          </div>

          <div className="space-y-8 text-left">
            
            {/* HERO MODULE */}
            {activeTab === 'hero' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Introductory Badge Text</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                      value={heroForm.badgeText}
                      onChange={(e) => setHeroForm({ ...heroForm, badgeText: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Core Heading - Initial Text</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                      value={heroForm.headingTextMain}
                      onChange={(e) => setHeroForm({ ...heroForm, headingTextMain: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Heading - Highlighted Script (Yellow underline)</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                      value={heroForm.headingTextHighlight}
                      onChange={(e) => setHeroForm({ ...heroForm, headingTextHighlight: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Heading - Suffix Continuation Text</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                      value={heroForm.headingTextSuffix}
                      onChange={(e) => setHeroForm({ ...heroForm, headingTextSuffix: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Hero Subheading Description Paragraph</label>
                  <textarea
                    rows={4}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs resize-none"
                    value={heroForm.subheadingText}
                    onChange={(e) => setHeroForm({ ...heroForm, subheadingText: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Primary Action Button Text (Left)</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                      value={heroForm.ctaPrimaryText}
                      onChange={(e) => setHeroForm({ ...heroForm, ctaPrimaryText: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Secondary Action Button Text (Right)</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                      value={heroForm.ctaSecondaryText}
                      onChange={(e) => setHeroForm({ ...heroForm, ctaSecondaryText: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t border-stone-100 dark:border-stone-800 pt-5 mt-4">
                  <h4 className="text-xs font-mono font-bold tracking-wider text-stone-500 uppercase mb-4">Hero Media & Art Signature Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FileUploader
                      label="Teacher Main Photo"
                      placeholder="/assets/sneha_photo.png"
                      value={heroForm.teacherPhotoUrl}
                      adminToken={adminToken}
                      onChange={(url) => setHeroForm({ ...heroForm, teacherPhotoUrl: url })}
                    />
                    <FileUploader
                      label="Secondary Underlay Sketch"
                      placeholder="https://images.unsplash.com/..."
                      value={heroForm.underlayPhotoUrl}
                      adminToken={adminToken}
                      onChange={(url) => setHeroForm({ ...heroForm, underlayPhotoUrl: url })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Signature Quote / Tagline on Portrait</label>
                      <input
                        type="text"
                        placeholder="See, Shaded, Sculpted"
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                        value={heroForm.sigQuote}
                        onChange={(e) => setHeroForm({ ...heroForm, sigQuote: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Signature Subcaption detail</label>
                      <input
                        type="text"
                        placeholder="Traditional Medium, Studio 12"
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                        value={heroForm.sigSub}
                        onChange={(e) => setHeroForm({ ...heroForm, sigSub: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABOUT MODULE */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Bio Badge Accent Info</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                      value={aboutForm.badgeText}
                      onChange={(e) => setAboutForm({ ...aboutForm, badgeText: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Biography Title</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                      value={aboutForm.title}
                      onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Experience Stat (e.g. 8+)</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                      value={aboutForm.experienceYears}
                      onChange={(e) => setAboutForm({ ...aboutForm, experienceYears: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Students Mentored Stat (e.g. 450+)</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                      value={aboutForm.studentsMentored}
                      onChange={(e) => setAboutForm({ ...aboutForm, studentsMentored: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold tracking-wider text-stone-500 uppercase">Narrative Biography Paragraphs</h3>
                    <button
                      type="button"
                      onClick={handleAddAboutParagraph}
                      className="text-xs text-wood font-mono hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Paragraph
                    </button>
                  </div>

                  {aboutForm.paragraphs.map((para, i) => (
                    <div key={i} className="flex gap-3 items-start bg-stone-50 dark:bg-stone-950 p-3 rounded-lg border border-stone-200 dark:border-stone-850">
                      <span className="font-mono text-xs text-stone-400 pt-3 flex-shrink-0">P{i+1}</span>
                      <textarea
                        rows={3}
                        className="flex-grow bg-transparent border-none text-xs focus:ring-0 p-0 resize-none outline-none"
                        value={para}
                        onChange={(e) => handleAboutParagraphChange(i, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAboutParagraph(i)}
                        className="text-stone-400 hover:text-red-500 pt-2 cursor-pointer"
                        title="Remove paragraph block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-100 dark:border-stone-800 pt-5 mt-4 space-y-4">
                  <h4 className="text-xs font-mono font-bold tracking-wider text-stone-500 uppercase">Philosophy Quote & Creator Credentials</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Biography Blockquote Philosophy</label>
                    <textarea
                      rows={3}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs resize-none"
                      value={aboutForm.quote}
                      onChange={(e) => setAboutForm({ ...aboutForm, quote: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FileUploader
                      label="Signature Circle Avatar Photo"
                      placeholder="/assets/sneha_photo.png"
                      value={aboutForm.avatarUrl}
                      adminToken={adminToken}
                      onChange={(url) => setAboutForm({ ...aboutForm, avatarUrl: url })}
                    />
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Author Name</label>
                      <input
                        type="text"
                        placeholder="Sneha Bansal"
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                        value={aboutForm.authorName}
                        onChange={(e) => setAboutForm({ ...aboutForm, authorName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Author Professional Role / Credentials Location</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                      value={aboutForm.authorRole}
                      onChange={(e) => setAboutForm({ ...aboutForm, authorRole: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CONTACT DETAILS MODULE */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Contact Section Badge Text</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                      value={contactForm.badgeText}
                      onChange={(e) => setContactForm({ ...contactForm, badgeText: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Contact Section Title Text</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                      value={contactForm.title}
                      onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Contact Description Text</label>
                  <textarea
                    rows={3}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs resize-none"
                    value={contactForm.description}
                    onChange={(e) => setContactForm({ ...contactForm, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Phone Line Number</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs font-mono"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Director Email Address</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs font-mono"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Workspace Map Location Details / Address</label>
                  <textarea
                    rows={2}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs font-mono resize-none"
                    value={contactForm.address}
                    onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                  />
                </div>

                <div className="border-t border-stone-100 dark:border-stone-800 pt-5 mt-4 space-y-4">
                  <h4 className="text-xs font-mono font-bold tracking-wider text-stone-500 uppercase">Contact Card Info & Quote Details</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Info Card Intro Text</label>
                    <textarea
                      rows={2}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs resize-none"
                      value={contactForm.infoCardText}
                      onChange={(e) => setContactForm({ ...contactForm, infoCardText: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Info Card Blockquote citation</label>
                      <input
                        type="text"
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                        value={contactForm.infoCardQuote}
                        onChange={(e) => setContactForm({ ...contactForm, infoCardQuote: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Info Card Quote Attribution Author</label>
                      <input
                        type="text"
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                        value={contactForm.infoCardQuoteAuthor}
                        onChange={(e) => setContactForm({ ...contactForm, infoCardQuoteAuthor: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="border border-stone-200 dark:border-stone-800 p-4 rounded-xl space-y-3 bg-stone-50/50 dark:bg-stone-950/40">
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block border-b border-stone-200 dark:border-stone-800 pb-1.5">LEFT STATISTIC</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 block uppercase font-bold">VALUE</label>
                          <input
                            type="text"
                            className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded px-2.5 py-1 text-xs font-semibold"
                            value={contactForm.metricLeftVal}
                            onChange={(e) => setContactForm({ ...contactForm, metricLeftVal: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 block uppercase font-bold">LABEL</label>
                          <input
                            type="text"
                            className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded px-2.5 py-1 text-xs"
                            value={contactForm.metricLeftLabel}
                            onChange={(e) => setContactForm({ ...contactForm, metricLeftLabel: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border border-stone-200 dark:border-stone-800 p-4 rounded-xl space-y-3 bg-stone-50/50 dark:bg-stone-950/40">
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block border-b border-stone-200 dark:border-stone-800 pb-1.5">RIGHT STATISTIC</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 block uppercase font-bold">VALUE</label>
                          <input
                            type="text"
                            className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded px-2.5 py-1 text-xs font-semibold"
                            value={contactForm.metricRightVal}
                            onChange={(e) => setContactForm({ ...contactForm, metricRightVal: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-stone-400 block uppercase font-bold">LABEL</label>
                          <input
                            type="text"
                            className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded px-2.5 py-1 text-xs"
                            value={contactForm.metricRightLabel}
                            onChange={(e) => setContactForm({ ...contactForm, metricRightLabel: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GALLERY PORTFOLIO MANAGER */}
            {activeTab === 'gallery' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-850">
                  <h3 className="text-sm font-semibold tracking-wide text-stone-700 dark:text-stone-300">Portfolio Image List ({galleryList.length})</h3>
                  <button
                    type="button"
                    onClick={handleAddGalleryItem}
                    className="px-3.5 py-1.5 bg-stone-950 hover:bg-stone-900 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white text-stone-50 font-mono text-[10px] tracking-wider uppercase rounded-lg flex items-center gap-1 cursor-pointer font-bold shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Artwork
                  </button>
                </div>

                <div className="space-y-6">
                  {galleryList.map((art, idx) => (
                    <div key={art.id} className="bg-stone-50 dark:bg-stone-950 p-5 rounded-xl border border-stone-200 dark:border-stone-800 relative space-y-4">
                      
                      {/* Frame Header - Title & Deletion */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-wood font-extrabold uppercase">ARTWORK #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryItem(art.id)}
                          className="text-xs text-red-500 hover:text-red-600 font-mono flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Artwork
                        </button>
                      </div>

                      {/* Main grid fields */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        
                        {/* Live Image Thumbnail Preview */}
                        <div className="flex flex-col items-center justify-center p-3 border border-dashed border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-lg max-h-56">
                          {art.imageUrl ? (
                            <img
                              src={art.imageUrl}
                              alt={art.title}
                              className="max-h-36 max-w-full rounded object-contain shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Image className="w-8 h-8 text-stone-300" />
                          )}
                          <div className="w-full mt-3">
                            <FileUploader
                              value={art.imageUrl}
                              adminToken={adminToken}
                              onChange={(url) => handleUpdateGalleryItem(art.id, 'imageUrl', url)}
                              placeholder="https://images.unsplash.com/..."
                            />
                          </div>
                        </div>

                        {/* Fields: Title, Category, Year, Size, Medium */}
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-stone-400 block uppercase">Drawing Title</span>
                            <input
                              type="text"
                              className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded px-3 py-1.5 text-xs font-semibold"
                              value={art.title}
                              onChange={(e) => handleUpdateGalleryItem(art.id, 'title', e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-stone-400 block uppercase">Art Category</span>
                            <select
                              className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded px-3 py-1.5 text-xs cursor-pointer"
                              value={art.category}
                              onChange={(e) => handleUpdateGalleryItem(art.id, 'category', e.target.value as ArtCategory)}
                            >
                              <option value="charcoal">Charcoal Drawing</option>
                              <option value="graphite">Academic Graphite</option>
                              <option value="ink">Ink & Wash studies</option>
                              <option value="pastel">Earth Pastels</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-stone-400 block uppercase">Drawing Medium detailing</span>
                            <input
                              type="text"
                              className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded px-3 py-1.5 text-xs"
                              placeholder="e.g. Compressed charcoal rods, raw vine on paper..."
                              value={art.medium}
                              onChange={(e) => handleUpdateGalleryItem(art.id, 'medium', e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-stone-400 block uppercase">Canvas Dimensions</span>
                              <input
                                type="text"
                                className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded px-3 py-1.5 text-xs"
                                placeholder='18" x 24"'
                                value={art.dimensions}
                                onChange={(e) => handleUpdateGalleryItem(art.id, 'dimensions', e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-stone-400 block uppercase">Year Made</span>
                              <input
                                type="text"
                                className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded px-3 py-1.5 text-xs"
                                value={art.year}
                                onChange={(e) => handleUpdateGalleryItem(art.id, 'year', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Description Field */}
                      <div className="space-y-1.5 text-left">
                        <span className="text-[10px] font-mono text-stone-400 block uppercase font-bold">Artistic Technique Description / Lesson Summary</span>
                        <textarea
                          rows={3}
                          placeholder="Describe the depth, light direction alignments, or edge treatment used to let students copies copy this technique..."
                          className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg p-3 text-xs resize-none"
                          value={art.description}
                          onChange={(e) => handleUpdateGalleryItem(art.id, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STUDENT SHOWCASE */}
            {activeTab === 'showcase' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-850">
                  <h3 className="text-sm font-semibold tracking-wide text-stone-700 dark:text-stone-300">Showcase Student list ({showcaseList.length})</h3>
                  <button
                    type="button"
                    onClick={handleAddShowcaseItem}
                    className="px-3.5 py-1.5 bg-stone-950 hover:bg-stone-900 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white text-stone-50 font-mono text-[10px] tracking-wider uppercase rounded-lg flex items-center gap-1 cursor-pointer font-bold shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Student Project
                  </button>
                </div>

                <div className="space-y-6">
                  {showcaseList.map((proj, idx) => (
                    <div key={proj.id} className="bg-stone-50 dark:bg-stone-950 p-5 rounded-xl border border-stone-200 dark:border-stone-800 relative space-y-4">
                      
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-wood font-extrabold uppercase">GRADUATE STUDY #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveShowcaseItem(proj.id)}
                          className="text-xs text-red-500 hover:text-red-600 font-mono flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove Student Study
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        
                        {/* Live Image Thumbnail Preview */}
                        <div className="flex flex-col items-center justify-center p-3 border border-dashed border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-lg max-h-56">
                          {proj.imageUrl ? (
                            <img
                              src={proj.imageUrl}
                              alt={proj.title}
                              className="max-h-36 max-w-full rounded object-contain shadow-sm"
                            />
                          ) : (
                            <Image className="w-8 h-8 text-stone-300" />
                          )}
                          <div className="w-full mt-3">
                            <FileUploader
                              value={proj.imageUrl}
                              adminToken={adminToken}
                              onChange={(url) => handleUpdateShowcaseItem(proj.id, 'imageUrl', url)}
                              placeholder="/assets/student_study.jpg"
                            />
                          </div>
                        </div>

                        {/* Fields */}
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-stone-400 block uppercase">Project Title (e.g. David plaster study)</span>
                            <input
                              type="text"
                              className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded px-3 py-1.5 text-xs font-semibold"
                              value={proj.title}
                              onChange={(e) => handleUpdateShowcaseItem(proj.id, 'title', e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-stone-400 block uppercase">Student Name</span>
                            <input
                              type="text"
                              className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded px-3 py-1.5 text-xs"
                              value={proj.studentName}
                              onChange={(e) => handleUpdateShowcaseItem(proj.id, 'studentName', e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-stone-400 block uppercase">Training Course Horizon (e.g. 6 Weeks)</span>
                            <input
                              type="text"
                              className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded px-3 py-1.5 text-xs"
                              value={proj.durationInAcademy}
                              onChange={(e) => handleUpdateShowcaseItem(proj.id, 'durationInAcademy', e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-stone-400 block uppercase">Experience Level</span>
                              <select
                                className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded px-3 py-1.5 text-xs cursor-pointer"
                                value={proj.level}
                                onChange={(e) => handleUpdateShowcaseItem(proj.id, 'level', e.target.value as LessonLevel)}
                              >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-stone-400 block uppercase">Medium Details</span>
                              <input
                                type="text"
                                className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded px-3 py-1.5 text-xs"
                                placeholder="Graphite on board"
                                value={proj.medium}
                                onChange={(e) => handleUpdateShowcaseItem(proj.id, 'medium', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Notes fields */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-stone-404 uppercase font-bold text-stone-500">Project description</span>
                          <textarea
                            rows={2}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg p-3 text-xs resize-none"
                            value={proj.description}
                            onChange={(e) => handleUpdateShowcaseItem(proj.id, 'description', e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-stone-404 uppercase font-bold text-wood">Teacher Mentorship Critique Notes</span>
                          <textarea
                            rows={3}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-wood/30 focus:border-wood rounded-lg p-3 text-xs resize-none"
                            value={proj.teacherMentorshipNotes}
                            onChange={(e) => handleUpdateShowcaseItem(proj.id, 'teacherMentorshipNotes', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LESSONS EXPLAINER */}
            {activeTab === 'lessons' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-850">
                  <h3 className="text-sm font-semibold tracking-wide text-stone-700 dark:text-stone-300">Course Syllabus Classes ({lessonsList.length})</h3>
                  <button
                    type="button"
                    onClick={handleAddLessonItem}
                    className="px-3.5 py-1.5 bg-stone-950 hover:bg-stone-900 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white text-stone-50 font-mono text-[10px] tracking-wider uppercase rounded-lg flex items-center gap-1 cursor-pointer font-bold shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create New Course
                  </button>
                </div>

                <div className="space-y-6">
                  {lessonsList.map((lesson, idx) => (
                    <div key={lesson.id} className="bg-stone-50 dark:bg-stone-950 p-5 rounded-xl border border-stone-200 dark:border-stone-800 relative space-y-4">
                      
                      <div className="flex items-center justify-between animate-pulse">
                        <span className="font-mono text-[10px] text-wood font-extrabold uppercase">COURSE STUDY MODULE #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLessonItem(lesson.id)}
                          className="text-xs text-red-500 hover:text-red-650 font-mono flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Syllabus
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 space-y-1">
                          <span className="text-[10px] font-mono text-stone-400 block uppercase font-bold">Course Title Name</span>
                          <input
                            type="text"
                            className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs font-semibold"
                            value={lesson.title}
                            onChange={(e) => handleUpdateLessonItem(lesson.id, 'title', e.target.value)}
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-stone-400 block uppercase font-bold">Target Skill Level</span>
                          <select
                            className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs cursor-pointer"
                            value={lesson.level}
                            onChange={(e) => handleUpdateLessonItem(lesson.id, 'level', e.target.value as LessonLevel)}
                          >
                            <option value="Beginner">Beginner Skills</option>
                            <option value="Intermediate">Intermediate Mastery</option>
                            <option value="Advanced">Advanced Mastery</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-stone-400 block uppercase font-bold">Hourly/Module Fee ($ USD)</span>
                          <input
                            type="number"
                            className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs font-mono"
                            value={lesson.price}
                            onChange={(e) => handleUpdateLessonItem(lesson.id, 'price', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2 space-y-1.5">
                          <span className="text-[10px] font-mono text-stone-400 block uppercase">Mentoring Plan Horizon (e.g. 12-Week Private Course)</span>
                          <input
                            type="text"
                            className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs"
                            value={lesson.duration}
                            onChange={(e) => handleUpdateLessonItem(lesson.id, 'duration', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-stone-400 block uppercase">Course Curriculum Focus</span>
                          <span className="text-[11px] font-sans text-stone-400 leading-none italic block pt-2">Define exact syllabus below.</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <span className="text-[10px] font-mono text-stone-400 block uppercase">Course Outline Synopsis</span>
                        <textarea
                          rows={3}
                          className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg p-3 text-xs resize-none"
                          value={lesson.description}
                          onChange={(e) => handleUpdateLessonItem(lesson.id, 'description', e.target.value)}
                        />
                      </div>

                      {/* Curriculum items list */}
                      <div className="space-y-3 bg-white dark:bg-stone-900/60 p-4 rounded-lg border border-stone-200/50 dark:border-stone-850">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">Syllabus Curriculum Bullet points</span>
                          <button
                            type="button"
                            onClick={() => handleAddLessonCurriculum(lesson.id)}
                            className="text-xs text-wood font-mono flex items-center gap-1 cursor-pointer hover:underline"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Syllabus Point
                          </button>
                        </div>

                        <div className="space-y-2">
                          {lesson.curriculum.map((topic, curIdx) => (
                            <div key={curIdx} className="flex items-center gap-2">
                              <span className="text-xs font-mono text-stone-400">#{curIdx + 1}</span>
                              <input
                                type="text"
                                className="flex-grow bg-stone-50 dark:bg-stone-950 border border-stone-250 dark:border-stone-850 rounded px-2.5 py-1 text-xs"
                                value={topic}
                                onChange={(e) => handleLessonCurriculumChange(lesson.id, curIdx, e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveLessonCurriculum(lesson.id, curIdx)}
                                className="text-stone-400 hover:text-red-500 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TESTIMONIALS (BEFORE & AFTER SLIDER) */}
            {activeTab === 'testimonials' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-850">
                  <h3 className="text-sm font-semibold tracking-wide text-stone-700 dark:text-stone-300">Growth Stories / Reviews list ({testimonialsList.length})</h3>
                  <button
                    type="button"
                    onClick={handleAddTestimonialItem}
                    className="px-3.5 py-1.5 bg-stone-950 hover:bg-stone-900 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white text-stone-50 font-mono text-[10px] tracking-wider uppercase rounded-lg flex items-center gap-1 cursor-pointer font-bold shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create Testimonial Card
                  </button>
                </div>

                <div className="space-y-6">
                  {testimonialsList.map((test, idx) => (
                    <div key={test.id} className="bg-stone-50 dark:bg-stone-950 p-5 rounded-xl border border-stone-200 dark:border-stone-800 relative space-y-4">
                      
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-wood font-extrabold uppercase font-bold">STUDENT PROGRESS CARD #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTestimonialItem(test.id)}
                          className="text-xs text-red-500 hover:text-red-650 font-mono flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Testimonial
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-stone-400 block uppercase">Student Name Graduate</span>
                            <input
                              type="text"
                              className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs font-semibold"
                              value={test.studentName}
                              onChange={(e) => handleUpdateTestimonialItem(test.id, 'studentName', e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-stone-400 block uppercase">Mentorship Syllabus Selected</span>
                            <input
                              type="text"
                              className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs"
                              value={test.courseTaken}
                              onChange={(e) => handleUpdateTestimonialItem(test.id, 'courseTaken', e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-stone-400 block uppercase">Rating Core scale (1-5)</span>
                            <input
                              type="number"
                              min={1}
                              max={5}
                              className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs font-mono"
                              value={test.rating}
                              onChange={(e) => handleUpdateTestimonialItem(test.id, 'rating', parseInt(e.target.value) || 5)}
                            />
                          </div>
                        </div>

                        {/* Shifting Images links */}
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-stone-400 block uppercase font-bold text-red-500">Practice Beginning drawing (Before Photo URL)</span>
                            <input
                              type="text"
                              className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-[10px] font-mono"
                              placeholder="https://..."
                              value={test.beforeImage}
                              onChange={(e) => handleUpdateTestimonialItem(test.id, 'beforeImage', e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-stone-400 block uppercase font-bold text-emerald-500">Graduation drawing (After Photo URL)</span>
                            <input
                              type="text"
                              className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-[10px] font-mono"
                              value={test.afterImage}
                              onChange={(e) => handleUpdateTestimonialItem(test.id, 'afterImage', e.target.value)}
                            />
                          </div>

                          {/* Minimal Slider Visual feedback */}
                          <div className="p-3 border border-dashed border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-905 rounded-xl flex items-center justify-center gap-4 text-xs font-mono text-stone-400 text-[10px]">
                            <span>Before</span>
                            <div className="flex-grow h-1.5 bg-stone-200 dark:bg-stone-800 rounded relative">
                              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-wood border border-white" />
                            </div>
                            <span>After</span>
                          </div>
                        </div>

                      </div>

                      <div className="space-y-1.5 text-left">
                        <span className="text-[10px] font-mono text-stone-404 block uppercase font-bold">Student review Narrative Text</span>
                        <textarea
                          rows={3}
                          className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-805 rounded-lg p-3 text-xs resize-none"
                          value={test.reviewText}
                          onChange={(e) => handleUpdateTestimonialItem(test.id, 'reviewText', e.target.value)}
                        />
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* SECURITY MODULE */}
            {activeTab === 'security' && (
              <div className="space-y-6 max-w-xl">
                <form onSubmit={handlePasswordChangeSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase block font-bold">
                      New Administrator Passphrase
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new administrator password"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs focus:outline-none focus:border-wood focus:ring-1 focus:ring-wood transition-all"
                      value={newPassphrase}
                      onChange={(e) => setNewPassphrase(e.target.value)}
                    />
                    <p className="text-[10px] text-stone-400 italic font-sans leading-relaxed">
                      Updating this passphrase dynamically resets the administrator credential stored on this server. This will instantly change what password is required on the login prompt.
                    </p>
                  </div>

                  {passphraseStatus.message && (
                    <div className={`p-4 rounded-lg text-xs font-mono border ${
                      passphraseStatus.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                    }`}>
                      {passphraseStatus.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isChangingPassphrase}
                    className="px-5 py-2.5 bg-wood hover:bg-wood/90 text-white font-mono text-xs tracking-widest uppercase rounded-lg transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-bold disabled:opacity-50"
                  >
                    {isChangingPassphrase ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-stone-300 border-t-white rounded-full animate-spin" />
                        <span>UPDATING PASSPHRASE...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>UPDATE PASSPHRASE</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Bottom Save Trigger action */}
            {activeTab !== 'security' && (
              <div className="border-t border-stone-100 dark:border-stone-800 pt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handlePersistChanges}
                  disabled={isSaving}
                  className="px-6 py-3 bg-wood hover:bg-wood/90 text-white font-mono text-xs tracking-widest uppercase rounded-lg transition-all duration-300 shadow-md flex items-center gap-1.5 cursor-pointer font-bold disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4.5 h-4.5 border-2 border-stone-300 border-t-white rounded-full animate-spin" />
                      <span>SAVING ALL CMS MODULES...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>SAVE CMS CHUB</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
