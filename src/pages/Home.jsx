import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Loader2, Sparkles, Utensils, Moon, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [formData, setFormData] = useState({
    sport: "",
    age: "",
    height: "",
    weight: "",
    injuries: "",
    goal: ""
  });
  
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePlan = async () => {
    if (!formData.sport || !formData.age || !formData.height || !formData.weight || !formData.goal) {
      alert("Please fill in all required fields");
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = `You are an expert sports coach and nutritionist. Create a comprehensive 4-week personalized training program for an athlete with the following profile:

Sport: ${formData.sport}
Age: ${formData.age} years old
Height: ${formData.height} cm
Weight: ${formData.weight} kg
Injuries/Limitations: ${formData.injuries || "None"}
Goal: ${formData.goal}

Create a detailed plan with three sections:

1. **TRAINING PLAN** (4 weeks)
   - Weekly structure with specific daily workouts
   - Warm-up routines (5-10 minutes)
   - Main exercises with sets, reps, and intensity
   - Cool-down routines (5-10 minutes)
   - Progressive overload week by week
   - Sport-specific drills and techniques

2. **NUTRITION PLAN**
   - Daily calorie targets based on their metrics and goal
   - Macro breakdown (protein, carbs, fats in grams)
   - Meal timing strategy (pre/post workout)
   - 3 example meal plans with specific foods
   - Hydration guidelines
   - Supplement recommendations if applicable

3. **RECOVERY PLAN**
   - Sleep recommendations (hours and timing)
   - Daily mobility/stretching routine (10-15 minutes)
   - Active recovery activities
   - Injury prevention exercises
   - Rest day activities
   - When to take complete rest

Consider their age, current fitness level, sport demands, and any injuries mentioned. Make it practical, safe, and effective. Be specific with exercises, portions, and timings. Format using markdown with clear headers and bullet points.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      // Parse the result to extract sections
      const plan = {
        full_plan: result,
        training: extractSection(result, "TRAINING PLAN"),
        nutrition: extractSection(result, "NUTRITION PLAN"),
        recovery: extractSection(result, "RECOVERY PLAN")
      };

      setGeneratedPlan(plan);

      // Save to database
      await base44.entities.TrainingPlan.create({
        ...formData,
        training_plan: plan.training,
        nutrition_plan: plan.nutrition,
        recovery_plan: plan.recovery
      });

    } catch (error) {
      console.error("Error generating plan:", error);
      alert("Failed to generate plan. Please try again.");
    }
    
    setIsGenerating(false);
  };

  const extractSection = (text, sectionName) => {
    const regex = new RegExp(`\\*\\*${sectionName}\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z\\s]+\\*\\*|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : text;
  };

  const resetForm = () => {
    setGeneratedPlan(null);
    setFormData({
      sport: "",
      age: "",
      height: "",
      weight: "",
      injuries: "",
      goal: ""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mb-6 shadow-lg shadow-blue-500/50">
              <Dumbbell className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4">
              AI Sports Coach
            </h1>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Get your personalized 4-week training, nutrition, and recovery plan powered by AI
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <AnimatePresence mode="wait">
          {!generatedPlan ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="max-w-3xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                    Your Athlete Profile
                  </CardTitle>
                  <p className="text-slate-600 mt-2">Tell us about yourself to get a customized plan</p>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sport" className="text-slate-700 font-medium">
                        Sport <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="sport"
                        placeholder="e.g., Basketball, Soccer, Running"
                        value={formData.sport}
                        onChange={(e) => handleInputChange("sport", e.target.value)}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-slate-700 font-medium">
                        Age <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="25"
                        value={formData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-slate-700 font-medium">
                        Height (cm) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="175"
                        value={formData.height}
                        onChange={(e) => handleInputChange("height", e.target.value)}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight" className="text-slate-700 font-medium">
                        Weight (kg) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="70"
                        value={formData.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="injuries" className="text-slate-700 font-medium">
                        Injuries or Physical Limitations
                      </Label>
                      <Textarea
                        id="injuries"
                        placeholder="e.g., Previous ankle sprain, lower back pain..."
                        value={formData.injuries}
                        onChange={(e) => handleInputChange("injuries", e.target.value)}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 min-h-20"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="goal" className="text-slate-700 font-medium">
                        Training Goal <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="goal"
                        placeholder="e.g., Improve vertical jump by 10cm, build endurance for marathon, gain 5kg muscle..."
                        value={formData.goal}
                        onChange={(e) => handleInputChange("goal", e.target.value)}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 min-h-24"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={generatePlan}
                    disabled={isGenerating}
                    className="w-full mt-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-6 text-lg font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Your Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate My Training Plan
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Header with athlete info */}
              <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Your Personalized Plan</h2>
                      <p className="text-blue-100">
                        {formData.sport} • {formData.age} years • {formData.height}cm • {formData.weight}kg
                      </p>
                      <p className="text-white font-medium mt-1">Goal: {formData.goal}</p>
                    </div>
                    <Button
                      onClick={resetForm}
                      variant="secondary"
                      className="bg-white text-blue-600 hover:bg-blue-50"
                    >
                      Create New Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Training Plan */}
              <Card className="bg-white shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    Training Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  <ReactMarkdown
                    className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3 prose-p:text-slate-700 prose-ul:text-slate-700 prose-strong:text-slate-900"
                  >
                    {generatedPlan.training}
                  </ReactMarkdown>
                </CardContent>
              </Card>

              {/* Nutrition Plan */}
              <Card className="bg-white shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Utensils className="w-6 h-6 text-white" />
                    </div>
                    Nutrition Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  <ReactMarkdown
                    className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3 prose-p:text-slate-700 prose-ul:text-slate-700 prose-strong:text-slate-900"
                  >
                    {generatedPlan.nutrition}
                  </ReactMarkdown>
                </CardContent>
              </Card>

              {/* Recovery Plan */}
              <Card className="bg-white shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Moon className="w-6 h-6 text-white" />
                    </div>
                    Recovery Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  <ReactMarkdown
                    className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3 prose-p:text-slate-700 prose-ul:text-slate-700 prose-strong:text-slate-900"
                  >
                    {generatedPlan.recovery}
                  </ReactMarkdown>
                </CardContent>
              </Card>

              {/* Footer CTA */}
              <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <p className="text-lg mb-4">Ready to start fresh with a new goal?</p>
                  <Button
                    onClick={resetForm}
                    className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-6 text-lg font-semibold"
                  >
                    Generate Another Plan
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}