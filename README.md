# 🔮 Wanderwise AI - Your Personal AI Travel Genie

Wanderwise AI is a smart, AI-powered travel planner that transforms a few simple inputs into fully-detailed, customizable, and bookable trip itineraries. Tell the genie your destination, budget, and vibe, and it will handle the rest, from planning daily activities to finding the perfect hotel.

![Wanderwise AI Demo](https://storage.googleapis.com/aifire.dev/public/wanderwise-demo.gif)

## ✨ Key Features

- **AI-Powered Itinerary Generation**: Enter a destination, duration, budget, and travel style, and our Genkit-powered AI generates multiple unique travel plans.
- **Interactive Vibe Selection**: Choose from distinct itinerary "vibes" like "Party Hopper," "Chilled Beach Bum," or "Nature & Adventure," presented in a playful, carousel-style UI.
- **Detailed Daily Plans**: Each itinerary includes a day-by-day breakdown with curated activities, approximate durations, estimated costs, and real review highlights.
- **Curated Accommodation & Commute Options**: Get a list of 3-5 hand-picked hotel and transportation options for each plan, complete with booking links, ratings, and pros/cons.
- **Dynamic & Transparent Budgeting**: An interactive cost calculator breaks down your expenses in real-time. See how your choices for hotels, activities, and transport affect your total budget.
- **Safety & Confidence Scores**: Every recommendation (hotel, activity, commute) comes with an AI-generated safety and confidence score (0-100) based on aggregated review sentiment, so you can book with peace of mind.
- **One-Click Final Summary**: "Book" your trip to see a final, polished summary page with all your selections, ready for you to share or use for booking.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **AI & Orchestration**: [Genkit](https://firebase.google.com/docs/genkit) (using Google's Gemini models)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

Follow these steps to get the project running on your local machine.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/vi-bs/Wanderwise-AI.git
    cd Wanderwise-AI
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the root of your project and add the following. You will need a Gemini API key for the AI features to work.
    ```env
    # Get your API key from Google AI Studio: https://aistudio.google.com/app/apikey
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```
    *Note: The project also includes scaffolding for an n8n workflow, but it is not required for the core AI functionality.*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application should now be running at [http://localhost:9002](http://localhost:9002).

## 📂 Project Structure

- **`/src/app`**: Contains all the pages and UI components for the Next.js application.
  - **`/src/app/page.tsx`**: The main landing page with the multi-step input form.
  - **`/src/app/results/page.tsx`**: The interactive itinerary results page.
  - **`/src/app/summary/page.tsx`**: The final trip summary page.
- **`/src/ai`**: Home to the Genkit AI flows.
  - **`/src/ai/flows/generate-personalized-itineraries.ts`**: The core AI flow that takes user input and generates structured travel plans using the Gemini model.
- **`/src/components`**: Shared UI components, including the ShadCN/UI library.
- **`/src/lib`**: Contains utility functions, type definitions (`types.ts`), and placeholder data.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
