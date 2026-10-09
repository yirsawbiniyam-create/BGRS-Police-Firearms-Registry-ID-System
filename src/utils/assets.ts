// High fidelity SVG assets for Benishangul Gumuz Police Firearms Registry & ID System

// Ethiopian National Flag SVG Data URL
export const DEFAULT_ETHIOPIAN_FLAG = `data:image/svg+xml;utf8,` + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" width="100%" height="100%">
  <rect width="1200" height="200" fill="#078930"/>
  <rect y="200" width="1200" height="200" fill="#FCDD09"/>
  <rect y="400" width="1200" height="200" fill="#DA121A"/>
  <circle cx="600" cy="300" r="130" fill="#0F47AF"/>
  <!-- Central golden star with radiant rays -->
  <g fill="#FCDD09" stroke="#FCDD09" stroke-width="2">
    <!-- Star rays radiating -->
    <path d="M600,195 L615,260 L680,265 L630,305 L650,370 L600,330 L550,370 L570,305 L520,265 L585,260 Z" fill="#FCDD09"/>
    <!-- Yellow rays emanating between star points -->
    <line x1="600" y1="205" x2="600" y2="180" stroke="#FCDD09" stroke-width="6"/>
    <line x1="660" y1="245" x2="685" y2="230" stroke="#FCDD09" stroke-width="6"/>
    <line x1="640" y1="345" x2="665" y2="365" stroke="#FCDD09" stroke-width="6"/>
    <line x1="560" y1="345" x2="535" y2="365" stroke="#FCDD09" stroke-width="6"/>
    <line x1="540" y1="245" x2="515" y2="230" stroke="#FCDD09" stroke-width="6"/>
  </g>
</svg>
`);

// Benishangul Gumuz Regional State Flag SVG Data URL
// Triband: Black, Yellow/Gold, Green with Red triangle on hoist
export const DEFAULT_BGRS_FLAG = `data:image/svg+xml;utf8,` + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" width="100%" height="100%">
  <!-- Top: Black -->
  <rect width="1200" height="200" fill="#111827"/>
  <!-- Middle: Golden Yellow -->
  <rect y="200" width="1200" height="200" fill="#FBBF24"/>
  <!-- Bottom: Green -->
  <rect y="400" width="1200" height="200" fill="#047857"/>
  <!-- Red Triangle at hoist -->
  <polygon points="0,0 450,300 0,600" fill="#DC2626"/>
  <!-- Gold star inside red triangle -->
  <polygon points="150,230 165,280 215,280 175,310 190,360 150,330 110,360 125,310 85,280 135,280" fill="#FEF08A"/>
</svg>
`);

// Benishangul Gumuz Regional Police Commission Emblem Logo SVG Data URL
export const DEFAULT_POLICE_LOGO = `data:image/svg+xml;utf8,` + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <radialGradient id="badgeGold" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="45%" stop-color="#F59E0B"/>
      <stop offset="85%" stop-color="#B45309"/>
      <stop offset="100%" stop-color="#78350F"/>
    </radialGradient>
    <linearGradient id="shieldBlue" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A"/>
      <stop offset="50%" stop-color="#1E40AF"/>
      <stop offset="100%" stop-color="#172554"/>
    </linearGradient>
    <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>

  <!-- Outer Star Rays / Police Sunburst Badge -->
  <g filter="url(#badgeShadow)">
    <path d="M250,15 L285,75 L355,50 L365,125 L435,130 L415,205 L480,235 L435,295 L475,355 L405,385 L415,460 L345,455 L320,520 L250,480 L180,520 L155,455 L85,460 L95,385 L25,355 L65,295 L20,235 L85,205 L65,130 L135,125 L145,50 L215,75 Z" fill="url(#badgeGold)" stroke="#D97706" stroke-width="3"/>
  </g>

  <!-- Outer Ring with Golden Border -->
  <circle cx="250" cy="250" r="185" fill="#0F172A" stroke="#FDE68A" stroke-width="8"/>
  <circle cx="250" cy="250" r="172" fill="none" stroke="#B45309" stroke-width="2" stroke-dasharray="6,4"/>

  <!-- Inner Police Shield -->
  <path d="M250,115 C330,115 365,145 365,225 C365,335 250,385 250,385 C250,385 135,335 135,225 C135,145 170,115 250,115 Z" fill="url(#shieldBlue)" stroke="#F59E0B" stroke-width="5"/>

  <!-- Scales of Justice / Balance & Crossed Swords -->
  <!-- Crossed Swords -->
  <line x1="180" y1="320" x2="320" y2="180" stroke="#FDE68A" stroke-width="6" stroke-linecap="round"/>
  <line x1="320" y1="320" x2="180" y2="180" stroke="#FDE68A" stroke-width="6" stroke-linecap="round"/>
  <circle cx="180" cy="320" r="8" fill="#F59E0B"/>
  <circle cx="320" cy="320" r="8" fill="#F59E0B"/>
  <line x1="170" y1="305" x2="195" y2="330" stroke="#F59E0B" stroke-width="6"/>
  <line x1="330" y1="305" x2="305" y2="330" stroke="#F59E0B" stroke-width="6"/>

  <!-- Center Balance Beam -->
  <line x1="250" y1="160" x2="250" y2="310" stroke="#FEF08A" stroke-width="5"/>
  <circle cx="250" cy="155" r="9" fill="#F59E0B"/>
  <line x1="195" y1="195" x2="305" y2="195" stroke="#FEF08A" stroke-width="5"/>
  
  <!-- Left Pan -->
  <line x1="195" y1="195" x2="180" y2="245" stroke="#FDE68A" stroke-width="2.5"/>
  <line x1="195" y1="195" x2="210" y2="245" stroke="#FDE68A" stroke-width="2.5"/>
  <path d="M175,245 Q195,260 215,245 Z" fill="#FBBF24"/>

  <!-- Right Pan -->
  <line x1="305" y1="195" x2="290" y2="245" stroke="#FDE68A" stroke-width="2.5"/>
  <line x1="305" y1="195" x2="320" y2="245" stroke="#FDE68A" stroke-width="2.5"/>
  <path d="M285,245 Q305,260 325,245 Z" fill="#FBBF24"/>

  <!-- Central Star of Integrity -->
  <polygon points="250,225 257,243 276,243 261,254 266,272 250,261 234,272 239,254 224,243 243,243" fill="#FFFFFF"/>

  <!-- Circular Amharic Text on Shield Arch -->
  <path id="textPathTop" d="M 110,250 A 140,140 0 1,1 390,250" fill="none" stroke="none"/>
  <text font-family="'Noto Sans Ethiopic', sans-serif" font-size="20" font-weight="bold" fill="#FEF08A" letter-spacing="3">
    <textPath href="#textPathTop" startOffset="50%" text-anchor="middle">
      የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን
    </textPath>
  </text>

  <!-- Bottom Arch English & Insignia -->
  <path id="textPathBottom" d="M 390,250 A 140,140 0 0,1 110,250" fill="none" stroke="none"/>
  <text font-family="'Noto Sans Ethiopic', sans-serif" font-size="16" font-weight="bold" fill="#FBBF24" letter-spacing="4">
    <textPath href="#textPathBottom" startOffset="50%" text-anchor="middle">
      BGRS POLICE COMMISSION
    </textPath>
  </text>

  <!-- Small Five Stars on Lower Arch -->
  <g fill="#F59E0B">
    <polygon points="250,420 253,427 260,427 254,432 256,439 250,435 244,439 246,432 240,427 247,427"/>
    <polygon points="220,415 223,422 230,422 224,427 226,434 220,430 214,434 216,427 210,422 217,422"/>
    <polygon points="280,415 283,422 290,422 284,427 286,434 280,430 274,434 276,427 270,422 277,422"/>
  </g>
</svg>
`);

// High-fidelity Watermark Version with Pure White / Transparent Background
// Designed specifically for security watermarks on certificates and ID cards without any dark square or shadow
export const DEFAULT_POLICE_WATERMARK = `data:image/svg+xml;utf8,` + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <radialGradient id="wmBadgeGold" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </radialGradient>
  </defs>

  <!-- Outer Star Rays / Police Sunburst Badge in Golden Amber -->
  <g>
    <path d="M250,15 L285,75 L355,50 L365,125 L435,130 L415,205 L480,235 L435,295 L475,355 L405,385 L415,460 L345,455 L320,520 L250,480 L180,520 L155,455 L85,460 L95,385 L25,355 L65,295 L20,235 L85,205 L65,130 L135,125 L145,50 L215,75 Z" 
          fill="url(#wmBadgeGold)" stroke="#B45309" stroke-width="3" opacity="0.95"/>
  </g>

  <!-- Outer Ring with Pure White Background & Crisp Golden Border (No dark background!) -->
  <circle cx="250" cy="250" r="185" fill="#FFFFFF" stroke="#D97706" stroke-width="8"/>
  <circle cx="250" cy="250" r="172" fill="none" stroke="#B45309" stroke-width="2.5" stroke-dasharray="6,4"/>

  <!-- Inner Police Shield with Pure White Background & Golden Border -->
  <path d="M250,115 C330,115 365,145 365,225 C365,335 250,385 250,385 C250,385 135,335 135,225 C135,145 170,115 250,115 Z" 
        fill="#FFFFFF" stroke="#D97706" stroke-width="5"/>

  <!-- Scales of Justice / Balance & Crossed Swords in Sharp Gold -->
  <line x1="180" y1="320" x2="320" y2="180" stroke="#D97706" stroke-width="6" stroke-linecap="round"/>
  <line x1="320" y1="320" x2="180" y2="180" stroke="#D97706" stroke-width="6" stroke-linecap="round"/>
  <circle cx="180" cy="320" r="8" fill="#B45309"/>
  <circle cx="320" cy="320" r="8" fill="#B45309"/>
  <line x1="170" y1="305" x2="195" y2="330" stroke="#D97706" stroke-width="6"/>
  <line x1="330" y1="305" x2="305" y2="330" stroke="#D97706" stroke-width="6"/>

  <!-- Center Balance Beam -->
  <line x1="250" y1="160" x2="250" y2="310" stroke="#B45309" stroke-width="5"/>
  <circle cx="250" cy="155" r="9" fill="#D97706"/>
  <line x1="195" y1="195" x2="305" y2="195" stroke="#B45309" stroke-width="5"/>
  
  <!-- Left Pan -->
  <line x1="195" y1="195" x2="180" y2="245" stroke="#D97706" stroke-width="3"/>
  <line x1="195" y1="195" x2="210" y2="245" stroke="#D97706" stroke-width="3"/>
  <path d="M175,245 Q195,260 215,245 Z" fill="#F59E0B" stroke="#B45309" stroke-width="2"/>

  <!-- Right Pan -->
  <line x1="305" y1="195" x2="290" y2="245" stroke="#D97706" stroke-width="3"/>
  <line x1="305" y1="195" x2="320" y2="245" stroke="#D97706" stroke-width="3"/>
  <path d="M285,245 Q305,260 325,245 Z" fill="#F59E0B" stroke="#B45309" stroke-width="2"/>

  <!-- Central Star of Integrity -->
  <polygon points="250,225 257,243 276,243 261,254 266,272 250,261 234,272 239,254 224,243 243,243" fill="#D97706"/>

  <!-- Circular Amharic Text on Shield Arch -->
  <path id="wmTextTop" d="M 110,250 A 140,140 0 1,1 390,250" fill="none" stroke="none"/>
  <text font-family="'Noto Sans Ethiopic', sans-serif" font-size="20" font-weight="900" fill="#B45309" letter-spacing="3">
    <textPath href="#wmTextTop" startOffset="50%" text-anchor="middle">
      የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን
    </textPath>
  </text>

  <!-- Bottom Arch English & Insignia -->
  <path id="wmTextBottom" d="M 390,250 A 140,140 0 0,1 110,250" fill="none" stroke="none"/>
  <text font-family="'Noto Sans Ethiopic', sans-serif" font-size="16" font-weight="900" fill="#D97706" letter-spacing="4">
    <textPath href="#wmTextBottom" startOffset="50%" text-anchor="middle">
      BGRS POLICE COMMISSION
    </textPath>
  </text>

  <!-- Small Five Stars on Lower Arch -->
  <g fill="#D97706">
    <polygon points="250,420 253,427 260,427 254,432 256,439 250,435 244,439 246,432 240,427 247,427"/>
    <polygon points="220,415 223,422 230,422 224,427 226,434 220,430 214,434 216,427 210,422 217,422"/>
    <polygon points="280,415 283,422 290,422 284,427 286,434 280,430 274,434 276,427 270,422 277,422"/>
  </g>
</svg>
`);

// Official Police Round Stamp Seal SVG Data URL
export const DEFAULT_OFFICIAL_STAMP = `data:image/svg+xml;utf8,` + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <!-- Double Blue Circle Stamp -->
  <circle cx="150" cy="150" r="135" fill="none" stroke="#1D4ED8" stroke-width="5" stroke-dasharray="14,3" opacity="0.88"/>
  <circle cx="150" cy="150" r="122" fill="none" stroke="#1D4ED8" stroke-width="3" opacity="0.88"/>
  <circle cx="150" cy="150" r="75" fill="none" stroke="#1D4ED8" stroke-width="2.5" opacity="0.88"/>
  
  <path id="stampTop" d="M 45,150 A 105,105 0 1,1 255,150" fill="none"/>
  <text font-family="'Noto Sans Ethiopic', sans-serif" font-size="14" font-weight="900" fill="#1D4ED8" opacity="0.9" letter-spacing="2">
    <textPath href="#stampTop" startOffset="50%" text-anchor="middle">
      የቤ/ጉ/ክ/ ፖሊስ ኮሚሽን • የወንጀል መከላከል
    </textPath>
  </text>
  
  <path id="stampBottom" d="M 255,150 A 105,105 0 0,1 45,150" fill="none"/>
  <text font-family="'Noto Sans Ethiopic', sans-serif" font-size="12" font-weight="bold" fill="#1D4ED8" opacity="0.9" letter-spacing="2">
    <textPath href="#stampBottom" startOffset="50%" text-anchor="middle">
      FIREARMS REGISTRY * APPROVED
    </textPath>
  </text>

  <!-- Center Badge / Date -->
  <polygon points="150,115 156,128 170,128 159,136 163,149 150,141 137,149 141,136 130,128 144,128" fill="#1D4ED8" opacity="0.88"/>
  <text x="150" y="165" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1D4ED8" text-anchor="middle" opacity="0.9">
    ህጋዊ ፈቃድ
  </text>
  <text x="150" y="182" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1D4ED8" text-anchor="middle" opacity="0.9">
    አሶሳ / ASSOSA
  </text>
</svg>
`);

// Approver Official Signature SVG Data URL (Commander signature)
export const DEFAULT_APPROVER_SIGNATURE = `data:image/svg+xml;utf8,` + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90" width="100%" height="100%">
  <path d="M 20,65 Q 45,15 75,55 T 115,35 Q 145,20 160,50 T 195,30 Q 220,15 240,40 M 50,60 L 220,55 M 100,75 C 130,70 170,72 200,68" 
        fill="none" stroke="#0F2864" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="235" cy="52" r="3" fill="#0F2864"/>
</svg>
`);

// Registrar Signature SVG Data URL
export const DEFAULT_REGISTRAR_SIGNATURE = `data:image/svg+xml;utf8,` + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
  <path d="M 15,45 Q 35,10 65,40 T 95,20 Q 120,60 145,30 T 180,45 Q 200,20 225,35 M 40,55 L 195,50" 
        fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`);

// Sample passport photo (Ethiopian officer/citizen silhouette portrait in formal attire)
export const DEFAULT_SAMPLE_PHOTO = `data:image/svg+xml;utf8,` + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="100%" height="100%">
  <rect width="300" height="400" fill="#F8FAFC"/>
  <!-- Light background gradient simulation -->
  <linearGradient id="photoBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#E2E8F0"/>
    <stop offset="100%" stop-color="#CBD5E1"/>
  </linearGradient>
  <rect width="300" height="400" fill="url(#photoBg)"/>
  
  <!-- Silhouette / stylized professional citizen portrait -->
  <g fill="#334155">
    <!-- Body / Suit shoulders -->
    <path d="M40,400 C40,310 90,265 150,265 C210,265 260,310 260,400 Z"/>
    <!-- White shirt collar -->
    <polygon points="150,265 120,310 150,335 180,310" fill="#FFFFFF"/>
    <!-- Tie -->
    <polygon points="146,310 154,310 157,380 150,395 143,380" fill="#991B1B"/>
    <!-- Neck -->
    <rect x="132" y="215" width="36" height="60" fill="#D97706" rx="4"/>
    <!-- Head oval -->
    <ellipse cx="150" cy="165" rx="52" ry="65" fill="#D97706"/>
    <!-- Hair -->
    <path d="M98,160 C98,110 115,95 150,95 C185,95 202,110 202,160 C190,140 180,135 150,135 C120,135 110,140 98,160 Z" fill="#0F172A"/>
    <!-- Ears -->
    <circle cx="97" cy="165" r="9" fill="#D97706"/>
    <circle cx="203" cy="165" r="9" fill="#D97706"/>
  </g>
</svg>
`);
