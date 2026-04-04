# Motif — Turn a feeling into a design direction

![Motif Hero](https://huggingface.co/front/thumbnails/v2-2.png) 
*An AI-powered creative brief and moodboard generator designed to instantly bridge the gap between abstract feelings and concrete design systems.*

## Overview

Motif uses generative AI to instantly translate a simple description or "vibe" into a fully fleshed-out design direction. The application dynamically streams a cohesive moodboard consisting of a color palette, typography suggestions, tone of voice guidelines, and mood images—all presented in a beautiful, highly polished interface. 

It is built with a heavy focus on high-quality UI/UX aesthetics, responsive layouts, micro-animations, and seamless user interaction.

## ✨ Key Features

- **Generative UI Streaming:** Watch your design system come to life in real-time. Instead of a standard loading spinner, Motif streams the generated text, color palettes, and typographic rationale into the UI as it parses the AI response.
- **Strict Data Validation:** Employs `zod` schema parsing at the network edge to strictly typecast and validate AI responses before they interact with the React component tree.
- **Accessibility & Contrast Engine:** Utilizes `chroma-js` to mathematically derive dynamic background tints and enforce WCAG AA contrast standards. Features widespread `aria-live` tags and semantic properties ensuring screen reader support during live generative streams.
- **Resilient Fallbacks:** Implements custom Next.js Error Boundaries ensuring continuous uptime and graceful UI degradation if downstream LLM APIs hallucinate or time out.
- **Dynamic Image Integration:** Leverages cutting-edge image models (`FLUX.1-schnell`) to actively generate contextual mood images based on the requested vibe.
- **Client-Side URL Compression:** Allows users to easily share full moodboards without server-side storage overhead. Motif uses `lz-string` and payload stripping to package the entire board directly into a highly compressed, shareable URL.
- **Export to PNG:** Includes flawless DOM-to-Canvas screenshot captures allowing users to export their generated design brief as high-quality `.png` artifacts using `html2canvas`.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Vanilla CSS (for custom grain overlays, glassmorphism, and cinematic fade animations).
- **Core AI Integration:** 
  - **Google Gemini API** (`@google/generative-ai`) for robust language and design reasoning.
  - **Hugging Face Serverless Inference** for generating fast, highly-aesthetic mood pictures.
- **Data & Safety:** `zod` for zero-trust runtime schema validation of AI payloads.
- **Accessibility:** `chroma-js` for dynamic color mathematics, high-fidelity ARIA markup for streaming contexts.
- **Utilities:** `html2canvas` for precise layout capturing, `lz-string` for extreme URL state compression.

## Getting Started

### Prerequisites
Make sure you have Node.js installed. You will also need API keys for Google Gemini and Hugging Face.

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/motif.git
   cd motif
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   HF_API_KEY=your_hugging_face_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.*

### Performance Optimization

This project enforces strict core web vitals and monitors its JavaScript payload using `@next/bundle-analyzer`.
To visualize the client and server application bundles:

```bash
npm run analyze
```
This will run a build map mapping out all dependencies and chunk sizes in your browser, helping you pinpoint large unoptimized packages.

## Author

Created by **Mithun Srinivasa**.
