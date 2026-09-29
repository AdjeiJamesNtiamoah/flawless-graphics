/**
 * storage-assets.js
 * Universal Reusable Supabase Cloud Storage Assets
 * FLAWLESS GRAPHICS Enterprise School Management System
 * 
 * Auto-generated cloud asset repository. All URLs point to permanent,
 * public Supabase Storage buckets for instant reuse across all portals.
 */

(function(window) {
  'use strict';

  const BASE_STORAGE_URL = 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public';

  const STORAGE_ASSETS = {
    logos: {
      primaryPng: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/school-assets/logos/flawless-logo.png',
      primaryJpg: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/school-assets/logos/flawless-logo.jpg',
      brandCrest: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/school-assets/logos/brand-crest.jpg'
    },
    backgrounds: {
      education: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/school-assets/backgrounds/education-bg.jpg',
      graduation: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/school-assets/backgrounds/graduation-bg.jpg'
    },
    features: {
      attendancePayroll: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/school-assets/features/employee-attendance-tracking-and-payroll.jpg',
      payrollAutomation: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/school-assets/features/payroll-automation.jpeg'
    },
    icons: {
      laptopClosing: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/school-assets/icons/icons8-laptop-closing.gif',
      rhombusLoader: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/school-assets/icons/icons8-rhombus-loader.gif',
      logGif: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/school-assets/icons/log.gif',
      logoGif: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/school-assets/icons/logo.gif'
    },
    avatars: {
      teacher: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/staff-photos/avatars/teacher-avatar.svg',
      student: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/student-photos/avatars/student-avatar.svg',
      admin: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/staff-photos/avatars/admin-avatar.svg',
      superAdmin: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/staff-photos/avatars/super-admin-avatar.svg',
      finance: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/staff-photos/avatars/finance-avatar.svg',
      hr: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/staff-photos/avatars/hr-avatar.svg',
      studentMale: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/student-photos/avatars/student-male-avatar.svg',
      studentFemale: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/student-photos/avatars/student-female-avatar.svg',
      staffMale: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/staff-photos/avatars/staff-male-avatar.svg',
      staffFemale: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/staff-photos/avatars/staff-female-avatar.svg',
      marthaAdjei: 'https://wmvsujwgvlosfjdlhadu.supabase.co/storage/v1/object/public/staff-photos/profiles/martha-adjei.jpg'
    }
  };

  STORAGE_ASSETS.getAvatarForRole = function(role) {
    const r = (role || '').toLowerCase();
    if (r.includes('super')) return this.avatars.superAdmin;
    if (r.includes('admin')) return this.avatars.admin;
    if (r.includes('hr')) return this.avatars.hr;
    if (r.includes('fin')) return this.avatars.finance;
    if (r.includes('teach') || r.includes('faculty') || r.includes('educat')) return this.avatars.teacher;
    if (r.includes('stud')) return this.avatars.student;
    return this.avatars.teacher;
  };

  STORAGE_ASSETS.getAsset = function(category, key) {
    if (this[category] && this[category][key]) return this[category][key];
    return '';
  };

  window.STORAGE_ASSETS = STORAGE_ASSETS;
  if (window.SupabaseService) {
    window.SupabaseService.STORAGE_ASSETS = STORAGE_ASSETS;
    window.SupabaseService.getAvatarForRole = STORAGE_ASSETS.getAvatarForRole.bind(STORAGE_ASSETS);
  }
})(typeof window !== 'undefined' ? window : global);
