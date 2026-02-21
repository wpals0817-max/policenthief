// Light 테마 디자인 시스템

export const colors = {
  // 배경
  background: '#F9FAFB',
  surface: '#FFFFFF',
  
  // 텍스트
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
  },
  
  // 테두리
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },
  
  // 팀 색상
  police: {
    main: '#2563EB',
    light: '#EFF6FF',
    lighter: '#F0F9FF',
    border: '#BFDBFE',
  },
  
  thief: {
    main: '#DC2626',
    light: '#FEF2F2',
    border: '#FECACA',
  },
  
  // 강조
  accent: {
    blue: '#2563EB',
    red: '#DC2626',
    yellow: '#F59E0B',
    green: '#10B981',
  },
  
  // 상태
  success: '#10B981',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#2563EB',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
};

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 2px 4px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 8px rgba(0, 0, 0, 0.1)',
  xl: '0 8px 16px rgba(0, 0, 0, 0.15)',
};

export const typography = {
  h1: {
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: '32px',
  },
  h2: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: '28px',
  },
  h3: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '24px',
  },
  body: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '20px',
  },
  caption: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '16px',
  },
  small: {
    fontSize: '10px',
    fontWeight: 400,
    lineHeight: '14px',
  },
};
