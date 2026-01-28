# Multi-Agent System Architecture

## Overview

Wanderwise AI now features a sophisticated multi-agent system that creates realistic, destination-agnostic travel itineraries. Instead of relying on hardcoded data, the system uses specialized AI agents that work together to research and plan trips for any destination worldwide.

## Agent Architecture

### 🧠 Master Orchestrator
**File**: `src/ai/flows/master-itinerary-orchestrator.ts`

The master orchestrator coordinates all specialized agents and synthesizes their outputs into comprehensive itineraries. It manages the workflow and ensures all agents work together seamlessly.

**Responsibilities**:
- Coordinate agent execution in optimal sequence
- Synthesize agent outputs into final itineraries
- Handle error recovery and fallback strategies
- Ensure data consistency across agents

### 📍 Destination Intelligence Agent
**File**: `src/ai/flows/destination-intelligence-agent.ts`

Gathers comprehensive information about any destination including local transportation, costs, culture, and logistics.

**Capabilities**:
- Climate and weather analysis
- Local transportation research (Metro, Tuk-tuks, Ferries, etc.)
- Currency and cost analysis
- Cultural customs and etiquette
- Safety assessment
- Visa and logistics information

**Example Output**:
```typescript
{
  destination: "Bangkok, Thailand",
  transportation: [
    {
      type: "BTS Skytrain",
      costRange: { min: 50, max: 150 },
      pros: ["Fast", "Air-conditioned", "Covers main areas"],
      cons: ["Limited coverage", "Crowded during rush hour"],
      safetyScore: 95
    },
    {
      type: "Tuk-tuk",
      costRange: { min: 200, max: 500 },
      pros: ["Authentic experience", "Good for short distances"],
      cons: ["No AC", "Traffic jams", "Negotiation required"],
      safetyScore: 75
    }
  ]
}
```

### 🎯 Activity Discovery Agent
**File**: `src/ai/flows/activity-discovery-agent.ts`

Discovers authentic local experiences, attractions, and activities tailored to traveler preferences.

**Capabilities**:
- Research destination-specific activities
- Find hidden gems and local experiences
- Categorize activities by type and difficulty
- Provide seasonal availability information
- Include booking and logistics information

**Example Output**:
```typescript
{
  categories: [
    {
      category: "Cultural Experiences",
      activities: [
        {
          name: "Traditional Thai Cooking Class at Baipai",
          duration: "4 hours",
          cost: 2500,
          location: "Thonglor District",
          bookingRequired: true,
          localTips: ["Book in advance", "Vegetarian options available"]
        }
      ]
    }
  ]
}
```

### 🏨 Accommodation Booking Agent
**File**: `src/ai/flows/accommodation-booking-agent.ts`

Finds realistic accommodation options with genuine booking links and detailed analysis.

**Capabilities**:
- Research actual properties in the destination
- Provide real booking links from major platforms
- Analyze different price categories
- Consider location and transportation access
- Include genuine review analysis

**Example Output**:
```typescript
{
  accommodationOptions: [
    {
      name: "Mandarin Oriental Bangkok",
      category: "Luxury",
      costPerNight: 15000,
      bookingLink: "https://www.booking.com/hotel/th/mandarin-oriental-bangkok.html",
      location: {
        area: "Silom",
        distanceToCenter: "2 km",
        nearbyAttractions: ["Wat Pho", "Grand Palace"]
      }
    }
  ]
}
```

### 💰 Cost Estimation Agent
**File**: `src/ai/flows/cost-estimation-agent.ts`

Provides accurate cost estimates including flights, accommodation, food, and hidden costs.

**Capabilities**:
- Research current flight prices from India
- Analyze local cost of living
- Factor in seasonal price variations
- Identify hidden costs and fees
- Provide budget optimization strategies

**Example Output**:
```typescript
{
  totalTripCost: {
    budget: 45000,
    midRange: 75000,
    luxury: 150000
  },
  costBreakdown: {
    flights: { average: 25000 },
    accommodation: [
      { category: "Budget", costPerNight: 1500 },
      { category: "Mid-Range", costPerNight: 4000 }
    ],
    food: { dailyCost: { total: 1200 } }
  }
}
```

## Workflow Process

### Phase 1: Intelligence Gathering
1. **Destination Intelligence Agent** analyzes the destination
2. Gathers local context, transportation, costs, and cultural information

### Phase 2: Parallel Discovery
1. **Activity Discovery Agent** finds authentic experiences
2. **Accommodation Booking Agent** researches lodging options
3. Both agents use destination intelligence for context

### Phase 3: Cost Analysis
1. **Cost Estimation Agent** analyzes all gathered data
2. Provides comprehensive cost breakdowns and optimization tips

### Phase 4: Synthesis
1. **Master Orchestrator** combines all agent outputs
2. Creates 3 distinct, comprehensive itineraries
3. Ensures logical flow and practical logistics

## Configuration

### Environment Variables

```bash
# Enable multi-agent system
USE_MULTI_AGENT_SYSTEM=true

# Use real AI calls (requires API key)
USE_REAL_AI=true

# Google Gemini API Key
GEMINI_API_KEY="your_api_key_here"
```

### Development vs Production

**Development Mode**:
- Set `USE_REAL_AI=false` for faster development with mock data
- Set `USE_MULTI_AGENT_SYSTEM=false` to use original single-agent system

**Production Mode**:
- Set `USE_REAL_AI=true` for real AI-generated content
- Set `USE_MULTI_AGENT_SYSTEM=true` for comprehensive itineraries

## Benefits of Multi-Agent System

### 🌍 Destination Agnostic
- Works for any destination worldwide
- No hardcoded data or location-specific logic
- Adapts to local transportation and cultural context

### 🎯 Specialized Expertise
- Each agent focuses on its area of expertise
- Better quality outputs through specialization
- Easier to maintain and extend

### 🔄 Scalable Architecture
- Easy to add new agents for specific functions
- Parallel processing for better performance
- Modular design for independent development

### 📊 Realistic Data
- Real booking links and current pricing
- Authentic local experiences and hidden gems
- Accurate cost estimates and cultural insights

### 🛡️ Robust Error Handling
- Graceful fallback to single-agent system
- Individual agent error recovery
- Mock data fallback for development

## Usage Examples

### Basic Usage
```typescript
import { generatePersonalizedItineraries } from '@/ai/flows/generate-personalized-itineraries';

const result = await generatePersonalizedItineraries({
  destination: "Kyoto, Japan",
  duration_days: "5",
  budget_range_inr: "80000-120000",
  people_count: "2",
  preferences: ["Cultural experiences", "Traditional food", "Temples"],
  travel_dates: "March 2024"
});
```

### Direct Agent Usage
```typescript
import { gatherDestinationIntelligence } from '@/ai/flows/destination-intelligence-agent';

const intelligence = await gatherDestinationIntelligence({
  destination: "Bali, Indonesia",
  duration_days: 7,
  budget_range_inr: "60000-90000",
  people_count: 2,
  travel_dates: "July 2024"
});
```

## Future Enhancements

### Planned Agents
- **Review Analysis Agent**: Real-time review sentiment analysis
- **Weather Integration Agent**: Dynamic weather-based recommendations
- **Event Discovery Agent**: Local events and festivals
- **Transportation Booking Agent**: Real-time booking integration

### Advanced Features
- **Real-time Data Integration**: Live pricing and availability
- **Personalization Engine**: Learning from user preferences
- **Collaborative Planning**: Multi-user trip planning
- **Dynamic Optimization**: Real-time itinerary adjustments

## Troubleshooting

### Common Issues

**Agent Timeout**:
- Increase timeout values in Genkit configuration
- Implement retry mechanisms for failed agents

**API Rate Limits**:
- Implement exponential backoff
- Use caching for repeated requests

**Data Inconsistency**:
- Validate agent outputs with Zod schemas
- Implement data reconciliation logic

### Debugging

Enable detailed logging:
```bash
DEBUG=true npm run dev
```

Monitor agent execution:
```bash
npm run genkit:dev
```

## Contributing

When adding new agents:

1. Create agent file in `src/ai/flows/`
2. Define input/output Zod schemas
3. Implement specialized prompt engineering
4. Add agent to master orchestrator
5. Update type definitions
6. Add comprehensive tests
7. Update documentation

Each agent should be:
- **Focused**: Single area of expertise
- **Reusable**: Usable by other agents
- **Robust**: Handle errors gracefully
- **Documented**: Clear purpose and usage