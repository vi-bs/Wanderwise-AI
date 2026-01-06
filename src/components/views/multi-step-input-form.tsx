
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight, Globe, Waves, PartyPopper, Utensils, Trees, Palmtree, Users, Calendar, Briefcase, Sparkles, Wallet } from 'lucide-react';
import type { GeneratePersonalizedItinerariesInput } from '@/ai/flows/generate-personalized-itineraries';
import { useState } from 'react';

const preferencesOptions = [
  { label: "Food", icon: Utensils },
  { label: "Beaches", icon: Waves },
  { label: "Nightlife", icon: PartyPopper },
  { label: "Culture", icon: Palmtree },
  { label: "Nature", icon: Trees },
];

const formSchema = z.object({
  destination: z.string().min(2, { message: 'Please enter a destination.' }),
  duration_days: z.string().min(1, { message: 'Please set a duration.'}),
  people_count: z.string().min(1, { message: 'At least one person.' }),
  trip_type: z.enum(['informal', 'formal']).default('informal'),
  budget_range_inr: z.string().min(1, { message: "Please set a budget." }),
  preferences: z.array(z.string()).default([]),
});

type InputFormValues = z.infer<typeof formSchema>;

interface MultiStepInputFormProps {
  onSubmit: (data: GeneratePersonalizedItinerariesInput) => void;
  isGenerating: boolean;
}

const steps = [
    "destination", "duration_days", "people_count", "trip_type", "budget_range_inr", "preferences"
] as const;


const BudgetSlider = ({ field }: { field: any }) => {
    const [sliderValue, setSliderValue] = useState(50000);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setSliderValue(value);
        field.onChange(String(value));
    };

    const budgetLabel = () => {
        if (sliderValue < 30000) return "Budget vibes 💸";
        if (sliderValue < 80000) return "Balanced 💼";
        return "Living large ✨";
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-baseline mb-2">
                <span className="text-lg font-medium">Let’s talk money (no judgment)</span>
                <span className="font-semibold text-primary text-lg">
                    {budgetLabel()}
                </span>
            </div>
            <input
                type="range"
                min="10000"
                max="150000"
                step="5000"
                value={sliderValue}
                onChange={handleSliderChange}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer range-lg accent-primary"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>₹10,000</span>
                <motion.span key={sliderValue} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="font-bold text-foreground text-lg">
                    ₹{sliderValue.toLocaleString('en-IN')}
                </motion.span>
                <span>₹1,50,000+</span>
            </div>
        </div>
    );
};


export function MultiStepInputForm({ onSubmit, isGenerating }: MultiStepInputFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<InputFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      destination: '',
      duration_days: '3-5 days',
      people_count: '2',
      trip_type: 'informal',
      budget_range_inr: '50000',
      preferences: [],
    },
  });

  const watchedFields = useWatch({ control: form.control });

  const handleNext = async () => {
    const field = steps[currentStep];
    const isValid = await form.trigger(field);
    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleSubmit = (values: InputFormValues) => {
    const submittedData: GeneratePersonalizedItinerariesInput = {
        ...values,
        travel_dates: `Not specified`,
        round_trip: true, 
    };
    onSubmit(submittedData);
  };
  
  const formIsValid = form.formState.isValid;

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    exit: { 
        opacity: 0, 
        y: -30, 
        scale: 0.98,
        transition: {
            duration: 0.3,
            ease: "easeIn"
        }
    }
  };


  const renderStep = () => {
      switch (steps[currentStep]) {
          case 'destination':
              return (
                  <Card className="p-6 relative overflow-hidden transition-all hover:shadow-lg focus-within:shadow-lg focus-within:border-primary/50">
                      <Globe className="absolute -right-4 -top-4 h-24 w-24 text-muted/20 -rotate-12 transition-transform group-hover:rotate-0" />
                      <FormField
                        control={form.control}
                        name="destination"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-medium">Where are we headed? 👀✈️</FormLabel>
                            <FormControl>
                              <Input placeholder="Paris, Bali, Tokyo..." {...field} className="text-base h-12 mt-2 focus:border-primary/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </Card>
              );
          case 'duration_days':
              return (
                  <Card className="p-6 transition-all hover:shadow-lg focus-within:shadow-lg focus-within:border-primary/50 h-full">
                       <FormField
                          control={form.control}
                          name="duration_days"
                          render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-lg font-medium">How long are we disappearing for?</FormLabel>
                                  <FormControl>
                                      <div className="flex gap-2 mt-2">
                                          {['Weekend', '3-5 days', '1 week+'].map((days) => (
                                              <Button 
                                                  key={days} 
                                                  type="button" 
                                                  variant={field.value === days ? "default" : "outline"} 
                                                  onClick={() => {field.onChange(days); handleNext();}}
                                                  className="flex-1 transition-transform hover:scale-105 active:scale-95"
                                              >
                                                  {days}
                                              </Button>
                                          ))}
                                      </div>
                                  </FormControl>
                               <FormMessage className="!mt-2" />
                              </FormItem>
                          )}
                          />
                  </Card>
              );
          case 'people_count':
                return (
                    <Card className="p-6 transition-all hover:shadow-lg focus-within:shadow-lg focus-within:border-primary/50 h-full">
                        <FormField
                            control={form.control}
                            name="people_count"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg font-medium">Who’s coming along?</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input type="number" min="1" {...field} className="text-base h-12 mt-2 focus:border-primary/50 pl-10" />
                                        </div>
                                    </FormControl>
                                <FormMessage className="!mt-2" />
                                </FormItem>
                            )}
                        />
                    </Card>
                );
          case 'trip_type':
              return (
                  <Card className="p-6 transition-all hover:shadow-lg">
                      <FormField
                          control={form.control}
                          name="trip_type"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel className="text-lg font-medium">What's the vibe?</FormLabel>
                              <FormControl>
                                  <div className="grid grid-cols-2 gap-4 mt-2">
                                      <Card onClick={() => {field.onChange('informal'); handleNext();}} className={cn('p-4 text-center cursor-pointer transition-all duration-300 border-2', field.value === 'informal' ? 'border-primary shadow-lg scale-105' : 'hover:border-primary/50')}>
                                          <span className="text-3xl">🌴</span>
                                          <p className="font-semibold mt-2">Chill / Informal</p>
                                      </Card>
                                      <Card onClick={() => {field.onChange('formal'); handleNext();}} className={cn('p-4 text-center cursor-pointer transition-all duration-300 border-2', field.value === 'formal' ? 'border-primary shadow-lg scale-105' : 'hover:border-primary/50')}>
                                          <span className="text-3xl">💼</span>
                                          <p className="font-semibold mt-2">Formal / Work</p>
                                      </Card>
                                  </div>
                              </FormControl>
                              </FormItem>
                          )}
                      />
                  </Card>
              );
          case 'budget_range_inr':
              return (
                  <Card className="p-6 transition-all hover:shadow-lg focus-within:shadow-lg">
                      <FormField
                        control={form.control}
                        name="budget_range_inr"
                        render={({ field }) => (
                          <FormItem>
                              <FormControl>
                                <BudgetSlider field={field} />
                              </FormControl>
                          </FormItem>
                        )}
                      />
                  </Card>
              );
          case 'preferences':
              return (
                  <Card className="p-6 transition-all hover:shadow-lg">
                      <FormField
                        control={form.control}
                        name="preferences"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-medium">What are you into?</FormLabel>
                            <FormControl>
                              <div className="flex flex-wrap gap-3 mt-3">
                                {preferencesOptions.map((preference) => (
                                  <button
                                    key={preference.label}
                                    type="button"
                                    className={cn(
                                      "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 transform",
                                      field.value.includes(preference.label)
                                        ? "bg-primary border-primary text-primary-foreground scale-105 shadow-md"
                                        : "bg-background border-input hover:border-primary/50 hover:bg-muted"
                                    )}
                                    onClick={() => {
                                      const currentPreferences = field.value || [];
                                      const newPreferences = currentPreferences.includes(preference.label)
                                        ? currentPreferences.filter((p) => p !== preference.label)
                                        : [...currentPreferences, preference.label];
                                      field.onChange(newPreferences);
                                    }}
                                  >
                                    <preference.icon className="h-4 w-4" />
                                    <span className="font-medium">{preference.label}</span>
                                  </button>
                                ))}
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                  </Card>
              );
          default:
              return null;
      }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-xl mx-auto space-y-4">
        <AnimatePresence mode="wait">
            <motion.div
                key={currentStep}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                {renderStep()}
            </motion.div>
        </AnimatePresence>

        <div className="pt-6 flex justify-end">
          {currentStep < steps.length - 1 && (
             <Button
                type="button"
                onClick={handleNext}
                disabled={!watchedFields[steps[currentStep]]}
                className="h-12 px-6 text-base font-bold transition-all duration-300 ease-in-out hover:scale-105"
             >
                Next <ArrowRight className="ml-2 h-5 w-5" />
             </Button>
          )}

          {currentStep === steps.length - 1 && (
            <Button 
                type="submit" 
                className={cn(
                    "w-full h-14 text-lg font-bold bg-gradient-to-r from-primary-start to-primary-end text-primary-foreground transition-all duration-300 ease-in-out shadow-[0_8px_30px_-10px_hsl(var(--primary))] hover:shadow-[0_12px_40px_-10px_hsl(var(--primary))]",
                    formIsValid && !isGenerating && "animate-pulse"
                )}
                disabled={isGenerating || !formIsValid}
            >
                {isGenerating ? (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center"
                    >
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-3"></div>
                        AI agents are planning your trip...
                    </motion.div>
                ) : (
                    <motion.div 
                        key="ready"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center"
                    >
                        Build my trip ✨
                    </motion.div>
                )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}