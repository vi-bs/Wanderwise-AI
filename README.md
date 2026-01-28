# 🔮 Wanderwise AI - Your Personal AI Travel Genie

Wanderwise AI is a smart, AI-powered travel planner that transforms a few simple inputs into fully-detailed, customizable, and bookable trip itineraries. Tell the genie your destination, budget, and vibe, and it will handle the rest, from planning daily activities to finding the perfect hotel.

![Wanderwise AI Demo](https://storage.googleapis.com/aifire.dev/public/wanderwise-demo.gif)

## ✨ Key Features

- **🤖 Multi-Agent AI System**: Advanced AI architecture with specialized agents for destination intelligence, activity discovery, accommodation booking, and cost estimation
- **🌍 Universal Destination Support**: Works for any destination worldwide with dynamic local transportation, cultural context, and authentic experiences
- **AI-Powered Itinerary Generation**: Enter a destination, duration, budget, and travel style, and our Genkit-powered AI generates multiple unique travel plans
- **Interactive Vibe Selection**: Choose from distinct itinerary "vibes" like "Cultural Immersion," "Adventure Seeker," or "Hidden Gems Explorer," presented in a playful, carousel-style UI
- **Detailed Daily Plans**: Each itinerary includes a day-by-day breakdown with curated activities, approximate durations, estimated costs, and real review highlights
- **Curated Accommodation & Commute Options**: Get a list of 3-6 hand-picked hotel and transportation options for each plan, complete with booking links, ratings, and pros/cons
- **Dynamic & Transparent Budgeting**: An interactive cost calculator breaks down your expenses in real-time. See how your choices for hotels, activities, and transport affect your total budget
- **Safety & Confidence Scores**: Every recommendation (hotel, activity, commute) comes with an AI-generated safety and confidence score (0-100) based on aggregated review sentiment, so you can book with peace of mind
- **One-Click Final Summary**: "Book" your trip to see a final, polished summary page with all your selections, ready for you to share or use for booking

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
    
    # Enable the new multi-agent system for comprehensive, destination-agnostic itineraries
    USE_MULTI_AGENT_SYSTEM=true
    
    # Set to true to use real AI calls (requires API key)
    USE_REAL_AI=false
    ```
    
    **Multi-Agent System**: The new multi-agent system provides realistic itineraries for any destination worldwide. Set `USE_MULTI_AGENT_SYSTEM=true` to enable it. For development, you can set `USE_REAL_AI=false` to use mock data and avoid API costs.

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
- **`/src/ai`**: Home to the Genkit AI flows and multi-agent system.
  - **`/src/ai/flows/generate-personalized-itineraries.ts`**: The main AI flow that coordinates itinerary generation.
  - **`/src/ai/flows/master-itinerary-orchestrator.ts`**: Master orchestrator for the multi-agent system.
  - **`/src/ai/flows/destination-intelligence-agent.ts`**: Gathers comprehensive destination information.
  - **`/src/ai/flows/activity-discovery-agent.ts`**: Discovers authentic local experiences and activities.
  - **`/src/ai/flows/accommodation-booking-agent.ts`**: Finds realistic accommodation options with booking links.
  - **`/src/ai/flows/cost-estimation-agent.ts`**: Provides accurate cost estimates and budget optimization.
- **`/src/components`**: Shared UI components, including the ShadCN/UI library.
- **`/src/lib`**: Contains utility functions, type definitions (`types.ts`), and placeholder data.
- **`/docs`**: Comprehensive documentation including multi-agent system architecture.

## 🤖 Multi-Agent System

Wanderwise AI features a sophisticated multi-agent system that creates realistic, destination-agnostic travel itineraries. Instead of hardcoded data, specialized AI agents research and plan trips for any destination worldwide.

**Key Agents**:
- **Destination Intelligence**: Local transportation, culture, costs, safety
- **Activity Discovery**: Authentic experiences, hidden gems, local events  
- **Accommodation Booking**: Real properties with genuine booking links
- **Cost Estimation**: Accurate pricing, hidden costs, budget optimization

For detailed information, see [Multi-Agent System Documentation](docs/multi-agent-system.md).

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
