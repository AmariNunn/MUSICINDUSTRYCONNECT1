# MiC · The Playlist - Design Guidelines

## Design Approach
**Reference-Based**: Drawing inspiration from music-focused platforms like Spotify, SoundCloud, and modern community platforms like Discord/Slack, with emphasis on mobile-first profile management.

## Core Design Principles
- **Mobile-First**: Optimized for touch interactions and single-hand usage
- **Music Community Focus**: Visual hierarchy emphasizing creator identity and musical content
- **Accessible Purple**: #c084fc used strategically for CTAs, active states, and key interactions
- **Clean Canvas**: White (#ffffff) base with subtle gray dividers (#f3f4f6)

## Typography System
- **Primary Font**: Inter (via Google Fonts) - clean, modern, excellent mobile readability
- **Headings**: 
  - Profile Name: 28px/semibold
  - Section Headers: 20px/semibold
  - Input Labels: 14px/medium
- **Body**: 16px/regular (never below 16px on mobile to prevent zoom)
- **Secondary Text**: 14px/regular, color: #6b7280

## Layout & Spacing System
**Tailwind Units**: Stick to 4, 6, 8, 12, 16 for consistency
- Screen padding: px-4 (16px horizontal margins)
- Section spacing: space-y-6 (24px vertical gaps)
- Input groups: space-y-4 (16px between fields)
- Touch targets: minimum h-12 (48px) for all interactive elements

## Profile Editing Components

### Full-Screen Mobile Dialog
- Slides up from bottom with backdrop blur
- Fixed header: white bg, shadow-sm
  - Left: "Cancel" text button (#6b7280)
  - Center: "Edit Profile" title (18px/semibold)
  - Right: "Save" button (#c084fc, medium weight)
- Scrollable content area below header
- Bottom safe-area padding for modern phones

### Profile Header Section
- Circular avatar: 96px diameter, centered
- "Change Photo" button underneath (text-only, #c084fc)
- Username display (@handle format, 14px, #6b7280)

### Form Input Architecture
**Text Inputs**:
- Height: 48px minimum (h-12)
- Border: 2px solid #e5e7eb, rounded-lg
- Focus state: border-purple (#c084fc), ring-2 ring-purple-100
- Padding: px-4 py-3
- Full-width with proper touch spacing

**Textarea** (for bio):
- Height: 120px (h-30)
- Allows resize vertically
- Same styling as text inputs

**Select Dropdowns**:
- Native mobile selectors for better UX
- Same height/styling as text inputs
- Chevron icon right-aligned

### Content Sections (Vertical Stack)
1. **Profile Photo** (centered)
2. **Display Name** (required field)
3. **Username** (read-only, light bg #f9fafb)
4. **Bio** (textarea, 500 char limit shown)
5. **Musical Role** (dropdown: Artist/Producer/DJ/Label/Fan/etc.)
6. **Location** (text input with optional flag emoji)
7. **Website/Links** (expandable section)
   - "+ Add Link" button (outline style, purple)
   - Link inputs appear with remove icon
8. **Genres** (multi-select chips)
   - Pill-shaped tags with x-remove
   - "+ Add Genre" shows bottom sheet selector
9. **Privacy Settings** (toggle switches)
   - Public Profile toggle
   - Show Activity toggle
   - Each with helper text below

### Interactive Elements
**Primary Buttons**: 
- Full-width on mobile
- Height: 48px, rounded-xl
- Purple bg (#c084fc), white text, semibold
- When on images: backdrop-blur-md, bg-white/20, text-white, border-2 border-white/40

**Secondary Buttons**:
- Outline style: border-2 border-purple, purple text
- Same height/radius as primary

**Toggle Switches**:
- Modern iOS-style, 48px wide
- Active state: purple (#c084fc)
- Inactive: #d1d5db

## Images
**Profile Hero Background** (Optional but Recommended):
- Full-width banner above profile section (aspect 3:1)
- Displays artist's branded image or abstract music visualization
- Semi-transparent overlay gradient (bottom-to-top) for readability
- Upload/change option in edit mode

**Avatar Image**:
- Default: Gradient circle with user initials
- Upload accepts: JPG, PNG, max 5MB
- Auto-crops to square

## Navigation Pattern
- Fixed bottom tab bar (if applicable to broader app)
- Back navigation: System gesture + header cancel button
- Unsaved changes prompt on exit attempt

## Validation & Feedback
- Inline error messages below fields (14px, #ef4444)
- Success toast: slides from top, green accent (#10b981)
- Loading states: purple spinner overlay for save action
- Required fields marked with asterisk

## Accessibility
- Minimum 44×44pt touch targets (exceeds 48px guideline)
- Sufficient contrast ratios (purple passes WCAG AA on white)
- Semantic labels for screen readers
- Focus indicators visible for keyboard navigation

This mobile-first profile editing experience prioritizes efficiency, visual clarity, and music community identity while maintaining Samsung Galaxy proportions through viewport-relative sizing.