# 🎨 Figma Setup Guide for WishMaker

Step-by-step guide to set up your Figma workspace for WishMaker UX design and prototyping.

## 📋 File Structure Setup

### 1. **Create Figma Team/Project**
```
Team: WishMaker Design System
├── 📁 Design System
│   ├── 🎨 Tokens & Foundations
│   ├── 🧩 Component Library
│   └── 📐 Layout Grids
├── 📁 Current Application
│   ├── 🔐 Authentication Screens
│   ├── 🏠 Dashboard & Navigation
│   ├── 🎯 Wish Management
│   └── 📱 Mobile Views
├── 📁 Enhanced Prototypes
│   ├── 🚀 UX Improvements
│   ├── 🎨 Visual Enhancements
│   └── 📊 Advanced Features
└── 📁 Handoff & Specs
    ├── 📏 Developer Specifications
    ├── 🎯 Component Documentation
    └── 📱 Responsive Guidelines
```

## 🎨 Design System Foundation

### Step 1: Create Design Tokens File

#### Color Styles Setup
```
1. Create new Figma file: "WishMaker Design Tokens"

2. Create Color Styles:
   Primary Colors:
   • primary-gradient-start → #667eea
   • primary-gradient-end → #764ba2
   • primary-solid → #667eea
   • primary-light → rgba(102, 126, 234, 0.1)

   Status Colors:
   • success → #4caf50
   • success-light → rgba(76, 175, 80, 0.1)
   • warning → #ff9800
   • warning-light → rgba(255, 152, 0, 0.1)
   • error → #f44336
   • error-light → rgba(244, 67, 54, 0.1)

   Neutral Colors:
   • white → #ffffff
   • gray-50 → #fafafa
   • gray-100 → #f5f5f5
   • gray-200 → #eeeeee
   • gray-300 → #e0e0e0
   • gray-500 → #9e9e9e
   • gray-700 → #616161
   • gray-900 → #212121

   Text Colors:
   • text-primary → #333333
   • text-secondary → #666666
   • text-disabled → #9e9e9e
   • text-inverse → #ffffff
```

#### Typography Styles Setup
```
3. Create Text Styles:

   Headlines:
   • Display: 48px, Bold, Line height 1.2
   • H1: 40px, Semibold, Line height 1.25
   • H2: 32px, Semibold, Line height 1.25
   • H3: 24px, Semibold, Line height 1.3

   Body Text:
   • Body Large: 19px, Regular, Line height 1.5
   • Body: 16px, Regular, Line height 1.5
   • Body Small: 14px, Regular, Line height 1.4
   • Caption: 12px, Regular, Line height 1.3

   Interactive:
   • Button Large: 16px, Medium, Line height 1
   • Button Small: 14px, Medium, Line height 1
   • Link: 16px, Medium, Line height 1.5
   • Input Label: 14px, Medium, Line height 1.2
```

#### Effect Styles (Shadows)
```
4. Create Effect Styles:
   • shadow-sm → Drop shadow: 0px 1px 2px rgba(0,0,0,0.05)
   • shadow-md → Drop shadow: 0px 4px 6px rgba(0,0,0,0.1)
   • shadow-lg → Drop shadow: 0px 10px 15px rgba(0,0,0,0.1)
   • shadow-xl → Drop shadow: 0px 20px 25px rgba(0,0,0,0.15)
   • focus-ring → Drop shadow: 0px 0px 0px 3px rgba(102,126,234,0.3)
```

### Step 2: Grid & Layout System

#### Layout Grids Setup
```
1. Desktop Grid (1200px max width):
   • Columns: 12
   • Gutter: 24px
   • Margin: Auto (centered)

2. Tablet Grid (768px):
   • Columns: 8
   • Gutter: 16px
   • Margin: 24px

3. Mobile Grid (375px):
   • Columns: 4
   • Gutter: 16px
   • Margin: 16px
```

#### Spacing System
```
Create spacing tokens using 8px base:
• 4px → space-1
• 8px → space-2
• 12px → space-3
• 16px → space-4
• 24px → space-6
• 32px → space-8
• 48px → space-12
• 64px → space-16
```

## 🧩 Component Library Creation

### Step 3: Create Component Library File

#### Atomic Components (Lowest Level)

##### Buttons
```
1. Create Button Component:
   Base: 40px height, 16px horizontal padding
   Variants:
   • Type: Primary, Secondary, Danger, Ghost
   • Size: Small (32px), Medium (40px), Large (48px)
   • State: Default, Hover, Active, Disabled, Loading

   Properties:
   • Icon: Boolean (show/hide icon)
   • Icon Position: Left, Right
   • Full Width: Boolean
   • Text: String (button label)
```

##### Form Inputs
```
2. Create Input Component:
   Base: 40px height, 12px padding, 8px border radius
   Variants:
   • Type: Text, Email, Password, Number, Textarea
   • State: Default, Focus, Error, Disabled, Valid

   Properties:
   • Label: String
   • Placeholder: String
   • Helper Text: String
   • Error Text: String
   • Required: Boolean
```

##### Icons
```
3. Create Icon Component:
   Base: 24px × 24px
   Variants:
   • Size: 16px, 20px, 24px, 32px
   • Color: Primary, Secondary, Success, Warning, Error

   Icon Set:
   • chevron-down, chevron-up, chevron-left, chevron-right
   • plus, minus, x, check
   • edit, delete, share, star
   • user, settings, logout, menu
   • eye, eye-off, search, filter
```

#### Molecular Components (Combined Elements)

##### Form Group
```
4. Create Form Group Component:
   Combines: Label + Input + Helper/Error Text

   Properties:
   • Input Type: Text, Email, Password, etc.
   • Label: String
   • Required: Boolean
   • Error State: Boolean
   • Error Message: String
```

##### Status Badge
```
5. Create Status Badge Component:
   Base: Pill shape, 12px text, 4px × 8px padding

   Variants:
   • Status: Pending, Fulfilled, Cancelled, Draft
   • Size: Small, Medium, Large

   Auto-styled based on status variant
```

##### Card Header
```
6. Create Card Header Component:
   Layout: Title + Optional Actions

   Properties:
   • Title: String
   • Show Actions: Boolean
   • Action Buttons: Edit, Delete, Share, etc.
```

#### Organism Components (Complex Components)

##### Wish Card
```
7. Create Wish Card Component:
   Structure:
   • Header: Title + Status Badge
   • Body: Description + Metadata
   • Footer: Date + Actions

   Variants:
   • View: Compact, Detailed, Grid
   • State: Default, Hover, Selected

   Properties:
   • Title: String
   • Description: String
   • Status: Pending/Fulfilled/Cancelled
   • Created Date: String
   • Show Actions: Boolean
```

##### Navigation Header
```
8. Create Header Component:
   Layout: Logo + Nav + User Menu

   Variants:
   • Device: Desktop, Tablet, Mobile
   • User State: Logged In, Logged Out

   Properties:
   • Show Navigation: Boolean
   • User Name: String
   • User Avatar: Image
```

##### Auth Forms
```
9. Create Login Form Component:
   Structure:
   • Email Input
   • Password Input
   • Submit Button
   • Switch to Register Link
   • WebAuthn Option (conditional)

   States:
   • Default: Ready for input
   • Loading: Submitting credentials
   • Error: Invalid credentials
   • Success: Successful login

10. Create Register Form Component:
   Structure:
   • Email Input
   • Password Input
   • Confirm Password Input
   • Terms Checkbox
   • Submit Button
   • Switch to Login Link
```

## 📱 Screen Design Templates

### Step 4: Create Screen Templates

#### Authentication Screens
```
1. Login Screen Template:
   Layout: Centered modal or full page
   Components: Login Form + Branding

   Variants:
   • Format: Modal, Full Page
   • Device: Desktop, Tablet, Mobile
   • WebAuthn: Available, Not Available

2. Register Screen Template:
   Layout: Similar to login
   Components: Register Form + Branding

   Additional Features:
   • Progress indicator (if multi-step)
   • Social registration options
   • Success confirmation state
```

#### Main Application Screens
```
3. Dashboard Template:
   Layout: Header + Main Content + Sidebar (desktop)

   Sections:
   • Quick Stats/Summary
   • Recent Wishes Preview
   • Quick Actions
   • Navigation

4. Wish List Template:
   Layout: Header + Filters + Wish Grid

   Components:
   • Filter Sidebar/Bar
   • Search Input
   • Sort Dropdown
   • Wish Cards Grid
   • Pagination (if needed)

5. Wish Detail Template:
   Layout: Header + Detail Content

   Components:
   • Wish Information Display
   • Action Buttons
   • Edit Form (toggle view)
   • Related Wishes
```

## 🎯 Prototyping Setup

### Step 5: Interactive Prototype Creation

#### Connection Setup
```
1. Page Flow Structure:
   Landing → Auth → Dashboard → Wish Management

2. Interaction Types:
   • On Click: Navigate to page
   • On Hover: Show tooltip/preview
   • While Pressing: Button press effect
   • After Delay: Auto-advance (onboarding)

3. Animation Settings:
   • Transition: Dissolve (300ms ease-out)
   • Smart Animate: For micro-interactions
   • Push: For mobile slide transitions
```

#### Overlay Setup
```
4. Modal Behaviors:
   • Login/Register: Center overlay
   • Confirmation Dialogs: Center overlay
   • User Menu: Position relative to trigger

5. Interactive Components:
   • Button States: Link hover/active states
   • Form Validation: Show error states on interaction
   • Loading States: Show spinner on form submit
```

### Step 6: Responsive Design Setup

#### Device Frames
```
1. Desktop Prototype:
   Frame: 1440px × 1024px (or custom)
   Layout: Full header + sidebar + main content

2. Tablet Prototype:
   Frame: 768px × 1024px
   Layout: Condensed header + main content

3. Mobile Prototype:
   Frame: 375px × 812px (iPhone X/11/12 size)
   Layout: Stack everything vertically
   Navigation: Bottom tabs or hamburger menu
```

#### Responsive Components
```
4. Create Responsive Variants:
   • Navigation: Desktop full → Mobile hamburger
   • Wish Cards: Desktop 3-col → Tablet 2-col → Mobile 1-col
   • Forms: Desktop 2-col → Mobile 1-col
   • Modals: Desktop fixed width → Mobile full screen
```

## 🎨 Advanced Features Setup

### Step 7: Enhanced UX Prototypes

#### Micro-interactions
```
1. Button Interactions:
   • Hover: Scale 1.02 + shadow increase
   • Press: Scale 0.98
   • Loading: Disable + spinner

2. Form Interactions:
   • Focus: Border color change + shadow
   • Validation: Error shake animation
   • Success: Green checkmark appear

3. List Interactions:
   • Item hover: Lift effect
   • Loading: Skeleton animation
   • Empty state: Illustration + call-to-action
```

#### Advanced Prototyping
```
4. Multi-step Flows:
   • Progress indicators
   • Step validation
   • Back/forward navigation
   • Save draft functionality

5. Dynamic Content:
   • Search results filtering
   • Real-time form validation
   • Conditional form fields
   • Smart suggestions
```

## 📋 Quality Checklist

### Design System Validation
- [ ] All colors defined as styles (not hardcoded)
- [ ] All typography uses text styles
- [ ] Consistent spacing using 8px grid
- [ ] All components have proper variants
- [ ] Interactive states defined for all clickable elements
- [ ] Responsive behavior planned for all screens

### Accessibility Considerations
- [ ] Color contrast meets WCAG AA standards (4.5:1 minimum)
- [ ] Focus states visible and clear
- [ ] Text size minimum 16px on mobile
- [ ] Touch targets minimum 44px × 44px
- [ ] Alternative text planned for images/icons
- [ ] Proper heading hierarchy maintained

### Prototype Testing
- [ ] All primary user flows work end-to-end
- [ ] Error states and edge cases included
- [ ] Loading states and transitions smooth
- [ ] Mobile prototype fully functional
- [ ] Realistic content used throughout
- [ ] Stakeholder feedback incorporated

## 🚀 Next Steps

### Phase 1: Foundation (Week 1)
1. Set up Figma workspace and team
2. Create design tokens and component library
3. Build basic screen templates
4. Set up responsive breakpoints

### Phase 2: Current State (Week 2)
1. Design pixel-perfect current screens
2. Create basic interactive prototypes
3. Document existing user flows
4. Identify improvement opportunities

### Phase 3: Enhanced Designs (Week 3-4)
1. Design improved user experiences
2. Create advanced interactive prototypes
3. Test with users and stakeholders
4. Iterate based on feedback

### Phase 4: Handoff Preparation (Week 5)
1. Create developer specification documents
2. Export assets and style guides
3. Prepare implementation roadmap
4. Set up design-development workflow

This comprehensive setup will give you a professional Figma workspace that mirrors your current WishMaker application and enables rapid prototyping of UX enhancements before implementation.

---

**🎯 Ready to Start**: Follow this guide step-by-step to create your Figma design system, then use it to prototype the UX improvements outlined in your application's TODO comments.