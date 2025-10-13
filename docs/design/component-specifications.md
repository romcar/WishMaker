# 🔧 WishMaker Component Specifications

Detailed specifications for recreating and enhancing WishMaker components in Figma.

## 🎨 Design Tokens

### Colors
```css
/* Primary Palette */
--primary-gradient-start: #667eea;
--primary-gradient-end: #764ba2;
--primary-solid: #667eea;
--primary-light: rgba(102, 126, 234, 0.1);
--primary-dark: #5a6fd8;

/* Status Colors */
--success: #4caf50;
--success-light: rgba(76, 175, 80, 0.1);
--warning: #ff9800;
--warning-light: rgba(255, 152, 0, 0.1);
--error: #f44336;
--error-light: rgba(244, 67, 54, 0.1);
--info: #2196f3;
--info-light: rgba(33, 150, 243, 0.1);

/* Neutral Palette */
--white: #ffffff;
--gray-50: #fafafa;
--gray-100: #f5f5f5;
--gray-200: #eeeeee;
--gray-300: #e0e0e0;
--gray-400: #bdbdbd;
--gray-500: #9e9e9e;
--gray-600: #757575;
--gray-700: #616161;
--gray-800: #424242;
--gray-900: #212121;

/* Text Colors */
--text-primary: #333333;
--text-secondary: #666666;
--text-disabled: #9e9e9e;
--text-inverse: #ffffff;

/* Surface Colors */
--surface-primary: #ffffff;
--surface-secondary: #f5f5f5;
--surface-overlay: rgba(255, 255, 255, 0.95);
--surface-modal: rgba(0, 0, 0, 0.5);
```

### Typography
```css
/* Font Family */
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;

/* Font Sizes */
--text-xs: 12px;      /* 0.75rem */
--text-sm: 14px;      /* 0.875rem */
--text-base: 16px;    /* 1rem */
--text-lg: 19px;      /* 1.2rem */
--text-xl: 24px;      /* 1.5rem */
--text-2xl: 32px;     /* 2rem */
--text-3xl: 40px;     /* 2.5rem */
--text-4xl: 48px;     /* 3rem */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing Scale
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

### Border Radius
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

## 🧩 Component Specifications

### Buttons

#### Primary Button
```
Size: Height 40px, Padding 16px 24px
Background: Linear gradient (#667eea → #764ba2)
Text: White, 16px, Medium weight
Border: None
Radius: 8px
Shadow: 0 2px 4px rgba(102, 126, 234, 0.2)

States:
- Default: Full gradient
- Hover: Opacity 0.9, shadow increase
- Active: Scale 0.98, shadow decrease
- Disabled: Opacity 0.5, no pointer events
- Loading: Spinner icon, text "Loading..."
```

#### Secondary Button
```
Size: Height 40px, Padding 16px 24px
Background: White
Text: Primary color (#667eea), 16px, Medium weight
Border: 1px solid #e0e0e0
Radius: 8px
Shadow: 0 1px 2px rgba(0, 0, 0, 0.05)

States:
- Default: White background, gray border
- Hover: Light primary background (rgba(102, 126, 234, 0.05))
- Active: Deeper primary background (rgba(102, 126, 234, 0.1))
- Disabled: Gray text, gray border
```

#### Danger Button
```
Size: Height 40px, Padding 16px 24px
Background: #f44336
Text: White, 16px, Medium weight
Border: None
Radius: 8px
Shadow: 0 2px 4px rgba(244, 67, 54, 0.2)

States:
- Default: Error red background
- Hover: Darker red (#d32f2f)
- Active: Scale 0.98
- Disabled: Opacity 0.5
```

### Form Inputs

#### Text Input
```
Size: Height 40px, Padding 12px 16px
Background: White
Border: 1px solid #e0e0e0
Radius: 8px
Font: 16px, Regular weight
Placeholder: #9e9e9e color

States:
- Default: Gray border
- Focus: Primary border (#667eea), blue shadow
- Error: Red border (#f44336), red shadow
- Disabled: Gray background, gray text
- Valid: Green border (#4caf50)
```

#### Form Group Layout
```
Structure:
- Label: 14px, Medium weight, 8px bottom margin
- Input: Standard input specifications
- Helper Text: 12px, Gray (#666), 4px top margin
- Error Text: 12px, Red (#f44336), 4px top margin
- Spacing: 16px between form groups
```

### Cards

#### Wish Card
```
Size: Min height 180px, Width fluid
Background: White
Border: 1px solid #e0e0e0
Radius: 12px
Padding: 24px
Shadow: 0 2px 8px rgba(0, 0, 0, 0.08)

Layout:
- Header: Title (18px, Semibold) + Status badge
- Body: Description (14px, Regular, Gray)
- Footer: Date + Actions (Edit/Delete buttons)
- Spacing: 16px between sections

States:
- Default: White background, subtle shadow
- Hover: Lift shadow (0 4px 12px rgba(0, 0, 0, 0.12))
- Selected: Primary border, primary shadow
```

#### Status Badge
```
Pending:
- Background: rgba(255, 152, 0, 0.1)
- Text: #ff9800, 12px, Medium
- Padding: 4px 8px
- Radius: 12px (pill shape)

Fulfilled:
- Background: rgba(76, 175, 80, 0.1)
- Text: #4caf50, 12px, Medium
- Padding: 4px 8px
- Radius: 12px

Cancelled:
- Background: rgba(244, 67, 54, 0.1)
- Text: #f44336, 12px, Medium
- Padding: 4px 8px
- Radius: 12px
```

### Modal/Overlay

#### Auth Modal
```
Overlay:
- Background: rgba(0, 0, 0, 0.5)
- Full viewport coverage
- Backdrop blur effect (optional)

Modal:
- Width: 400px (mobile: 90vw max 350px)
- Background: White
- Radius: 16px
- Padding: 32px
- Shadow: 0 20px 25px rgba(0, 0, 0, 0.15)
- Position: Centered

Close Button:
- Size: 32px × 32px
- Position: Top right, 16px margins
- Icon: × symbol, 18px
- Background: Transparent → Gray on hover
```

### Navigation

#### Header
```
Height: 80px
Background: rgba(255, 255, 255, 0.95)
Shadow: 0 2px 10px rgba(0, 0, 0, 0.1)
Padding: 0 32px (desktop), 0 16px (mobile)

Layout:
- Left: Logo + App name
- Center: Navigation (desktop only)
- Right: User menu + Actions
- Max width: 1200px, centered
```

#### User Menu Dropdown
```
Trigger: User avatar (40px circle) + Name
Dropdown:
- Width: 200px
- Background: White
- Border: 1px solid #e0e0e0
- Radius: 8px
- Shadow: 0 8px 16px rgba(0, 0, 0, 0.15)
- Position: Below trigger, right-aligned

Menu Items:
- Height: 40px each
- Padding: 12px 16px
- Font: 14px, Medium
- Hover: Light gray background
- Dividers: 1px gray lines
```

## 📱 Responsive Breakpoints

### Mobile (320px - 767px)
```
Container: 16px margins
Typography: Slightly smaller (reduce by 2-4px)
Buttons: Full width on forms
Cards: Single column
Modal: 90vw width, 16px margins
Header: Collapsed navigation, hamburger menu
```

### Tablet (768px - 1023px)
```
Container: 24px margins
Cards: 2-column grid
Modal: Fixed 500px width
Header: Condensed navigation
Form: 2-column layouts where appropriate
```

### Desktop (1024px+)
```
Container: Max 1200px, centered
Cards: 3-4 column grid (depending on content)
Modal: Fixed 600px width for larger forms
Header: Full navigation visible
Form: Multi-column layouts
```

## 🎯 Interactive States

### Micro-interactions
```
Button Press: Scale 0.98, 100ms ease-out
Card Hover: translateY(-2px), shadow increase, 200ms ease-out
Input Focus: Border color transition, 150ms ease-out
Modal Open: Scale from 0.9 to 1.0, opacity 0 to 1, 300ms ease-out
Toast/Alert: slideInRight, 250ms ease-out
Loading: Spinner rotation, 1s linear infinite
```

### Animation Timing
```
Micro (hover, button press): 100-150ms
Standard (modal, drawer): 250-300ms
Complex (page transition): 400-500ms
Loading states: 1s+ (or until complete)
```

### Focus Management
```
Tab Order: Logical flow through interactive elements
Focus Visible: 2px solid primary color outline
Skip Links: Hidden until focused
Keyboard Navigation: Arrow keys for menus, Enter for activation
```

## 🎨 Design Patterns

### Empty States
```
Layout: Centered content, 40% viewport height
Icon: 64px illustration or icon, gray color
Title: 20px, Semibold, "No wishes yet"
Description: 14px, Gray, helpful explanation
Action: Primary button, "Create your first wish"
```

### Loading States
```
Skeleton: Gray backgrounds matching content structure
Spinner: 24px, primary color, centered
Progress: Linear bar, primary gradient
Text: "Loading..." with spinner icon
```

### Error States
```
Inline: Red text, 12px, below form fields
Toast: Red background, white text, auto-dismiss
Page: Error icon + message + retry button
Network: Offline indicator + retry mechanism
```

### Success States
```
Confirmation: Green checkmark + success message
Toast: Green background, white text, 3s duration
Form: Green border + success icon
Page: Success icon + next steps
```

This comprehensive specification gives you everything needed to recreate your current WishMaker interface in Figma and design enhanced versions. Each component includes all visual states, measurements, and interaction behaviors needed for both design and development handoff.

---

**🎯 Next Action**: Use these specifications to build your Figma component library, then create enhanced versions of each screen with the UX improvements outlined in the main documentation.