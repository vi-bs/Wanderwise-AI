
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Globe, Waves, PartyPopper, Utensils, Trees, Palmtree } from 'lucide-react';
import type { GeneratePersonalizedItinerariesInput } from '@/ai/flows/generate-personalized-itineraries';

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
  trip_type: z.enum(['informal', 'formal']).default('informal'),
  budget: z.number().min(0).max(100).default(50),
  preferences: z.array(z.string()).default([]),
  people_count: z.string().min(1, { message: 'At least one person.' }),
});

type InputFormValues = z.infer<typeof formSchema>;

interface InputFormProps {
  onSubmit: (data: GeneratePersonalizedItinerariesInput) => void;
  isGenerating: boolean;
}

const budgetLabels = (value: number) => {
    if (value < 33) return '💸 Budget';
    if (value < 66) return '💼 Balanced';
    return '✨ Premium';
}

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: i * 0.15 + 0.4,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1] // easeOutQuint
        }
    })
}

export function InputForm({ onSubmit, isGenerating }: InputFormProps) {
  const form = useForm<InputFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: '',
      duration_days: '3-5 days',
      trip_type: 'informal',
      budget: 50,
      preferences: [],
      people_count: '2',
    },
  });

  const handleSubmit = (values: InputFormValues) => {
    const budgetMap: {[key: string]: string} = { '💸 Budget': '10000-30000', '💼 Balanced': '30000-70000', '✨ Premium': '70000+'};
    const submittedData: GeneratePersonalizedItinerariesInput = {
        ...values,
        budget_range_inr: budgetMap[budgetLabels(values.budget)],
        travel_dates: `Not specified`, // This can be updated if a date picker is re-introduced
        round_trip: true, // Assuming round trip for this simplified form
    };
    onSubmit(submittedData);
  };

  const formIsValid = form.formState.isValid;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-xl mx-auto space-y-4">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={1}>
            <Card className="p-6 relative overflow-hidden transition-all hover:shadow-lg focus-within:shadow-lg focus-within:border-primary/50">
                <Globe className="absolute -right-4 -top-4 h-24 w-24 text-muted/20 -rotate-12 transition-transform group-hover:rotate-0" />
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">Destination</FormLabel>
                      <FormControl>
                        <Input placeholder="Paris, Bali, Tokyo..." {...field} className="text-base h-12 mt-2 focus:border-primary/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </Card>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={2}>
                <Card className="p-6 transition-all hover:shadow-lg focus-within:shadow-lg focus-within:border-primary/50 h-full">
                     <FormField
                        control={form.control}
                        name="duration_days"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-lg font-medium">Duration</FormLabel>
                                <FormControl>
                                    <div className="flex gap-2 mt-2">
                                        {['Weekend', '3-5 days', '1 week+'].map((days) => (
                                            <Button 
                                                key={days} 
                                                type="button" 
                                                variant={field.value === days ? "default" : "outline"} 
                                                onClick={() => field.onChange(days)}
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
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={2.5}>
                <Card className="p-6 transition-all hover:shadow-lg focus-within:shadow-lg focus-within:border-primary/50 h-full">
                     <FormField
                        control={form.control}
                        name="people_count"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-lg font-medium">How many people?</FormLabel>
                                <FormControl>
                                    <Input type="number" min="1" {...field} className="text-base h-12 mt-2 focus:border-primary/50" />
                                </FormControl>
                             <FormMessage className="!mt-2" />
                            </FormItem>
                        )}
                        />
                </Card>
            </motion.div>
        </div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={3}>
            <Card className="p-6 transition-all hover:shadow-lg">
                <FormField
                    control={form.control}
                    name="trip_type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-lg font-medium">Trip Type</FormLabel>
                        <FormControl>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <Card onClick={() => field.onChange('informal')} className={cn('p-4 text-center cursor-pointer transition-all duration-300 border-2', field.value === 'informal' ? 'border-primary shadow-lg scale-105' : 'hover:border-primary/50')}>
                                    <span className="text-3xl">🌴</span>
                                    <p className="font-semibold mt-2">Chill / Informal</p>
                                </Card>
                                <Card onClick={() => field.onChange('formal')} className={cn('p-4 text-center cursor-pointer transition-all duration-300 border-2', field.value === 'formal' ? 'border-primary shadow-lg scale-105' : 'hover:border-primary/50')}>
                                    <span className="text-3xl">💼</span>
                                    <p className="font-semibold mt-2">Formal / Work</p>
                                </Card>
                            </div>
                        </FormControl>
                        </FormItem>
                    )}
                />
            </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={4}>
            <Card className="p-6 transition-all hover:shadow-lg focus-within:shadow-lg">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-lg font-medium flex justify-between items-baseline">
                            <span>Budget</span>
                            <span className="font-semibold text-primary">{budgetLabels(field.value)}</span>
                        </FormLabel>
                        <FormControl>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={1}
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer range-lg accent-primary"
                            />
                        </FormControl>
                    </FormItem>
                  )}
                />
            </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={5}>
            <Card className="p-6 transition-all hover:shadow-lg">
                <FormField
                  control={form.control}
                  name="preferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">Preferences</FormLabel>
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
        </motion.div>

        <motion.div 
            variants={cardVariants} 
            initial="hidden" 
            animate="visible"
            custom={6}
            className="pt-6"
        >
            <Button 
                type="submit" 
                className={cn(
                    "w-full h-14 text-lg font-bold bg-gradient-to-r from-primary-start to-primary-end text-primary-foreground transition-all duration-300 ease-in-out shadow-[0_8px_30px_-10px_hsl(var(--primary))] hover:shadow-[0_12px_40px_-10px_hsl(var(--primary))]",
                    formIsValid && !isGenerating && "animate-pulse"
                )}
                disabled={isGenerating}
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
                        Plan my trip ✈️
                    </motion.div>
                )}
            </Button>
        </motion.div>
      </form>
    </Form>
  );
}
