# **App Name**: Travel Genie: AI Trip Planner

## Core Features:

- AI-Powered Itinerary Generation: Generates personalized travel itineraries based on user input (destination, dates, budget, preferences) using the Gemini 1.5 Flash model via an n8n multi-agent workflow. The LLM uses its tool to analyze and respond to preferences and information about various venues.
- Multi-Agent System: Utilizes an n8n multi-agent pipeline with specialized agents for input normalization, city intelligence, itinerary generation, cost estimation, review analysis, recommendation, and formal trip enhancement (if applicable).
- Customizable Itinerary Options: Presents 3 itinerary options based on different styles (activities, food, sightseeing) that users can further customize by selecting preferred flights, accommodations, and activities.
- Comprehensive Summary & Booking Links: Generates a final trip summary with a cost breakdown, safety score, booking search links (Google Search URLs only), and emergency tips.
- Downloadable PDF Itinerary: Creates a downloadable PDF document containing the complete itinerary, cost breakdown, safety score, booking links, and emergency tips, stored in Firebase Storage.
- Firestore Data Storage: Stores user data, trip details, selected itineraries, customizations, and final summaries in Firestore, ensuring data persistence and user-specific access.
- Webhook Triggered n8n Workflow: Triggers the n8n workflow via a webhook POST request from Firebase when the user clicks the 'Ask the Genie' button, passing the user input JSON for AI processing.

## Style Guidelines:

- Background color: Warm off-white (#FAF9F6) to create a calm and inviting feel.
- Foreground color: Near-black (#222222) for clear, legible text against the light background.
- Primary color: Muted violet to indigo gradient (#9400D3 to #4B0082) to evoke intelligence and modernity.
- Accent color: Pastel pink (#FFD1DC) to provide subtle highlights and create a soft, calming effect.
- Headline font: 'Belleza' (sans-serif) for large, airy headings to add a touch of personality and elegance.
- Body font: 'Alegreya' (serif) for comfortable line height and readability in longer text sections.
- Use a two-column grid on desktop (sticky form on the left, animated content area on the right) and a single-column layout on mobile with step-based navigation.
- Page and step transitions: Use Framer Motion with the '<AnimatePresence mode="wait">' component to create smooth, engaging content arrival animations with a duration of 0.35 seconds and an 'easeOut' easing function.
- Button interactions: Implement gentle glow on hover for primary CTA gradient buttons, and use a press animation (scale to 0.98) for a haptic-like feel.
- Loading states: Utilize skeleton loaders with shimmer effects and friendly loading copy (e.g., 'Your trip is taking shape…') instead of spinners.
- Use subtle and elegant icons that align with the app's premium, trustworthy, and emotionally reassuring feel.