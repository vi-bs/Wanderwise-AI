# Wanderwise AI - Design & Architecture

This document provides a comprehensive overview of the design philosophy, architecture, and technical implementation of Wanderwise AI. It's intended for developers who want to understand the "why" behind the code.

## 1. Core Philosophy

-   **AI-First & User-Centric**: The application is built around the core AI itinerary generation flow. Every UI/UX decision is made to make this process intuitive, engaging, and fast.
-   **Interactive & Playful**: Travel planning should be exciting, not a chore. The UI aims to be "quirky, gen-z playable" with smooth transitions, micro-interactions (Framer Motion), and a conversational tone.
-   **Structured & Actionable**: The AI's output isn't just text; it's structured, actionable data (via Zod schemas). This allows for a rich, interactive UI where users can customize, calculate costs, and click real booking links.
-   **Component-Driven Development**: The UI is built using a composition of reusable components (ShadCN/UI) and view-specific components, promoting consistency and maintainability.

## 2. Application Flow and Architecture

Wanderwise AI follows a modern full-stack TypeScript architecture, separating the frontend presentation layer from the AI backend logic. The user's journey from opening the app to getting a finalized plan is outlined in the flowchart below.

![Application Flow Diagram](https://storage.googleapis.com/aifire.dev/public/wanderwise-flowchart.png)

The key stages are:
1.  **Start & Onboarding**: The user opens the app and is greeted by the AI travel companion.
2.  **Input Collection**: A multi-step form (`MultiStepInputForm`) captures the user's destination, budget, duration, and preferences.
3.  **AI Activation**: The frontend calls the primary Genkit flow (`generatePersonalizedItineraries`). This flow acts as a master agent, using the user's input to generate a detailed prompt for the LLM.
4.  **Itinerary Generation**: The LLM returns a structured JSON object containing multiple distinct itineraries, which is then parsed and stored.
5.  **Interactive Results**: The user explores the generated plans on the results page, customizing activities, hotels, and transport.
6.  **Final Summary**: A final summary page presents the user's "booked" trip.

---

## 3. Frontend (Next.js)

The frontend is located entirely within the `/src/app` and `/src/components` directories.

### 3.1. Routing (App Router)

-   `/`: The main landing and input page (`HomePage`), featuring the multi-step form.
-   `/results`: The interactive results page (`ResultsPage`) where users explore and customize AI-generated itineraries.
-   `/summary`: The final "booking confirmation" page (`SummaryPage`) that shows a polished summary of the user's selected trip.
-   `/dashboard`: A placeholder for users to see their past trips.
-   `/(auth)/*`: Pages for login and signup.

### 3.2. State Management

-   **React Hooks (`useState`, `useEffect`, `useMemo`)**: Used for local component state (e.g., managing the active itinerary, selected options).
-   **React Hook Form**: Manages the state of the complex multi-step input form (`MultiStepInputForm`), including validation with Zod.
-   **`localStorage`**: Used as a simple, client-side "database" to pass large JSON payloads between pages without complex state management libraries. This approach was chosen for its simplicity and to avoid the overhead of a global state library like Redux or Zustand for a two-page data passing scenario.
    -   `tripRequest`: Stores the user's initial form input.
    -   `tripResults`: Stores the full, structured JSON response from the Genkit AI flow.
    -   `finalTripSummary`: Stores the user's final selections to be displayed on the `/summary` page.

### 3.3. Component Structure

-   **`/components/ui`**: Contains the base, unstyled UI primitives from **ShadCN/UI** (e.g., `Button`, `Card`, `Input`). These are the building blocks.
-   **`/components/layout`**: Components that define the overall page structure, like the `Header`.
-   **`/components/views`**: Larger, more complex components that are specific to a certain view or page.
    -   `multi-step-input-form.tsx`: The core component on the homepage for collecting user preferences.

### 3.4. Styling & Animation

-   **Tailwind CSS**: Used for all utility-first styling.
-   **ShadCN/UI & CSS Variables**: The theme is defined in `/src/app/globals.css` using HSL CSS variables, following ShadCN's theming conventions. This makes it easy to adjust the color palette (`--primary`, `--background`, etc.) sitewide.
-   **Custom Fonts**: The app uses 'Belleza' for headlines and 'Alegreya' for body text, configured in `tailwind.config.ts` and loaded in `layout.tsx`.
-   **Framer Motion**: Used for all significant animations and transitions (page loads, step changes in the form, itinerary selection) to create a smooth, "playable" feel.

---

## 4. AI Backend (Genkit)

The AI logic is co-located with the frontend code but logically separate, residing in the `/src/ai` directory.

### 4.1. Flow-Based Architecture

-   **`/ai/flows/generate-personalized-itineraries.ts`**: This is the heart of the application. It defines a Genkit flow (`generateItinerariesFlow`) responsible for the entire AI generation process.
-   **Wrapper Function**: An exported async function (`generatePersonalizedItineraries`) acts as a clean interface for the frontend to call the flow.

### 4.2. Structured Input/Output with Zod

-   **Input Schema (`GeneratePersonalizedItinerariesInputSchema`)**: A Zod schema defines the exact shape of the data the flow expects from the frontend. This ensures type safety and validation.
-   **Output Schema (`GeneratePersonalizedItinerariesOutputSchema`)**: A comprehensive set of nested Zod schemas defines the structure of the JSON the AI model is *required* to return. This is the key to creating a reliable, interactive UI. It forces the LLM to think in terms of structured data, not just freeform text.

### 4.3. Prompt Engineering

-   The prompt (`itineraryGeneratorPrompt`) is carefully engineered with several key instructions:
    1.  **Persona**: "You are an expert travel planner AI."
    2.  **Explicit Goal**: Generate 3 distinct, detailed, and realistic travel itineraries.
    3.  **Critical Instructions**: A numbered list of non-negotiable rules (e.g., "Generate Exactly 3 Itineraries," "Realistic & Actionable Data," "Strict JSON Output").
    4.  **Data Injection**: User input is injected directly into the prompt using Handlebars syntax (e.g., `{{{destination}}}`).
    5.  **Schema Adherence**: The prompt explicitly tells the model to adhere to the provided output schema.

---

## 5. Data Flow (User to UI)

1.  **Input**: User fills out the `MultiStepInputForm` on the `HomePage`.
2.  **Submit**: On submit, `handleFormSubmit` is called. It stringifies the form data and saves it to `localStorage` (`tripRequest`).
3.  **AI Call**: It then calls the `generatePersonalizedItineraries` Genkit flow.
4.  **Generation**: The flow executes, sending the structured prompt to the Gemini LLM.
5.  **Response**: The LLM returns a large, structured JSON object.
6.  **Storage**: The result is saved to `localStorage` (`tripResults`).
7.  **Redirect**: The user is redirected to the `/results` page.
8.  **Hydration**: `ResultsPage` reads the request and results from `localStorage` and hydrates its state, powering the interactive UI.
9.  **Finalize**: When the user clicks "Finalize & Book Trip", the selected itinerary, hotels, costs, etc., are bundled into a new object and saved to `localStorage` (`finalTripSummary`).
10. **Summary**: A new tab opens to the `/summary` page, which reads from `finalTripSummary` to display the final confirmation.

This `localStorage`-based approach is simple and effective for this specific two-page data-passing scenario, avoiding the need for a more complex global state solution.

---

## 6. Future Directions

- **User Accounts**: Implement Firebase Authentication to allow users to save and view their past trips in the `/dashboard`.
- **Map Integration**: As shown in the flowchart, an interactive map could be added to the results and summary pages to visualize the trip route and activity locations.
- **Real-time Collaboration**: Allow multiple users to plan a trip together.
- **Ancillary AI Agents**: Fully integrate the `analyzeReviewsForRecommendations` and `enhanceFormalTrip` flows to provide deeper insights and specialized planning adjustments.