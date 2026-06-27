import React, { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext';
import defaultContent from '../data/site_content.json';
import ThemeToggle from './ThemeToggle';
import { 
  Settings, LogOut, Check, Save, Plus, Trash2, Edit3, Image, 
  HelpCircle, Sparkles, BookOpen, User, Phone, Mail, MapPin, Star, Eye, Upload,
  RefreshCw, AlertCircle, Copy, Search, Award, BarChart3
} from 'lucide-react';
import { Artwork, Lesson, Testimonial, StudentProject, ArtCategory, LessonLevel } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

interface FileUploaderProps {
  value: string;
  onChange: (url: string) => void;
  adminToken: string | null;
  label?: string;
  placeholder?: string;
  onUploaded?: (url: string) => void;
}

function FileUploader({ value, onChange, adminToken, label, placeholder, onUploaded }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);
    console.log(`[CLIENT-UPLOAD-DIAGNOSTIC] Initiating file input process for: "${file.name}" | Size: ${fileSizeMb} MB | Type: ${file.type}`);

    if (file.size > 15 * 1024 * 1024) {
      const sizeErr = `File is too large (${fileSizeMb} MB). Maximum allowed size is 15.00 MB.`;
      console.warn(`[CLIENT-UPLOAD-DIAGNOSTIC] ⚠️ Validation failed: ${sizeErr}`);
      setError(sizeErr);
      return;
    }

    setUploading(true);
    setError('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        console.log(`[CLIENT-UPLOAD-DIAGNOSTIC] Reading file completed. Transmitting Base64 payload to ${API_BASE_URL}/api/upload...`);
        const response = await fetch(`${API_BASE_URL}/api/upload`, {
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
          console.log(`[CLIENT-UPLOAD-DIAGNOSTIC] ✅ SUCCESS: Upload resolved to public URL:`, data.url);
          onChange(data.url);
          if (onUploaded) {
            onUploaded(data.url);
          }
        } else {
          const apiErr = data.error || 'Server rejected the file package without a specified message.';
          const detailStr = data.details ? ` (${data.details})` : '';
          const joinedError = `${apiErr}${detailStr}`;
          console.error(`[CLIENT-UPLOAD-DIAGNOSTIC] ❌ SERVER REJECTION (Status: ${response.status}):`, joinedError);
          setError(`Upload unsuccessful: ${joinedError}`);
        }
      } catch (err: any) {
        console.error('[CLIENT-UPLOAD-DIAGNOSTIC] ❌ HTTP DISRUPTED / SERVICE TIMEOUT:', err);
        setError(`Connection failure: ${err?.message || 'Check terminal server logs for specific database synchronization exceptions.'}`);
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
          className="flex-1 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs font-mono select-all transition-all duration-300 focus:ring-1 focus:ring-wood disabled:opacity-50"
          placeholder={placeholder || "https://... or choose file on right"}
          value={value}
          disabled={uploading}
          onChange={(e) => onChange(e.target.value)}
        />
        <label className={`relative shrink-0 flex items-center justify-center px-4 rounded-lg cursor-pointer text-xs transition duration-150 select-none border ${
          uploading
            ? 'bg-stone-100 dark:bg-stone-900 border-stone-300 dark:border-stone-800 text-stone-400'
            : 'bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-350 hover:text-stone-900 border-stone-300 dark:border-stone-700'
        }`}>
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
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-2.5 rounded-lg text-[11px] font-mono leading-relaxed mt-1 block">
          <b>⚠️ UPLOAD REJECTED:</b> {error}
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const { content, login, logout, isAdmin, updateContent, adminToken } = useContent();
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab ] = useState<'hero' | 'about' | 'achievements' | 'contact' | 'gallery' | 'showcase' | 'lessons' | 'testimonials' | 'security' | 'media' | 'subscribers' | 'analytics'>('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>(content.uploadedImages || []);
  const [mediaUploadUrl, setMediaUploadUrl] = useState('');
  const [selectedReplacerUrl, setSelectedReplacerUrl] = useState('');
  const [replacerTarget, setReplacerTarget] = useState('hero-teacher');
  const [replaceNotice, setReplaceNotice] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' });

  // Newsletter Subscribers CMS States
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [subSearch, setSubSearch] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);

  useEffect(() => {
    if (activeTab === 'subscribers') {
      const stored = localStorage.getItem('sneha_newsletter_subscribers');
      if (stored) {
        setSubscribers(JSON.parse(stored));
      } else {
        const demo = [
          'clara.ross@academy-classical.com',
          'rahul.kapoor@fine-art-forum.org',
          'sneha_student_2026@gmail.com',
          'parent_mentor@yahoo.co.in'
        ];
        localStorage.setItem('sneha_newsletter_subscribers', JSON.stringify(demo));
        setSubscribers(demo);
      }
    }
  }, [activeTab]);

  const handleDeleteSubscriber = (emailToDelete: string) => {
    const updated = subscribers.filter(email => email !== emailToDelete);
    localStorage.setItem('sneha_newsletter_subscribers', JSON.stringify(updated));
    setSubscribers(updated);
  };

  const handleClearAllSubscribers = () => {
    if (window.confirm('Are you sure you want to permanently clear all newsletter subscribers? This cannot be undone.')) {
      localStorage.setItem('sneha_newsletter_subscribers', JSON.stringify([]));
      setSubscribers([]);
    }
  };

  const handleCopySubscribers = () => {
    if (subscribers.length === 0) return;
    navigator.clipboard.writeText(subscribers.join(', '));
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 3000);
  };

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
    profilePhrase: content.hero.profilePhrase || '',
    ctaPrimaryLink: content.hero.ctaPrimaryLink || '',
    ctaSecondaryLink: content.hero.ctaSecondaryLink || '',
  });

  const [socialsForm, setSocialsForm] = useState({
    instagram: content.socials?.instagram || defaultContent.socials?.instagram || '',
    youtube: content.socials?.youtube || defaultContent.socials?.youtube || '',
    facebook: content.socials?.facebook || defaultContent.socials?.facebook || '',
    linkedin: content.socials?.linkedin || defaultContent.socials?.linkedin || '',
    mail: content.socials?.mail || defaultContent.socials?.mail || '',
    phone: content.socials?.phone || defaultContent.socials?.phone || '',
    whatsapp: content.socials?.whatsapp || defaultContent.socials?.whatsapp || '',
  });

  const [globalButtonsForm, setGlobalButtonsForm] = useState({
    navbarContactLink: content.globalButtons?.navbarContactLink || '',
    lessonsInquireLink: content.globalButtons?.lessonsInquireLink || '',
    showcaseExploreLink: content.globalButtons?.showcaseExploreLink || '',
    showcaseExploreText: content.globalButtons?.showcaseExploreText || '',
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

  const [achievementsForm, setAchievementsForm] = useState({
    badgeText: content.achievements?.badgeText || defaultContent.achievements?.badgeText || '',
    title: content.achievements?.title || defaultContent.achievements?.title || '',
    paragraphs: content.achievements?.paragraphs || defaultContent.achievements?.paragraphs || [],
    metricLeftLabel: content.achievements?.metricLeftLabel || defaultContent.achievements?.metricLeftLabel || '',
    metricLeftVal: content.achievements?.metricLeftVal || defaultContent.achievements?.metricLeftVal || '',
    metricLeftSub: content.achievements?.metricLeftSub || defaultContent.achievements?.metricLeftSub || '',
    metricLeftBackText: content.achievements?.metricLeftBackText || defaultContent.achievements?.metricLeftBackText || '',
    metricRightLabel: content.achievements?.metricRightLabel || defaultContent.achievements?.metricRightLabel || '',
    metricRightVal: content.achievements?.metricRightVal || defaultContent.achievements?.metricRightVal || '',
    metricRightSub: content.achievements?.metricRightSub || defaultContent.achievements?.metricRightSub || '',
    metricRightBackText: content.achievements?.metricRightBackText || defaultContent.achievements?.metricRightBackText || '',
    recipientName: content.achievements?.recipientName || defaultContent.achievements?.recipientName || '',
    summaryText: content.achievements?.summaryText || defaultContent.achievements?.summaryText || '',
  });

  const [achievementsCardsList, setAchievementsCardsList] = useState<any[]>(
    content.achievements?.cards || defaultContent.achievements?.cards || []
  );

  const [galleryList, setGalleryList] = useState<Artwork[]>([...content.gallery]);
  const [showcaseList, setShowcaseList] = useState<StudentProject[]>([...content.studentShowcase]);
  const [lessonsList, setLessonsList] = useState<Lesson[]>([...content.lessons]);
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([...content.testimonials]);

  const [coursesAndWorkshopsForm, setCoursesAndWorkshopsForm] = useState({
    badgeText: content.coursesAndWorkshops?.badgeText || (defaultContent as any).coursesAndWorkshops?.badgeText || '',
    title: content.coursesAndWorkshops?.title || (defaultContent as any).coursesAndWorkshops?.title || '',
    description: content.coursesAndWorkshops?.description || (defaultContent as any).coursesAndWorkshops?.description || '',
  });

  const [coursesAndWorkshopsList, setCoursesAndWorkshopsList] = useState<any[]>(
    content.coursesAndWorkshops?.items || (defaultContent as any).coursesAndWorkshops?.items || []
  );

  // Dynamically synchronize local form states with fetched content configurations
  useEffect(() => {
    if (content) {
      setHeroForm({
        badgeText: content.hero?.badgeText || '',
        headingTextMain: content.hero?.headingTextMain || '',
        headingTextHighlight: content.hero?.headingTextHighlight || '',
        headingTextSuffix: content.hero?.headingTextSuffix || '',
        subheadingText: content.hero?.subheadingText || '',
        ctaPrimaryText: content.hero?.ctaPrimaryText || '',
        ctaSecondaryText: content.hero?.ctaSecondaryText || '',
        teacherPhotoUrl: content.hero?.teacherPhotoUrl || '',
        underlayPhotoUrl: content.hero?.underlayPhotoUrl || '',
        sigQuote: content.hero?.sigQuote || '',
        sigSub: content.hero?.sigSub || '',
        profilePhrase: content.hero?.profilePhrase || '',
        ctaPrimaryLink: content.hero?.ctaPrimaryLink || '',
        ctaSecondaryLink: content.hero?.ctaSecondaryLink || '',
      });
      setSocialsForm({
        instagram: content.socials?.instagram || defaultContent.socials?.instagram || '',
        youtube: content.socials?.youtube || defaultContent.socials?.youtube || '',
        facebook: content.socials?.facebook || defaultContent.socials?.facebook || '',
        linkedin: content.socials?.linkedin || defaultContent.socials?.linkedin || '',
        mail: content.socials?.mail || defaultContent.socials?.mail || '',
        phone: content.socials?.phone || defaultContent.socials?.phone || '',
        whatsapp: content.socials?.whatsapp || defaultContent.socials?.whatsapp || '',
      });
      setGlobalButtonsForm({
        navbarContactLink: content.globalButtons?.navbarContactLink || '',
        lessonsInquireLink: content.globalButtons?.lessonsInquireLink || '',
        showcaseExploreLink: content.globalButtons?.showcaseExploreLink || '',
        showcaseExploreText: content.globalButtons?.showcaseExploreText || '',
      });
      setAboutForm({
        badgeText: content.about?.badgeText || '',
        title: content.about?.title || '',
        paragraphs: content.about?.paragraphs || [],
        experienceYears: content.about?.experienceYears || '',
        studentsMentored: content.about?.studentsMentored || '',
        quote: content.about?.quote || '',
        avatarUrl: content.about?.avatarUrl || '',
        authorName: content.about?.authorName || '',
        authorRole: content.about?.authorRole || '',
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
      setAchievementsForm({
        badgeText: content.achievements?.badgeText || defaultContent.achievements?.badgeText || '',
        title: content.achievements?.title || defaultContent.achievements?.title || '',
        paragraphs: content.achievements?.paragraphs || defaultContent.achievements?.paragraphs || [],
        metricLeftLabel: content.achievements?.metricLeftLabel || defaultContent.achievements?.metricLeftLabel || '',
        metricLeftVal: content.achievements?.metricLeftVal || defaultContent.achievements?.metricLeftVal || '',
        metricLeftSub: content.achievements?.metricLeftSub || defaultContent.achievements?.metricLeftSub || '',
        metricLeftBackText: content.achievements?.metricLeftBackText || defaultContent.achievements?.metricLeftBackText || '',
        metricRightLabel: content.achievements?.metricRightLabel || defaultContent.achievements?.metricRightLabel || '',
        metricRightVal: content.achievements?.metricRightVal || defaultContent.achievements?.metricRightVal || '',
        metricRightSub: content.achievements?.metricRightSub || defaultContent.achievements?.metricRightSub || '',
        metricRightBackText: content.achievements?.metricRightBackText || defaultContent.achievements?.metricRightBackText || '',
        recipientName: content.achievements?.recipientName || defaultContent.achievements?.recipientName || '',
        summaryText: content.achievements?.summaryText || defaultContent.achievements?.summaryText || '',
      });
      setAchievementsCardsList(
        content.achievements?.cards ? [...content.achievements?.cards] : (defaultContent.achievements?.cards ? [...defaultContent.achievements?.cards] : [])
      );
      setGalleryList(content.gallery ? [...content.gallery] : []);
      setShowcaseList(content.studentShowcase ? [...content.studentShowcase] : []);
      setLessonsList(content.lessons ? [...content.lessons] : []);
      setTestimonialsList(content.testimonials ? [...content.testimonials] : []);
      setUploadedImages(content.uploadedImages || []);
      setCoursesAndWorkshopsForm({
        badgeText: content.coursesAndWorkshops?.badgeText || (defaultContent as any).coursesAndWorkshops?.badgeText || '',
        title: content.coursesAndWorkshops?.title || (defaultContent as any).coursesAndWorkshops?.title || '',
        description: content.coursesAndWorkshops?.description || (defaultContent as any).coursesAndWorkshops?.description || '',
      });
      setCoursesAndWorkshopsList(
        content.coursesAndWorkshops?.items ? [...content.coursesAndWorkshops.items] : ((defaultContent as any).coursesAndWorkshops?.items ? [...(defaultContent as any).coursesAndWorkshops.items] : [])
      );
    }
  }, [content]);

  // Supabase diagnostics status state
  const [supabaseStatusDoc, setSupabaseStatusDoc] = useState<{
    configured: boolean;
    initialized: boolean;
    databaseOk: boolean;
    storageOk: boolean;
    dbError: string | null;
    storageError: string | null;
    bucketUsed: string;
    envCheck?: {
      hasUrl: boolean;
      urlLength: number;
      hasAnonKey: boolean;
      hasServiceKey: boolean;
    }
  } | null>(null);
  const [loadingSupabaseStatus, setLoadingSupabaseStatus] = useState(false);

  // Supabase Interactive self-test verification diagnostics
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [supabaseTestMessage, setSupabaseTestMessage] = useState<string | null>(null);
  const [supabaseTestDetails, setSupabaseTestDetails] = useState<string | null>(null);

  const runSupabaseVerificationTest = async () => {
    setSupabaseTestStatus('testing');
    setSupabaseTestMessage('Executing live write/read/delete self-test loops on cloud storage...');
    setSupabaseTestDetails(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/supabase-test-write`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSupabaseTestStatus('success');
        setSupabaseTestMessage(data.message || 'Verification complete!');
        setSupabaseTestDetails(`Bucket Destination: "${data.bucket}"\nSelf-test Filename: "${data.filename}"\nResolved Public CDN Link: ${data.resolvedUrl}\nStorage Cleanup Deletion: ${data.cleanup}`);
        // Refresh passive diagnostics status too!
        fetchSupabaseStatus();
      } else {
        setSupabaseTestStatus('error');
        setSupabaseTestMessage(data.error || 'Live connection verification test failed.');
        setSupabaseTestDetails(data.details ? JSON.stringify(data.details, null, 2) : `Phase failure detail: ${data.phase || 'unknown_error'}`);
      }
    } catch (err: any) {
      setSupabaseTestStatus('error');
      setSupabaseTestMessage(err.message || 'An operational or network exception occurred.');
      setSupabaseTestDetails(String(err));
    }
  };

  const fetchSupabaseStatus = async () => {
    setLoadingSupabaseStatus(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/supabase-status`);
      if (response.ok) {
        const data = await response.json();
        setSupabaseStatusDoc(data);
      }
    } catch (err) {
      console.error("Could not fetch Supabase status:", err);
    } finally {
      setLoadingSupabaseStatus(false);
    }
  };

  useEffect(() => {
    if (isAdmin && (activeTab === 'security' || activeTab === 'media' || activeTab === 'hero')) {
      fetchSupabaseStatus();
    }
  }, [isAdmin, activeTab]);

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
      setUploadedImages(content.uploadedImages || []);
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
      const response = await fetch(`${API_BASE_URL}/api/admin/change-password`, {
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
    setSaveError('');

    const updatedPayload = {
      hero: heroForm,
      about: aboutForm,
      contact: contactForm,
      socials: socialsForm,
      globalButtons: globalButtonsForm,
      gallery: galleryList,
      studentShowcase: showcaseList,
      lessons: lessonsList,
      testimonials: testimonialsList,
      uploadedImages: uploadedImages,
      achievements: {
        ...achievementsForm,
        cards: achievementsCardsList,
      },
      coursesAndWorkshops: {
        ...coursesAndWorkshopsForm,
        items: coursesAndWorkshopsList,
      },
    };

    console.log(`[CLIENT-SAVE-DIAGNOSTIC] preparing to save content payload copy...`, {
      heroKeys: Object.keys(heroForm),
      galleryCount: galleryList.length,
      studentShowcaseCount: showcaseList.length,
      lessonsCount: lessonsList.length,
      uploadedCount: uploadedImages.length
    });

    try {
      const result = await updateContent(updatedPayload);
      setIsSaving(false);
      if (result.success) {
        console.log(`[CLIENT-SAVE-DIAGNOSTIC] ✅ Save completed and ACKed by Express backend!`);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        const errorString = result.error || 'Server rejected save configuration without detailing the cause.';
        console.error(`[CLIENT-SAVE-DIAGNOSTIC] ❌ Save configurations database write failed:`, errorString);
        setSaveError(errorString);
        alert(`Error saving configurations: ${errorString}`);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Check network connection or server status telemetry.';
      console.error(`[CLIENT-SAVE-DIAGNOSTIC] ❌ HTTP Exception in save operation:`, err);
      setSaveError(errorMsg);
      setIsSaving(false);
      alert(`Error saving configurations: ${errorMsg}`);
    }
  };

  const handleNewUploadRecord = (url: string) => {
    setUploadedImages((prev) => {
      if (prev.includes(url)) return prev;
      return [...prev, url];
    });
  };

  const handleRemoveLibraryImage = (url: string) => {
    setUploadedImages((prev) => prev.filter((img) => img !== url));
    if (selectedReplacerUrl === url) {
      setSelectedReplacerUrl('');
    }
  };

  const handleApplyReplacement = () => {
    setReplaceNotice({ type: '', message: '' });
    if (!selectedReplacerUrl) {
      setReplaceNotice({ type: 'error', message: 'Please select an image from the library grid or provide a valid raw URL first.' });
      return;
    }

    if (!replacerTarget) {
      setReplaceNotice({ type: 'error', message: 'Please select a target portfolio section layout option to replace.' });
      return;
    }

    let updatedSectionName = '';

    if (replacerTarget === 'hero-teacher') {
      setHeroForm((prev) => ({ ...prev, teacherPhotoUrl: selectedReplacerUrl }));
      updatedSectionName = 'Intro: Teacher Main Portrait';
    } else if (replacerTarget === 'hero-underlay') {
      setHeroForm((prev) => ({ ...prev, underlayPhotoUrl: selectedReplacerUrl }));
      updatedSectionName = 'Intro: Secondary Underlay Sketch';
    } else if (replacerTarget === 'about-avatar') {
      setAboutForm((prev) => ({ ...prev, avatarUrl: selectedReplacerUrl }));
      updatedSectionName = 'Biography: Creator Circle Avatar';
    } else if (replacerTarget.startsWith('gallery-')) {
      const artId = replacerTarget.replace('gallery-', '');
      handleUpdateGalleryItem(artId, 'imageUrl', selectedReplacerUrl);
      updatedSectionName = 'Gallery Artwork';
    } else if (replacerTarget.startsWith('showcase-')) {
      const projId = replacerTarget.replace('showcase-', '');
      handleUpdateShowcaseItem(projId, 'imageUrl', selectedReplacerUrl);
      updatedSectionName = 'Student Study';
    } else if (replacerTarget.startsWith('testimonial-before-')) {
      const testId = replacerTarget.replace('testimonial-before-', '');
      handleUpdateTestimonialItem(testId, 'beforeImage', selectedReplacerUrl);
      updatedSectionName = 'Testimonial (Before Image)';
    } else if (replacerTarget.startsWith('testimonial-after-')) {
      const testId = replacerTarget.replace('testimonial-after-', '');
      handleUpdateTestimonialItem(testId, 'afterImage', selectedReplacerUrl);
      updatedSectionName = 'Testimonial (After Image)';
    } else {
      setReplaceNotice({ type: 'error', message: 'Unknown replacement target identified.' });
      return;
    }

    setReplaceNotice({
      type: 'success',
      message: `Successfully swapped ${updatedSectionName} with the selected image in memory! Remember to click "SAVE CHANGES" at the top or bottom of the Command Hub to persist your design live.`
    });
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

  // --- ACHIEVEMENTS Helpers ---
  const handleAchievementsParagraphChange = (index: number, val: string) => {
    const nextParas = [...achievementsForm.paragraphs];
    nextParas[index] = val;
    setAchievementsForm({ ...achievementsForm, paragraphs: nextParas });
  };

  const handleAddAchievementsParagraph = () => {
    setAchievementsForm({ ...achievementsForm, paragraphs: [...achievementsForm.paragraphs, "New milestone description paragraph."] });
  };

  const handleRemoveAchievementsParagraph = (index: number) => {
    const nextParas = achievementsForm.paragraphs.filter((_, i) => i !== index);
    setAchievementsForm({ ...achievementsForm, paragraphs: nextParas });
  };

  const handleAddAchievementsCard = () => {
    const newCard = {
      id: 'ach-' + Date.now().toString(36),
      title: 'Academy Honor or Certification',
      issuer: 'Awarding Body or Council',
      year: new Date().getFullYear().toString(),
      description: 'Award description showcasing excellence details and curriculum coverage.',
      imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800',
    };
    setAchievementsCardsList([...achievementsCardsList, newCard]);
  };

  const handleRemoveAchievementsCard = (id: string) => {
    setAchievementsCardsList(achievementsCardsList.filter(item => item.id !== id));
  };

  const handleUpdateAchievementsCard = (id: string, field: string, val: any) => {
    setAchievementsCardsList(achievementsCardsList.map(item => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    }));
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

  // --- COURSES & WORKSHOPS HELPERS ---
  const handleAddCourseOrWorkshop = () => {
    const newItem = {
      id: 'cw-' + Date.now().toString(36),
      title: 'New Masterclass Session',
      type: 'Workshop' as 'Course' | 'Workshop',
      dateOrDuration: 'Weekend Workshop',
      time: '11:00 AM - 1:00 PM IST',
      price: 2500,
      location: 'Kailaras Studio & Zoom Stream',
      spotsLeft: 5,
      description: 'Briefly describe what this educational drawing session covers and what the student will construct.',
      syllabusOrDetails: ['Skill Highlight A', 'Skill Highlight B'],
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800',
      isActive: true,
    };
    setCoursesAndWorkshopsList([...coursesAndWorkshopsList, newItem]);
  };

  const handleRemoveCourseOrWorkshop = (id: string) => {
    setCoursesAndWorkshopsList(coursesAndWorkshopsList.filter(item => item.id !== id));
  };

  const handleUpdateCourseOrWorkshop = (id: string, field: string, val: any) => {
    setCoursesAndWorkshopsList(coursesAndWorkshopsList.map(item => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  const handleCourseSyllabusChange = (courseId: string, idx: number, val: string) => {
    setCoursesAndWorkshopsList(coursesAndWorkshopsList.map(item => {
      if (item.id === courseId) {
        const nextSyl = [...item.syllabusOrDetails];
        nextSyl[idx] = val;
        return { ...item, syllabusOrDetails: nextSyl };
      }
      return item;
    }));
  };

  const handleAddCourseSyllabus = (courseId: string) => {
    setCoursesAndWorkshopsList(coursesAndWorkshopsList.map(item => {
      if (item.id === courseId) {
        return { ...item, syllabusOrDetails: [...item.syllabusOrDetails, "New Syllabus Bullet"] };
      }
      return item;
    }));
  };

  const handleRemoveCourseSyllabus = (courseId: string, idx: number) => {
    setCoursesAndWorkshopsList(coursesAndWorkshopsList.map(item => {
      if (item.id === courseId) {
        const nextSyl = item.syllabusOrDetails.filter((_, i) => i !== idx);
        return { ...item, syllabusOrDetails: nextSyl };
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
          <ThemeToggle />

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
            { id: 'achievements', label: '🏆 Achievements Plaque' },
            { id: 'contact', label: '📞 Contact Details' },
            { id: 'gallery', label: '🖼️ Gallery (Artworks)' },
            { id: 'showcase', label: '🎓 Student Showroom' },
            { id: 'lessons', label: '📚 Study Programs' },
            { id: 'courses', label: '🎓 Workshops & Courses' },
            { id: 'testimonials', label: '⭐ Testimonials Review' },
            { id: 'media', label: '📷 Media & Image Hub' },
            { id: 'subscribers', label: '📨 Newsletter Subscribers' },
            { id: 'security', label: '🛡️ Security Settings' },
            { id: 'analytics', label: '📊 Viewers & IP Logs' },
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

          {saveError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-xs space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider font-mono text-[10px]">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
                <span>SAVE REJECTED</span>
              </div>
              <p className="text-[11px] font-mono leading-relaxed break-all bg-stone-50 dark:bg-stone-950 p-2.5 rounded border border-rose-500/15 max-h-48 overflow-y-auto">
                {saveError}
              </p>
              <p className="text-[10px] text-stone-500 leading-snug dark:text-stone-400 mt-1">
                To fix: Check database logs, ensure table structures are initialized, or check if the backend token expired.
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
              {activeTab === 'achievements' && 'Honors & Technical Achievements Manager'}
              {activeTab === 'contact' && 'Contact Form & Studio Address Editor'}
              {activeTab === 'gallery' && 'Fine Art Portfolio Manager'}
              {activeTab === 'showcase' && 'Student Success Showroom'}
              {activeTab === 'lessons' && 'Academic Study Programs & Curriculum'}
              {activeTab === 'courses' && 'Workshops & Live Masterclasses'}
              {activeTab === 'testimonials' && 'Before & After Drawing Slider Testimonials'}
              {activeTab === 'media' && 'Media Library & Section Image Replacer'}
              {activeTab === 'subscribers' && 'Newsletter Subscribers List'}
              {activeTab === 'security' && 'Security Settings & Admin Passphrase'}
              {activeTab === 'analytics' && 'Studio Viewers Monitor & Real-time IP Logs'}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              {activeTab === 'hero' && 'Customize the introductory section, main punchlines, and action buttons.'}
              {activeTab === 'about' && 'Update Sneha\'s teacher bio narrative paragraphs, years of training, and students mentored.'}
              {activeTab === 'achievements' && 'Manage academic certifications, credentials, honors of distinction, and credentials paragraphs.'}
              {activeTab === 'contact' && 'Change the direct phone line, email address, physical layout workspace coordinates, metrics, and quotes.'}
              {activeTab === 'gallery' && 'Add, remove, or modify high-fidelity drawings, sizes, mediums, techniques and gallery categories.'}
              {activeTab === 'showcase' && 'Display exemplary artworks made by students under Sneha\'s precise supervision.'}
              {activeTab === 'lessons' && 'Define the actual syllabus, hourly mentoring prices, key subtopics, and difficulty levels.'}
              {activeTab === 'courses' && 'Manage upcoming academic drawing workshops, active registration spots, schedules, locations, and pricing.'}
              {activeTab === 'testimonials' && 'Log actual before-and-after progress slider images showing academic student improvement.'}
              {activeTab === 'media' && 'Manage uploaded local image files stored in the application\'s state and dynamically swap them in any portfolio section.'}
              {activeTab === 'subscribers' && 'View, search, clear or copy the mailing addresses subscribed via the footer newsletter workshops form.'}
              {activeTab === 'security' && 'Change the credential passphrase needed to access the Sneha Art Academy dashboard.'}
              {activeTab === 'analytics' && 'Analyze real-time visitor demographics, devices, operating systems, and page interaction loops.'}
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
                      onUploaded={handleNewUploadRecord}
                    />
                    <FileUploader
                      label="Secondary Underlay Sketch"
                      placeholder="https://images.unsplash.com/..."
                      value={heroForm.underlayPhotoUrl}
                      adminToken={adminToken}
                      onChange={(url) => setHeroForm({ ...heroForm, underlayPhotoUrl: url })}
                      onUploaded={handleNewUploadRecord}
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

                  <div className="border-t border-stone-200 dark:border-stone-800 pt-5 mt-6 space-y-4">
                    <h4 className="text-xs font-mono font-bold tracking-wider text-stone-500 uppercase">Interactive Button Actions & Photo Badges</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Hero Photo Profile Badge Text</label>
                        <input
                          type="text"
                          placeholder="Sneha Bansal, Studio Profile"
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                          value={heroForm.profilePhrase}
                          onChange={(e) => setHeroForm({ ...heroForm, profilePhrase: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Primary CTA Redirect URL (Left Button, e.g. #contact or custom link)</label>
                        <input
                          type="text"
                          placeholder="#contact"
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                          value={heroForm.ctaPrimaryLink}
                          onChange={(e) => setHeroForm({ ...heroForm, ctaPrimaryLink: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Secondary CTA Redirect URL (Right Button, e.g. #gallery or custom link)</label>
                        <input
                          type="text"
                          placeholder="#gallery"
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                          value={heroForm.ctaSecondaryLink}
                          onChange={(e) => setHeroForm({ ...heroForm, ctaSecondaryLink: e.target.value })}
                        />
                      </div>
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
                      onUploaded={handleNewUploadRecord}
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

            {/* ACHIEVEMENTS MODULE */}
            {activeTab === 'achievements' && (
              <div className="space-y-6 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Achievements Badge Accent Info</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                      value={achievementsForm.badgeText}
                      onChange={(e) => setAchievementsForm({ ...achievementsForm, badgeText: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Achievements Title</label>
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                      value={achievementsForm.title}
                      onChange={(e) => setAchievementsForm({ ...achievementsForm, title: e.target.value })}
                    />
                  </div>
                </div>

                {/* Metrics and Credentials Authority badge inputs */}
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-4">
                  <h3 className="text-xs font-mono font-bold tracking-wider text-stone-500 uppercase">Quick Metrics & Authority Badges</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Metric card */}
                    <div className="space-y-3.5 border-r border-stone-200/50 dark:border-stone-800/50 pr-0 md:pr-6">
                      <h4 className="text-xs font-serif italic text-stone-600 dark:text-stone-300">Left Indicator Card (Verified Badge)</h4>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-stone-400 block uppercase">Label Tracker</label>
                        <input
                          type="text"
                          className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded p-2 text-xs"
                          value={achievementsForm.metricLeftLabel}
                          onChange={(e) => setAchievementsForm({ ...achievementsForm, metricLeftLabel: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-stone-400 block uppercase">Achievement Value Header</label>
                        <input
                          type="text"
                          className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded p-2 text-xs"
                          value={achievementsForm.metricLeftVal}
                          onChange={(e) => setAchievementsForm({ ...achievementsForm, metricLeftVal: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-stone-400 block uppercase">Issuing Academy/Subtitle</label>
                        <input
                          type="text"
                          className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded p-2 text-xs"
                          value={achievementsForm.metricLeftSub}
                          onChange={(e) => setAchievementsForm({ ...achievementsForm, metricLeftSub: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-stone-400 block uppercase">Card Back Detail/Description</label>
                        <textarea
                          rows={2}
                          className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded p-2 text-xs resize-none"
                          value={achievementsForm.metricLeftBackText}
                          onChange={(e) => setAchievementsForm({ ...achievementsForm, metricLeftBackText: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Right Metric card */}
                    <div className="space-y-3.5">
                      <h4 className="text-xs font-serif italic text-stone-600 dark:text-stone-300">Right Indicator Card (National Badge)</h4>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-stone-400 block uppercase">Label Tracker</label>
                        <input
                          type="text"
                          className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded p-2 text-xs"
                          value={achievementsForm.metricRightLabel}
                          onChange={(e) => setAchievementsForm({ ...achievementsForm, metricRightLabel: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-stone-400 block uppercase">Achievement Value Header</label>
                        <input
                          type="text"
                          className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded p-2 text-xs"
                          value={achievementsForm.metricRightVal}
                          onChange={(e) => setAchievementsForm({ ...achievementsForm, metricRightVal: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-stone-400 block uppercase">Issuing Academy/Subtitle</label>
                        <input
                          type="text"
                          className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded p-2 text-xs"
                          value={achievementsForm.metricRightSub}
                          onChange={(e) => setAchievementsForm({ ...achievementsForm, metricRightSub: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-stone-400 block uppercase">Card Back Detail/Description</label>
                        <textarea
                          rows={2}
                          className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded p-2 text-xs resize-none"
                          value={achievementsForm.metricRightBackText}
                          onChange={(e) => setAchievementsForm({ ...achievementsForm, metricRightBackText: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipient details and credential summary */}
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-4">
                  <h3 className="text-xs font-mono font-bold tracking-wider text-stone-500 uppercase">Parchment plaque Recipient & Summary details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5 md:col-span-1">
                      <label className="text-[10px] font-mono text-stone-400 block uppercase">Recipient Name (In-Plaque)</label>
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs"
                        value={achievementsForm.recipientName}
                        onChange={(e) => setAchievementsForm({ ...achievementsForm, recipientName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-mono text-stone-400 block uppercase">Credential bottom summary info paragraph</label>
                      <textarea
                        rows={2}
                        className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs resize-none outline-none"
                        value={achievementsForm.summaryText}
                        onChange={(e) => setAchievementsForm({ ...achievementsForm, summaryText: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold tracking-wider text-stone-500 uppercase">Description Paragraphs</h3>
                    <button
                      type="button"
                      onClick={handleAddAchievementsParagraph}
                      className="text-xs text-[#B38F4D] font-mono hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Paragraph
                    </button>
                  </div>
                  <div className="space-y-3">
                    {achievementsForm.paragraphs.map((para, i) => (
                      <div key={i} className="flex gap-3 items-start bg-stone-50 dark:bg-stone-950 p-3 rounded-lg border border-stone-200 dark:border-stone-850">
                        <span className="font-mono text-xs text-stone-400 pt-3 flex-shrink-0">P{i+1}</span>
                        <textarea
                          rows={3}
                          className="flex-grow bg-transparent border-none text-xs focus:ring-0 p-0 resize-none outline-none text-stone-800 dark:text-stone-100"
                          value={para || ""}
                          onChange={(e) => handleAchievementsParagraphChange(i, e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAchievementsParagraph(i)}
                          className="text-stone-400 hover:text-red-500 pt-2 cursor-pointer"
                          title="Remove paragraph block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-stone-100 dark:border-stone-800 pt-6 mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-serif font-light text-stone-800 dark:text-stone-100">Honor & Award Cards (Gallery Deck)</h4>
                      <p className="text-[11px] text-stone-400">Add credentials that users can flip, read details of, or magnify into a certificate plaque.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAchievementsCard}
                      className="text-xs font-mono bg-stone-900 border border-stone-850 hover:bg-stone-800 text-white rounded-lg px-3 py-1.5 flex items-center gap-1 cursor-pointer shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Award Plaque
                    </button>
                  </div>

                  <div className="space-y-6">
                    {achievementsCardsList.map((ach, idx) => (
                      <div key={ach.id || idx} className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 relative space-y-4">
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <span className="text-[9px] font-mono text-stone-400 px-2 py-0.5 rounded border border-stone-200/60 dark:border-stone-800">
                            ID: {ach.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAchievementsCard(ach.id)}
                            className="p-1 rounded bg-stone-100 hover:bg-red-500 dark:bg-stone-900 hover:text-white text-stone-500 transition-colors cursor-pointer"
                            title="Delete this award card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-1 space-y-2">
                            <span className="text-[10px] font-mono text-stone-400 block uppercase">Plaque Image</span>
                            <div className="h-32 w-full rounded-md bg-stone-100 dark:bg-stone-905 border border-stone-200 dark:border-stone-850 overflow-hidden flex items-center justify-center relative">
                              {ach.imageUrl ? (
                                <img
                                  src={ach.imageUrl}
                                  alt="Award preview"
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <Award className="w-8 h-8 text-stone-300" />
                              )}
                            </div>
                            <div className="w-full mt-2">
                              <FileUploader
                                value={ach.imageUrl}
                                adminToken={adminToken}
                                onChange={(url) => handleUpdateAchievementsCard(ach.id, 'imageUrl', url)}
                                placeholder="https://images.unsplash.com/..."
                                onUploaded={handleNewUploadRecord}
                              />
                            </div>
                          </div>

                          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-stone-400 block uppercase">Award/Honor Title</span>
                              <input
                                type="text"
                                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2 text-xs text-stone-800 dark:text-stone-100"
                                value={ach.title}
                                onChange={(e) => handleUpdateAchievementsCard(ach.id, 'title', e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-stone-400 block uppercase">Awarding Institution</span>
                              <input
                                type="text"
                                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2 text-xs text-stone-800 dark:text-stone-100"
                                value={ach.issuer}
                                onChange={(e) => handleUpdateAchievementsCard(ach.id, 'issuer', e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-stone-400 block uppercase">Year Awarded</span>
                              <input
                                type="text"
                                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2 text-xs text-stone-800 dark:text-stone-100"
                                value={ach.year}
                                onChange={(e) => handleUpdateAchievementsCard(ach.id, 'year', e.target.value)}
                              />
                            </div>
                            <div className="sm:col-span-2 space-y-1">
                              <span className="text-[10px] font-mono text-stone-400 block uppercase">Excellence Description (Flip Side)</span>
                              <textarea
                                rows={2}
                                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-2 text-xs text-stone-800 dark:text-stone-100 resize-none outline-none"
                                value={ach.description}
                                onChange={(e) => handleUpdateAchievementsCard(ach.id, 'description', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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

                  <div className="border-t border-stone-200 dark:border-stone-800 pt-5 mt-6 space-y-4">
                    <h4 className="text-xs font-mono font-bold tracking-wider text-stone-500 uppercase">Footer Social Profiles & Contact Anchors</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Instagram Profile URL</label>
                        <input
                          type="text"
                          placeholder="https://instagram.com/kalakar_sneha"
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs font-mono"
                          value={socialsForm.instagram}
                          onChange={(e) => setSocialsForm({ ...socialsForm, instagram: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">YouTube Channel URL</label>
                        <input
                          type="text"
                          placeholder="https://youtube.com/@kalakar_sneha"
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs font-mono"
                          value={socialsForm.youtube}
                          onChange={(e) => setSocialsForm({ ...socialsForm, youtube: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Facebook Page URL</label>
                        <input
                          type="text"
                          placeholder="https://facebook.com/kalakar.sneha"
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs font-mono"
                          value={socialsForm.facebook}
                          onChange={(e) => setSocialsForm({ ...socialsForm, facebook: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">LinkedIn Profile URL</label>
                        <input
                          type="text"
                          placeholder="https://linkedin.com/in/sneha"
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs font-mono"
                          value={socialsForm.linkedin}
                          onChange={(e) => setSocialsForm({ ...socialsForm, linkedin: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Contact Email (Mail)</label>
                        <input
                          type="text"
                          placeholder="sneha@fineart-morena.com"
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs font-mono"
                          value={socialsForm.mail}
                          onChange={(e) => setSocialsForm({ ...socialsForm, mail: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Call Button Number</label>
                        <input
                          type="text"
                          placeholder="+917562224809"
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs font-mono"
                          value={socialsForm.phone}
                          onChange={(e) => setSocialsForm({ ...socialsForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">WhatsApp (wa.me link or number)</label>
                        <input
                          type="text"
                          placeholder="https://wa.me/917562224809"
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs font-mono"
                          value={socialsForm.whatsapp}
                          onChange={(e) => setSocialsForm({ ...socialsForm, whatsapp: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-stone-200 dark:border-stone-800 pt-5 mt-6 space-y-4">
                    <h4 className="text-xs font-mono font-bold tracking-wider text-stone-500 uppercase">Global Button Inquiries & Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Interactive Navbar Consult Button Target (e.g. #contact or external link)</label>
                        <input
                          type="text"
                          placeholder="#contact"
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs font-mono"
                          value={globalButtonsForm.navbarContactLink}
                          onChange={(e) => setGlobalButtonsForm({ ...globalButtonsForm, navbarContactLink: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Curriculum Syllabus Booking Target (e.g. #contact or external link)</label>
                        <input
                          type="text"
                          placeholder="#contact"
                          className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs font-mono"
                          value={globalButtonsForm.lessonsInquireLink}
                          onChange={(e) => setGlobalButtonsForm({ ...globalButtonsForm, lessonsInquireLink: e.target.value })}
                        />
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
                              onUploaded={handleNewUploadRecord}
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
                {/* Showcase Call-to-Action Banner links configuration */}
                <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900/40 space-y-4">
                  <h3 className="text-xs font-mono font-bold tracking-wider text-stone-500 uppercase">Showcase Bottom Banner (Explore Curriculum Link)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-stone-400 block uppercase">Button Text Label</label>
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded p-2 text-xs"
                        value={globalButtonsForm.showcaseExploreText}
                        placeholder="Explore curriculum"
                        onChange={(e) => setGlobalButtonsForm({ ...globalButtonsForm, showcaseExploreText: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-stone-400 block uppercase">Redirect Link (Anchor or External, e.g. #lessons, /about, https://...)</label>
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded p-2 text-xs"
                        value={globalButtonsForm.showcaseExploreLink}
                        placeholder="#lessons"
                        onChange={(e) => setGlobalButtonsForm({ ...globalButtonsForm, showcaseExploreLink: e.target.value })}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] font-sans font-light text-stone-500">
                    ✦ Tip: Anchor tags beginning with <code className="font-mono bg-stone-200/50 dark:bg-stone-800 p-0.5 rounded px-1">#</code> will scroll smoothly on the page (e.g. <code className="font-mono">#lessons</code> or <code className="font-mono">#contact</code>). Full links (e.g. <code className="font-mono">https://external-website.com</code>) will open beautifully in a new tab.
                  </p>
                </div>

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
                              onUploaded={handleNewUploadRecord}
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

            {/* COURSES & WORKSHOPS CMS SECTION */}
            {activeTab === 'courses' && (
              <div className="space-y-8">
                {/* Header Inputs */}
                <div className="bg-stone-50 dark:bg-stone-950 p-6 rounded-xl border border-stone-200 dark:border-stone-850 space-y-4">
                  <span className="font-mono text-[10px] text-wood font-extrabold uppercase">GENERAL SECTION DETAILS</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-stone-400 block uppercase">Section Badge Label</span>
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs font-semibold"
                        value={coursesAndWorkshopsForm.badgeText}
                        onChange={(e) => setCoursesAndWorkshopsForm({ ...coursesAndWorkshopsForm, badgeText: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-stone-400 block uppercase">Section Heading Title</span>
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs font-semibold"
                        value={coursesAndWorkshopsForm.title}
                        onChange={(e) => setCoursesAndWorkshopsForm({ ...coursesAndWorkshopsForm, title: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-stone-400 block uppercase">Section Subtitle Description</span>
                    <textarea
                      rows={2}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs font-light leading-relaxed"
                      value={coursesAndWorkshopsForm.description}
                      onChange={(e) => setCoursesAndWorkshopsForm({ ...coursesAndWorkshopsForm, description: e.target.value })}
                    />
                  </div>
                </div>

                {/* Items List Header */}
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-850">
                  <h3 className="text-sm font-semibold tracking-wide text-stone-700 dark:text-stone-300">
                    Schedules & Programs ({coursesAndWorkshopsList.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddCourseOrWorkshop}
                    className="px-3.5 py-1.5 bg-stone-950 hover:bg-stone-900 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white text-stone-50 font-mono text-[10px] tracking-wider uppercase rounded-lg flex items-center gap-1 cursor-pointer font-bold shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Workshop or Course
                  </button>
                </div>

                {/* Cards List */}
                <div className="space-y-8">
                  {coursesAndWorkshopsList.map((item, idx) => (
                    <div key={item.id} className="bg-stone-50 dark:bg-stone-950 p-6 rounded-xl border border-stone-200 dark:border-stone-800 relative space-y-6">
                      {/* Top Bar with delete */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[#B38F4D] font-extrabold uppercase">
                          PROGRAM EVENT #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCourseOrWorkshop(item.id)}
                          className="text-xs text-red-500 hover:text-red-650 font-mono flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Program
                        </button>
                      </div>

                      {/* Main Fields Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column: Image and Status */}
                        <div className="lg:col-span-4 space-y-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-stone-400 block uppercase">Program Cover Image</span>
                            <div className="h-36 rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden flex items-center justify-center relative mb-2">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <BookOpen className="w-8 h-8 text-stone-300" />
                              )}
                            </div>
                            <FileUploader
                              value={item.imageUrl}
                              adminToken={adminToken}
                              onChange={(url) => handleUpdateCourseOrWorkshop(item.id, 'imageUrl', url)}
                              placeholder="https://images.unsplash.com/..."
                              onUploaded={handleNewUploadRecord}
                            />
                          </div>

                          <div className="flex items-center gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                className="rounded border-stone-300 text-wood focus:ring-wood"
                                checked={item.isActive}
                                onChange={(e) => handleUpdateCourseOrWorkshop(item.id, 'isActive', e.target.checked)}
                              />
                              <span className="text-xs font-mono text-stone-600 dark:text-stone-300 uppercase tracking-wider font-semibold">Active & Visible</span>
                            </label>
                          </div>
                        </div>

                        {/* Right Column: Title and details */}
                        <div className="lg:col-span-8 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1 col-span-1 sm:col-span-2">
                              <span className="text-[10px] font-mono text-stone-400 block uppercase">Course/Workshop Title Name</span>
                              <input
                                type="text"
                                className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs font-semibold"
                                value={item.title}
                                onChange={(e) => handleUpdateCourseOrWorkshop(item.id, 'title', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-stone-400 block uppercase">Program Classification</span>
                              <select
                                className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs font-mono"
                                value={item.type}
                                onChange={(e) => handleUpdateCourseOrWorkshop(item.id, 'type', e.target.value)}
                              >
                                <option value="Workshop">Workshop</option>
                                <option value="Course">Course</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-stone-400 block uppercase">Schedules / Dates</span>
                              <input
                                type="text"
                                className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs"
                                value={item.dateOrDuration}
                                onChange={(e) => handleUpdateCourseOrWorkshop(item.id, 'dateOrDuration', e.target.value)}
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-stone-400 block uppercase">Class Hour Timings</span>
                              <input
                                type="text"
                                className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs"
                                value={item.time}
                                onChange={(e) => handleUpdateCourseOrWorkshop(item.id, 'time', e.target.value)}
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-stone-400 block uppercase">Price (INR)</span>
                              <input
                                type="number"
                                className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs font-mono"
                                value={item.price}
                                onChange={(e) => handleUpdateCourseOrWorkshop(item.id, 'price', parseInt(e.target.value) || 0)}
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-stone-400 block uppercase">Physical or Virtual Location</span>
                              <input
                                type="text"
                                className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs"
                                value={item.location}
                                onChange={(e) => handleUpdateCourseOrWorkshop(item.id, 'location', e.target.value)}
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-stone-400 block uppercase">Spots Left (Leave empty or 0 if unlimited)</span>
                              <input
                                type="number"
                                className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs font-mono"
                                value={item.spotsLeft || ''}
                                onChange={(e) => handleUpdateCourseOrWorkshop(item.id, 'spotsLeft', parseInt(e.target.value) || undefined)}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-stone-400 block uppercase">Program Overview Summary</span>
                            <textarea
                              rows={2}
                              className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs font-light"
                              value={item.description}
                              onChange={(e) => handleUpdateCourseOrWorkshop(item.id, 'description', e.target.value)}
                            />
                          </div>

                          {/* Syllabus Highlights Editor */}
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-850 pb-1">
                              <span className="text-[9px] font-mono text-stone-400 block uppercase tracking-wider font-bold">Syllabus Highlights Bullets</span>
                              <button
                                type="button"
                                onClick={() => handleAddCourseSyllabus(item.id)}
                                className="text-[10px] text-wood font-mono flex items-center gap-1 cursor-pointer font-bold"
                              >
                                <Plus className="w-3 h-3" /> Add Highlight
                              </button>
                            </div>
                            <div className="space-y-2">
                              {(item.syllabusOrDetails || []).map((bullet: string, bulletIdx: number) => (
                                <div key={bulletIdx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 px-3 py-1.5 rounded text-xs"
                                    value={bullet}
                                    onChange={(e) => handleCourseSyllabusChange(item.id, bulletIdx, e.target.value)}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCourseSyllabus(item.id, bulletIdx)}
                                    className="text-stone-400 hover:text-red-500 cursor-pointer p-1"
                                    title="Delete Bullet"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                              {(item.syllabusOrDetails || []).length === 0 && (
                                <p className="text-[10px] text-stone-400 italic">No curriculum bullet highlights added yet.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {coursesAndWorkshopsList.length === 0 && (
                    <div className="text-center py-12 bg-stone-50 dark:bg-stone-950 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                      <p className="text-xs text-stone-400 italic">No masterclass programs or workshops defined. Create one using the button above.</p>
                    </div>
                  )}
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
                            <span className="text-[10px] font-mono text-stone-400 block uppercase font-bold text-amber-700 dark:text-amber-500">Practice Beginning drawing (Before Photo URL)</span>
                            <FileUploader
                              value={test.beforeImage}
                              adminToken={adminToken}
                              onChange={(url) => handleUpdateTestimonialItem(test.id, 'beforeImage', url)}
                              placeholder="https://images.unsplash.com/..."
                              onUploaded={handleNewUploadRecord}
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-stone-400 block uppercase font-bold text-emerald-600 dark:text-emerald-400">Graduation drawing (After Photo URL)</span>
                            <FileUploader
                              value={test.afterImage}
                              adminToken={adminToken}
                              onChange={(url) => handleUpdateTestimonialItem(test.id, 'afterImage', url)}
                              placeholder="https://images.unsplash.com/..."
                              onUploaded={handleNewUploadRecord}
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
            
            {/* MEDIA MODULE */}
            {activeTab === 'media' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column Controls */}
                  <div className="xl:col-span-5 space-y-6">
                    {/* Upload box */}
                    <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-4 text-left">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-wood" />
                        <h3 className="text-xs font-mono font-bold tracking-wider text-stone-800 dark:text-stone-200 uppercase">
                          Upload Local Image
                        </h3>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Select a file from your computer to upload. The image will be processed, hosted, and saved into your state-stashed media catalog.
                      </p>
                      
                      <div className="mt-2 text-left">
                        <FileUploader
                          value={mediaUploadUrl}
                          adminToken={adminToken}
                          onChange={(url) => {
                            setMediaUploadUrl(url);
                          }}
                          onUploaded={(url) => {
                            handleNewUploadRecord(url);
                            setMediaUploadUrl('');
                          }}
                          placeholder="Drag local file or click to browse..."
                        />
                      </div>
                      <p className="text-[10px] text-stone-400 font-sans italic leading-tight">
                        * Supported types: PNG, JPEG, WEBP, GIF. Max Size: 15MB.
                      </p>
                    </div>

                    {/* Replacer box */}
                    <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-4 text-left">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-wood" />
                        <h3 className="text-xs font-mono font-bold tracking-wider text-stone-800 dark:text-stone-200 uppercase">
                          Section Image Replacer
                        </h3>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Choose any image from your Library or paste a raw address below, select a target page section layout, and swap it out instantly.
                      </p>

                      <div className="space-y-4 pt-2">
                        {/* Selected Image URL Text block */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase block font-bold">
                            Selected Replacement Image URL
                          </label>
                          <input
                            type="text"
                            placeholder="Select an image from the library grid or paste a custom URL..."
                            className="w-full bg-white dark:bg-stone-950 border border-stone-250 dark:border-stone-800 rounded-lg p-2.5 text-xs font-mono"
                            value={selectedReplacerUrl}
                            onChange={(e) => setSelectedReplacerUrl(e.target.value)}
                          />
                        </div>

                        {/* Target layout selection dropdown */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono tracking-wider text-stone-500 uppercase block font-bold">
                            Target Portfolio Image Coordinates
                          </label>
                          <select
                            className="w-full bg-white dark:bg-stone-950 border border-stone-250 dark:border-stone-800 rounded-lg p-2.5 text-xs font-semibold text-stone-800 dark:text-stone-200"
                            value={replacerTarget}
                            onChange={(e) => setReplacerTarget(e.target.value)}
                          >
                            <optgroup label="Main Header & Biography Icons">
                              <option value="hero-teacher">Intro: Teacher Main Portrait photo</option>
                              <option value="hero-underlay">Intro: Secondary Underlay Sketch back</option>
                              <option value="about-avatar">Biography: Creator Circle Avatar icon</option>
                            </optgroup>

                            {galleryList.length > 0 && (
                              <optgroup label="Fine Art Portfolio Artworks">
                                {galleryList.map((art) => (
                                  <option key={`opt-gal-${art.id}`} value={`gallery-${art.id}`}>
                                    Gallery Artwork: "{art.title}" ({art.category})
                                  </option>
                                ))}
                              </optgroup>
                            )}

                            {showcaseList.length > 0 && (
                              <optgroup label="Student Success Showroom Study program">
                                {showcaseList.map((proj) => (
                                  <option key={`opt-show-${proj.id}`} value={`showcase-${proj.id}`}>
                                    Student Study: "{proj.title}" by {proj.studentName}
                                  </option>
                                ))}
                              </optgroup>
                            )}

                            {testimonialsList.length > 0 && (
                              <optgroup label="Drawing Experience Sliders">
                                {testimonialsList.map((test) => (
                                  <React.Fragment key={`opt-test-frag-${test.id}`}>
                                    <option value={`testimonial-before-${test.id}`}>
                                      Testimonial Before: "{test.studentName}"
                                    </option>
                                    <option value={`testimonial-after-${test.id}`}>
                                      Testimonial After: "{test.studentName}"
                                    </option>
                                  </React.Fragment>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        </div>

                        {replaceNotice.message && (
                          <div className={`p-3 rounded-lg text-xs font-medium ${
                            replaceNotice.type === 'success' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                          }`}>
                            {replaceNotice.message}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleApplyReplacement}
                          className="w-full bg-wood hover:bg-wood-dark text-white font-mono uppercase text-xs tracking-wider py-3 px-4 rounded-lg font-bold shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Apply Image Replacement</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Grid View */}
                  <div className="xl:col-span-7 space-y-6">
                    {/* Media Library list */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 space-y-4 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Image className="w-4 h-4 text-wood" />
                          <h3 className="text-xs font-mono font-bold tracking-wider text-stone-800 dark:text-stone-200 uppercase">
                            State-Stashed Media Library Catalogue ({uploadedImages.length})
                          </h3>
                        </div>
                        {uploadedImages.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if(confirm("Confirm: Clear all stashed images? This resets memory bindings.")) {
                                setUploadedImages([]);
                                setSelectedReplacerUrl('');
                              }
                            }}
                            className="text-[10px] text-red-500 hover:text-red-650 font-mono tracking-wide flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3" />
                            Clear All
                          </button>
                        )}
                      </div>

                      {uploadedImages.length === 0 ? (
                        <div className="border border-dashed border-stone-250 dark:border-stone-800 rounded-xl p-10 text-center text-stone-400 text-xs py-16 space-y-2">
                          <Image className="w-8 h-8 text-stone-300 mx-auto animate-pulse" />
                          <p className="font-mono text-[10px] uppercase font-bold tracking-wider text-stone-500">
                            State Library Empty
                          </p>
                          <p className="max-w-md mx-auto text-[11px] text-stone-400 tracking-wide font-sans leading-relaxed">
                            No custom local files uploaded to the application's configuration state yet. Use the upload tool to initialize custom assets.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
                          {uploadedImages.map((imgUrl, i) => {
                            const isSelected = selectedReplacerUrl === imgUrl;
                            return (
                              <div
                                key={`lib-img-${i}`}
                                onClick={() => setSelectedReplacerUrl(imgUrl)}
                                className={`group relative aspect-square bg-stone-50 dark:bg-stone-950 border rounded-lg overflow-hidden cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'border-wood ring-2 ring-wood/20 shadow-md transform scale-[0.98]' 
                                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
                                }`}
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Media item ${i}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                                
                                {/* Overlay hover controls */}
                                <div className="absolute inset-0 bg-stone-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                  <div className="flex justify-end">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveLibraryImage(imgUrl);
                                      }}
                                      className="p-1 bg-red-600 hover:bg-red-700 text-white rounded shadow cursor-pointer transition-colors"
                                      title="Remove from Media state index"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[9px] font-mono text-stone-300 bg-black/40 px-1 py-0.5 rounded truncate">
                                      {imgUrl.slice(imgUrl.lastIndexOf('/') + 1)}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(imgUrl);
                                        alert("URL Copied to clipboard!");
                                      }}
                                      className="w-full py-1 text-[9px] font-mono uppercase bg-wood hover:bg-wood-dark text-white rounded transition-colors"
                                    >
                                      Copy URL link
                                    </button>
                                  </div>
                                </div>

                                {isSelected && (
                                  <div className="absolute top-2 left-2 bg-wood text-white text-[9px] font-mono uppercase px-1.5 py-0.5 rounded shadow">
                                    Active Target
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Pre-existing default core catalog options */}
                    <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-xl border border-stone-200 dark:border-stone-800 text-left space-y-3.5">
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-stone-400" />
                        <h4 className="text-xs font-mono font-bold tracking-wider text-stone-500 uppercase">
                          Standard Native Imagery Presets
                        </h4>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Need to revert back or reference a predefined graphic? Click any preset thumbnail to select it as the swap target replacement candidate:
                      </p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {[
                          { name: 'Teacher', url: '/assets/sneha_photo.png' },
                          { name: 'Syllabus', url: '/assets/academic_study.jpg' },
                          { name: 'Graphite', url: '/images/charcoal_soft.jpg' },
                          { name: 'Reed Pen', url: '/images/sepia_ink.jpg' }
                        ].map((preset, i) => (
                          <div
                            key={`preset-cat-${i}`}
                            onClick={() => setSelectedReplacerUrl(preset.url)}
                            className={`aspect-square bg-white dark:bg-stone-900 border rounded-md overflow-hidden cursor-pointer p-0.5 transition-all ${
                              selectedReplacerUrl === preset.url 
                                ? 'border-wood ring-1 ring-wood/30' 
                                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                            }`}
                            title={`Select ${preset.name} Preset`}
                          >
                            <div className="w-full h-full relative group">
                              <img src={preset.url} alt={preset.name} className="w-full h-full object-cover rounded-sm" />
                              <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] font-mono text-center py-0.5 truncate group-hover:bg-wood/80">
                                {preset.name}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

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

                {/* SUPABASE CONNECTION REAL-TIME STATUS & DIAGNOSTICS */}
                <div className="pt-6 border-t border-stone-200 dark:border-stone-800 space-y-4">
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-wood animate-spin-slow" />
                      Supabase Cloud Sync Status
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Check your Render-hosted Express API credentials, read/write permissions, and storage bucket connectivity live.
                    </p>
                  </div>

                  {loadingSupabaseStatus ? (
                    <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-900 rounded-xl p-6 text-center space-y-2">
                      <div className="w-5 h-5 border-2 border-wood border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-[11px] font-mono text-stone-400">Querying Render api/supabase-status telemetry...</p>
                    </div>
                  ) : supabaseStatusDoc ? (
                    <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-800 space-y-1.5">
                          <span className="text-[10px] font-mono text-stone-400 block uppercase font-bold">CLIENT LOGIC</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${supabaseStatusDoc.initialized ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200">
                              {supabaseStatusDoc.initialized ? 'Initialized ✅' : 'Not Loaded ❌'}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-800 space-y-1.5">
                          <span className="text-[10px] font-mono text-stone-400 block uppercase font-bold">ACTIVE STORAGE</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${supabaseStatusDoc.storageOk ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200">
                              {supabaseStatusDoc.storageOk ? 'Connected ✅' : 'Storage Failed ⚠️'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-900">
                          <span className="text-stone-500 font-mono text-[11px]">Database (`site_configs`)</span>
                          <span className={`font-mono font-bold ${supabaseStatusDoc.databaseOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-500'}`}>
                            {supabaseStatusDoc.databaseOk ? 'ACTIVE & HEALTHY' : 'UNREACHABLE'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-900">
                          <span className="text-stone-500 font-mono text-[11px]">Storage Bucket (`{supabaseStatusDoc.bucketUsed}`)</span>
                          <span className={`font-mono font-bold ${supabaseStatusDoc.storageOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                            {supabaseStatusDoc.storageOk ? 'READ-WRITE OK' : 'ACCESS DENIED / EMPTY'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-900">
                          <span className="text-stone-500 font-mono text-[11px]">SUPABASE_URL</span>
                          <span className="font-mono text-[11px] text-stone-700 dark:text-stone-300">
                            {supabaseStatusDoc.envCheck?.hasUrl ? `Set (Length: ${supabaseStatusDoc.envCheck.urlLength})` : 'Missing ❌'}
                          </span>
                        </div>
                      </div>

                      {/* Explicit Error debugging to give crystal-clear advice */}
                      {supabaseStatusDoc.storageError && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 space-y-1">
                          <span className="text-[10px] font-mono font-bold uppercase text-red-600 dark:text-red-400 block">
                            Storage API Warning Trace:
                          </span>
                          <code className="text-[10px] font-mono text-stone-700 dark:text-stone-300 block bg-black/5 dark:bg-black/40 p-2 rounded max-h-20 overflow-y-auto break-all whitespace-pre-wrap leading-relaxed">
                            {supabaseStatusDoc.storageError}
                          </code>
                          <p className="text-[10px] text-stone-500 mt-1 leading-normal italic">
                            💡 Tip: Go to Supabase dashboard &gt; Storage. Ensure a public bucket with the exact name <strong>"{supabaseStatusDoc.bucketUsed}"</strong> is created, and your RLS Policies allow unrestricted "insert/select/update" for Anon users.
                          </p>
                        </div>
                      )}

                      {supabaseStatusDoc.dbError && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 space-y-1">
                          <span className="text-[10px] font-mono font-bold uppercase text-red-600 dark:text-red-400 block">
                            Database Schema Trace:
                          </span>
                          <code className="text-[10px] font-mono text-stone-700 dark:text-stone-300 block bg-black/5 dark:bg-black/40 p-2 rounded max-h-20 overflow-y-auto break-all">
                            {supabaseStatusDoc.dbError}
                          </code>
                          <p className="text-[10px] text-stone-500 mt-1 leading-normal italic">
                            💡 Tip: Run the compiled SQL schema script in `/supabase_setup.sql` inside your Supabase SQL Editor to initiate the site configurations table.
                          </p>
                        </div>
                      )}

                      {!supabaseStatusDoc.configured && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-[11px] font-sans text-amber-700 dark:text-amber-400 leading-normal space-y-1">
                          <strong className="block">⚠️ Supabase Variables Omitted on Render Backend Dashboard!</strong>
                          <p>
                            To persist site data permanently, open your <strong>Render Dashboard</strong>, go to your Express service settings, select <strong>Environment</strong>, and add:
                          </p>
                          <ul className="list-disc pl-4 mt-1 font-mono text-[10px] text-stone-600 dark:text-stone-400 space-y-0.5">
                            <li>`SUPABASE_URL` = Your project API URL</li>
                            <li>`SUPABASE_ANON_KEY` = Your public/anon API key</li>
                          </ul>
                          <p className="pt-1">
                            <em>Note: Adding variables directly on Vercel is insufficient as Vercel runs only the static frontend, whereas your backend Render container coordinates filesystem/cloud transfers.</em>
                          </p>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={fetchSupabaseStatus}
                        className="w-full py-2 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all duration-300 font-bold"
                      >
                        REFRESH STATUS
                      </button>

                      {/* LIVE INTERACTIVE SUPABASE VERIFIER */}
                      <div className="pt-4 border-t border-stone-200 dark:border-stone-800 mt-2 space-y-3">
                        <span className="text-[10px] font-mono font-bold tracking-wider text-stone-400 block uppercase">
                          ⚡ LIVE INTEGRATION TESTER
                        </span>

                        <p className="text-[11px] text-stone-500 leading-normal">
                          Perform a live roundtrip test (write dummy data, read CDN, clean up file) to completely verify your Supabase Storage rules.
                        </p>

                        <button
                          type="button"
                          disabled={supabaseTestStatus === 'testing'}
                          onClick={runSupabaseVerificationTest}
                          className={`w-full py-2.5 rounded-lg text-[11px] font-mono uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer ${
                            supabaseTestStatus === 'testing'
                              ? 'bg-stone-300 dark:bg-stone-800 text-stone-500 animate-pulse'
                              : supabaseTestStatus === 'success'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : supabaseTestStatus === 'error'
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-wood hover:bg-wood/90 text-white'
                          }`}
                        >
                          {supabaseTestStatus === 'testing' ? (
                            <span className="flex items-center justify-center gap-1.5">
                              <div className="w-3 h-3 border-2 border-stone-500 border-t-transparent rounded-full animate-spin" />
                              VERIFYING WRITES...
                            </span>
                          ) : supabaseTestStatus === 'success' ? (
                            '✅ TEST PASSED - RETEST'
                          ) : supabaseTestStatus === 'error' ? (
                            '❌ TEST FAILED - RETEST'
                          ) : (
                            'RUN LIVE INTEGRATION TEST'
                          )}
                        </button>

                        {supabaseTestMessage && (
                          <div className={`p-3 rounded-lg border text-xs leading-normal ${
                            supabaseTestStatus === 'success'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                              : supabaseTestStatus === 'error'
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                              : 'bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                          }`}>
                            <strong className="block font-bold text-[11px] mb-1">
                              {supabaseTestStatus === 'success' ? 'Connection Succeeded!' : supabaseTestStatus === 'error' ? 'Connection Failed!' : 'Verification Loop Status:'}
                            </strong>
                            <p className="font-sans">{supabaseTestMessage}</p>

                            {supabaseTestDetails && (
                              <pre className="mt-2 p-2 bg-black/10 dark:bg-black/40 rounded text-[9px] font-mono overflow-x-auto whitespace-pre-wrap break-all leading-tight text-stone-700 dark:text-stone-300">
                                {supabaseTestDetails}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl p-4 text-center">
                      <p className="text-xs text-stone-400">Diagnostics unavailable. Verify if server is currently starting up.</p>
                      <button
                        type="button"
                        onClick={fetchSupabaseStatus}
                        className="mt-2 px-3 py-1.5 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg text-[10px] font-mono uppercase tracking-wider font-bold"
                      >
                        RETRY CONNECTION
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* NEWSLETTER SUBSCRIBERS */}
            {activeTab === 'subscribers' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search subscriber email..."
                      value={subSearch}
                      onChange={(e) => setSubSearch(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-wood transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleCopySubscribers}
                      disabled={subscribers.length === 0}
                      className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 font-mono text-[10px] tracking-wider uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-55"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copyStatus ? 'COPIED!' : 'COPY ALL EMAILS'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearAllSubscribers}
                      disabled={subscribers.length === 0}
                      className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-455 font-mono text-[10px] tracking-wider uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-55"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>CLEAR MAILING LIST</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800/80 rounded-xl overflow-hidden shadow-sm">
                  {subscribers.filter(s => s.toLowerCase().includes(subSearch.toLowerCase())).length === 0 ? (
                    <div className="p-8 text-center text-stone-400 font-light text-xs space-y-1">
                      <p>No active workshop mailing subscribers found matching your term.</p>
                      <p className="text-[10px] text-stone-500 font-mono">Use the footer subscription form or clear search terms to query other records.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans text-xs">
                        <thead>
                          <tr className="bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 text-[10px] font-mono tracking-wider text-stone-500 uppercase font-bold">
                            <th className="px-6 py-3.5">Subscriber Mailing Address</th>
                            <th className="px-6 py-3.5">Recruiting Status</th>
                            <th className="px-6 py-3.5 text-right">Administrative Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-250/50 dark:divide-stone-800/85">
                          {subscribers
                            .filter(s => s.toLowerCase().includes(subSearch.toLowerCase()))
                            .map((email, idx) => (
                              <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-950/30 transition-colors">
                                <td className="px-6 py-4.5 font-mono font-medium text-stone-900 dark:text-stone-100">
                                  {email}
                                </td>
                                <td className="px-6 py-4.5">
                                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                                    ● Enrolled Live
                                  </span>
                                </td>
                                <td className="px-6 py-4.5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubscriber(email)}
                                    title="Unsubscribe address"
                                    className="p-1 px-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[10px] font-mono tracking-wider uppercase rounded transition-all cursor-pointer inline-flex items-center gap-1 font-semibold"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Remove</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200/50 dark:border-stone-800 p-4 rounded-xl text-left">
                  <div className="flex gap-2.5">
                    <Sparkles className="w-4 h-4 text-wood mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-semibold text-stone-900 dark:text-white">Continuous Synced Mailer Integration</h4>
                      <p className="text-[10px] text-stone-500 mt-1 leading-relaxed">
                        To announce next-quarter live drawings, academic workshops, and student cohort pricing updates, press <strong>COPY ALL EMAILS</strong>, then paste the full list of comma-delimited mail loops seamlessly inside your active Gmail template or MailChimp dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STUDIO VISITOR ANALYTICS CONTROL PANEL */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 text-left">
                <div className="bg-[#B38F4D]/5 border border-[#B38F4D]/25 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-[#B38F4D]">
                    <BarChart3 className="w-48 h-48" />
                  </div>
                  
                  <div className="max-w-xl space-y-4 relative z-10">
                    <span className="inline-flex items-center gap-1 bg-[#B38F4D]/15 text-[#B38F4D] border border-[#B38F4D]/25 font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                      SYSTEM MODULE ONLINE
                    </span>
                    <h3 className="text-2xl font-serif text-stone-900 dark:text-stone-50 font-semibold tracking-tight">
                      Studio Viewers Monitor & Real-time IP Logs
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-light">
                      The application is dynamically recording client visitor IP addresses, devices, operating systems, browsers, and detailed navigation paths. You can analyze traffic directly via the secure analytics module.
                    </p>
                    
                    <div className="pt-2 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          window.location.hash = '#analytics';
                          window.dispatchEvent(new HashChangeEvent('hashchange'));
                        }}
                        className="px-5 py-3 bg-[#B38F4D] hover:bg-[#8b714c] text-white text-xs font-mono font-bold tracking-widest uppercase rounded-lg transition-all duration-300 shadow cursor-pointer flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> LAUNCH ANALYTICS ROOM
                      </button>
                      
                      <a 
                        href="/analytics" 
                        target="_blank" 
                        rel="noopener"
                        className="px-5 py-3 border border-stone-250 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-850 text-stone-700 dark:text-stone-250 text-xs font-mono font-bold tracking-widest uppercase rounded-lg transition-all flex items-center gap-1.5"
                      >
                        OPEN IN NEW TAB ↗
                      </a>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 border border-stone-150 dark:border-stone-805 rounded-xl space-y-2.5 bg-stone-50/50 dark:bg-stone-950/25">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Security Passphrase Link</span>
                    <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100">Synchronized Admin Passphrase</h4>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      Your separate analytics page is automatically encrypted. It uses the exact administrator passcode configured in your <strong>Security Settings</strong> tab to grant viewer logs authorization.
                    </p>
                  </div>

                  <div className="p-5 border border-stone-150 dark:border-stone-805 rounded-xl space-y-2.5 bg-stone-50/50 dark:bg-stone-950/25">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Interactive Capabilities</span>
                    <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100">Live Diagnostics & Aggregates</h4>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      Unlock instant search queries, descending/ascending count sorting, device profile distribution percentages, page view densities, and step-by-step visitor chronology timelines.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save Trigger action */}
            {activeTab !== 'security' && activeTab !== 'subscribers' && (
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
