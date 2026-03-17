"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAssessmentStore, Score } from "@/lib/store";
import { API_BASE_URL } from "@/lib/api";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

type Question = { id: string; text: string };
type SectionsType = Record<string, Question[]>;

const SCORING_OPTIONS = [
  { value: "1", label: "Never" },
  { value: "2", label: "Sometimes" },
  { value: "3", label: "Often" },
  { value: "4", label: "Always" },
];

export default function AssessmentPage() {
  const router = useRouter();
  const [sections, setSections] = useState<SectionsType | null>(null);
  const [sectionKeys, setSectionKeys] = useState<string[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { responses, patientDetails, setResponse, getAnsweredCount } =
    useAssessmentStore();

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientDetails) {
      router.replace("/details");
      return;
    }

    async function loadQuestions() {
      try {
        const res = await fetch(`${API_BASE_URL}/questions`);
        if (!res.ok) throw new Error("Failed to load questions");
        const data: SectionsType = await res.json();
        setSections(data);
        setSectionKeys(Object.keys(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    loadQuestions();
  }, [patientDetails, router]);

  if (!patientDetails) {
    return null; // Don't render while redirecting
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-blue-600">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-lg font-medium text-slate-600">
          Loading assessment...
        </p>
      </div>
    );
  }

  if (error || !sections) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 bg-red-50 text-red-900 rounded-lg flex items-center gap-4">
        <AlertCircle className="w-8 h-8" />
        <div>
          <h2 className="text-lg font-bold">Failed to load Assessment</h2>
          <p>{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4 border-red-200 hover:bg-red-100 text-red-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const currentSectionName = sectionKeys[currentSectionIndex];
  const currentQuestions = sections[currentSectionName];

  const totalQuestions = Object.values(sections).flat().length;
  const answeredCount = getAnsweredCount();
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const isLastSection = currentSectionIndex === sectionKeys.length - 1;
  const isFirstSection = currentSectionIndex === 0;

  // Check if current section is fully answered
  const isCurrentSectionComplete = currentQuestions.every(
    (q) => responses[q.id],
  );


  const handleNext = () => {
    setValidationError(null);
    if (!isCurrentSectionComplete) {
      setValidationError("Please answer all questions in this section before continuing.");
      return;
    }
    if (!isLastSection) {
      setCurrentSectionIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setValidationError(null);
    if (!isFirstSection) {
      setCurrentSectionIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setValidationError(null);
    if (answeredCount < totalQuestions) {
      setValidationError("Please answer all questions across all sections before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...patientDetails,
        responses: Object.values(responses),
      };

      const res = await fetch(`${API_BASE_URL}/assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Submission failed: ${res.status} - ${errorText}`);
      }

      const result = await res.json();

      if (!result.id) {
        throw new Error("No assessment ID returned from server");
      }

      router.push(`/results?id=${result.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Assessment submission error:", errorMessage);
      setValidationError(`Failed to submit assessment: ${errorMessage}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Progress Header */}
      <div className="space-y-2 sticky top-0 bg-slate-50/95 backdrop-blur z-10 py-4 border-b">
        <div className="flex justify-between text-sm font-medium text-slate-600">
          <span>Overall Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-3" />
        <div className="mt-4 pt-2">
          <span className="text-sm font-semibold text-blue-800 uppercase tracking-wider">
            Section {currentSectionIndex + 1} of {sectionKeys.length}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            {currentSectionName}
          </h2>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {currentQuestions.map((q, idx) => {
          const answer = responses[q.id]?.score;
          return (
            <Card key={q.id} className="shadow-sm border-slate-200">
              <CardHeader className="pb-3 bg-slate-50 rounded-t-xl border-b border-slate-100">
                <CardTitle className="text-base font-medium text-slate-800 flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{q.text}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <RadioGroup
                  value={answer?.toString()}
                  onValueChange={(val) => {
                    setResponse(
                      q.id,
                      currentSectionName,
                      parseInt(val) as Score,
                    );
                    setValidationError(null);
                  }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {SCORING_OPTIONS.map((opt) => {
                    const isSelected = answer?.toString() === opt.value;
                    return (
                      <div key={opt.value}>
                        <RadioGroupItem
                          value={opt.value}
                          id={`${q.id}-${opt.value}`}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={`${q.id}-${opt.value}`}
                          className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-50 text-blue-900"
                              : "border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <span className="text-lg font-bold mb-1">
                            {opt.value}
                          </span>
                          <span className="text-xs font-medium uppercase tracking-wider">
                            {opt.label}
                          </span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {validationError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium text-sm">{validationError}</p>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrev}
          disabled={isFirstSection || isSubmitting}
          className="text-slate-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous Section
        </Button>

        {isLastSection ? (
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!isCurrentSectionComplete || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 min-w-40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                Submit Assessment <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleNext}
            disabled={!isCurrentSectionComplete}
            className="bg-slate-800 hover:bg-slate-900"
          >
            Next Section
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
