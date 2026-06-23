# Kalakar Sneha — Fine Art Tutor & Drawing Portfolio

An immersive, highly polished traditional art portfolio and fine-art mentoring platform designed for **Kalakar Sneha**, a traditional visual discipline mentor based in Morena, Madhya Pradesh, India.

---

## 🎨 Visual Identity & Purpose

This portfolio is crafted to reflect the precision, structure, and integrity of academic drawing. Guided by traditional aesthetics, it matches high-contrast typography, generous negative space, and deep graphite accents to represent charcoal, ink, and pencil disciplines.

- **Primary Motif**: Architectural guidelines, sacred geometries, and light/dark values referencing classical direct study.
- **Aesthetic Pairings**: Elegant, high-contrast serif headers paired with legible "Inter" sans-serif copy and "JetBrains Nano" monospace markers for status and technical details.
- **Interactive Focus**: Standard-setting micro-interactions, responsive 3D-flipping cards, and animated routes to enrich student engagement.

---

## 🏛️ Core Features

### 1. Unified Responsive Navigation
- **Dynamic Scroll Tracker**: Highlights the active section on scroll.
- **Interactive Hamburger Drawer**: Full-screen sidebar drawer optimized for mobile and touchscreen navigation.
- **High-Contrast Theme Engine**: Adapts to user preferences with an immediate light/dark toggle.

### 2. Immersive Hero Structure
- Decorative technical sketching lines, golden ratio scaffolding, and smooth entering transitions representing a canvas in progress.

### 3. Comprehensive Traditional Curriculum (Lessons)
- Detailed exploration of fundamental and expert courses representing architectural perspective, human anatomy, charcoal rendering, and ink washes.
- **Interactive Self-Assessment**: A custom, real-time questionnaire helping aspiring artists self-classify their placement path.

### 4. 3D-Flipping Gallery Deck
- High-fidelity visual showcase of Sneha's fine art works (charcoals, graphite, pen and ink).
- Each artwork features realistic 3D-rotating flip cards hosting medium, sizing details, and structural perspective notes.

### 5. Interactive Achievements Plaque
- Spotlights verified credentials, national tutor honors, and traditional academy accreditations.
- Includes flippable credential containers providing in-depth details about Sneha's professional teaching pedigree.

### 6. Student Showroom
- Displays exemplary works made by alumni under Sneha's direct guidance.
- Focuses on trust metrics, actual prize victories, and includes direct links to explore standard curriculums.

### 7. Administrative Editor Suite (Admin Panel)
A robust, secure back-office admin system that operates with instant persistence:
- **Passphrase-Protected Security**: Direct local token authorization validation.
- **Live Content Context Manager**: Full control over title texts, social handles, achievements metrics, studio locations, contact details, and student projects.
- **Global Actions Orchestrator**: Direct controls to modify redirect links and call-to-action details (such as the bottom showroom banner buttons) in real-time.

---

## 🛠️ Technological Stack

- **Framework**: React 18+ with Vite (TypeScript type-safety)
- **Styling**: Tailwind CSS utility structure
- **Animation**: Micro-transitions and fluid state changes via Motion (`motion/react`)
- **Icons**: Lucide-React SVG library
- **Persistence**: High-performance local ContentContext API serving synchronized data real-time.

---

## 📁 Project Structure

```bash
├── src
│   ├── components      # Modular React UI views (Hero, About, Gallery, Lessons, Admin, etc.)
│   ├── context         # Central ContentContext API managing real-time edits and states
│   ├── data            # JSON static default definitions acting as standard site blueprints
│   ├── App.tsx         # Root component layering sections dynamically
│   ├── main.tsx        # Vite application bootstrap point
│   ├── types.ts        # Fully documented, strictly declared TypeScript interface guidelines
│   └── index.css       # Tailwind CSS base styling with custom 3D perspective animations
├── index.html          # Shell HTML container with customized artist pencil favicon
├── package.json        # Manifest specifying scripts and dependencies
└── tsconfig.json       # Type system rules for compiler strictness
```
