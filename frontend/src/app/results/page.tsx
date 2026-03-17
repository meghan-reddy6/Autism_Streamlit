"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck,
  Download,
  Home,
  AlertCircle,
  Loader2,
  User,
  Phone,
  CheckSquare,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { useAssessmentStore } from "@/lib/store";
import { RadarChartVisual } from "@/components/RadarChartVisual";

type AssessmentResponse = {
  id: number;
  total_score: number;
  interpretation: string;
  ml_prediction: string;
  child_name: string;
  child_age: string;
  child_gender: string;
  parent_name: string;
  contact_number: string;
  contact_email: string;
  consent_given: boolean;
  created_at: string;
  responses: Array<{ section: string; score: number }>;
};

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearAssessment = useAssessmentStore((state) => state.clearAssessment);
  const [data, setData] = useState<AssessmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        const id = searchParams.get("id");
        if (!id) {
          setError("No assessment ID provided.");
          setLoading(false);
          return;
        }

        const url = `${API_BASE_URL}/assessment/${id}`;
        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Failed to load assessment: ${res.status} - ${errorText}`,
          );
        }

        const json = await res.json();
        setData(json);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load clinical report.";
        console.error("Error fetching assessment:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [searchParams]);

  const handleReturnHome = () => {
    clearAssessment();
    router.push("/");
  };

  // Aggregate scores by section for the Radar chart
  const chartData = useMemo(() => {
    if (!data?.responses) return [];

    const sectionTotals: Record<string, number> = {};
    const sectionMax: Record<string, number> = {};

    data.responses.forEach((r) => {
      // Simplify the long names for the chart
      const shortName =
        r.section.split(".")[1]?.trim() || r.section.split(" ")[1] || r.section;
      sectionTotals[shortName] = (sectionTotals[shortName] || 0) + r.score;
      sectionMax[shortName] = (sectionMax[shortName] || 0) + 4; // Max score per question is 4
    });

    return Object.keys(sectionTotals).map((key) => ({
      subject: key,
      score: sectionTotals[key],
      fullMark: sectionMax[key],
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-blue-600">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-lg font-medium text-slate-600">
          Generating clinical report...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertCircle className="w-16 h-16 text-yellow-500" />
        <h2 className="text-2xl font-bold">Report Unavailable</h2>
        <p className="text-slate-600">
          {error || "Please complete an assessment first."}
        </p>
        <Link href="/assessment">
          <Button>Start New Assessment</Button>
        </Link>
      </div>
    );
  }

  const { total_score, interpretation, ml_prediction } = data;
  const maxScore = 80;
  const minScore = 20;
  const scorePercent = Math.max(
    0,
    Math.min(
      100,
      Math.round(((total_score - minScore) / (maxScore - minScore)) * 100),
    ),
  );

  let resultColor = "bg-green-500";
  let resultBg = "bg-green-50";
  let resultBorder = "border-green-200";
  let resultText = "text-green-800";

  if (interpretation.includes("Mildly")) {
    resultColor = "bg-amber-500";
    resultBg = "bg-amber-50";
    resultBorder = "border-amber-200";
    resultText = "text-amber-800";
  } else if (interpretation.includes("Severely")) {
    resultColor = "bg-red-500";
    resultBg = "bg-red-50";
    resultBorder = "border-red-200";
    resultText = "text-red-800";
  }

  const mlPredictionStr = ml_prediction || "Unverified";

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-8 pb-12">
      {/* Report Header */}
      <div className="text-center space-y-4 pb-4 border-b">
        <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-2">
          <ClipboardCheck className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Autism Behavioral Clinical Report
        </h1>
        <p className="text-slate-500 font-mono text-sm">
          Report ID: TABC-{data.id.toString().padStart(5, "0")} | Generated:{" "}
          {new Date(data.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Demographics */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 py-4 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Child Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Name</span>
                <span className="font-medium text-slate-900">
                  {data.child_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Age</span>
                <span className="font-medium text-slate-900">
                  {data.child_age}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gender</span>
                <span className="font-medium text-slate-900">
                  {data.child_gender}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 py-4 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" /> Guardian Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Name</span>
                <span className="font-medium text-slate-900">
                  {data.parent_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact</span>
                <span className="font-medium text-slate-900">
                  {data.contact_number}
                </span>
              </div>
              <div className="flex gap-2 text-slate-500 pt-2 text-xs border-t mt-2">
                <CheckSquare className="w-3 h-3 mt-0.5 text-green-600" /> Formal
                consent provided
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Score and Chart */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-lg overflow-hidden border-t-0">
            <div className={`h-2 w-full ${resultColor}`} />

            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="p-6 border-b sm:border-b-0 sm:border-r border-slate-100 flex flex-col items-center justify-center">
                <h3 className="text-sm font-medium tracking-wider text-slate-500 uppercase mb-2">
                  Total Score
                </h3>
                <div className="text-6xl font-black text-slate-900">
                  {total_score}
                </div>
                <div className="w-full mt-6 space-y-2">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                    <div
                      className={`absolute top-0 left-0 h-full ${resultColor} transition-all duration-1000 ease-out`}
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>20</span>
                    <span>80</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4 flex flex-col justify-center">
                <div
                  className={`p-4 rounded-xl border ${resultBorder} ${resultBg} text-center`}
                >
                  <h3
                    className={`text-xs font-bold uppercase tracking-widest ${resultText} opacity-80 mb-1`}
                  >
                    Rule Interpretation
                  </h3>
                  <p className={`text-lg font-bold ${resultText}`}>
                    {interpretation}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl border bg-indigo-50 border-indigo-200 text-center`}
                >
                  <h3
                    className={`text-xs font-bold uppercase tracking-widest text-indigo-800 opacity-80 mb-1`}
                  >
                    ML Prediction
                  </h3>
                  <p className={`text-lg font-bold text-indigo-900`}>
                    {mlPredictionStr || "Unverified"}
                  </p>
                </div>
              </div>
            </div>

            <RadarChartVisual data={chartData} />

            <CardFooter className="bg-slate-50 flex flex-col sm:flex-row gap-4 border-t p-6 mt-4">
              <Button
                className="w-full sm:w-1/2 bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm print:hidden"
                variant="outline"
                onClick={() => window.print()}
              >
                <Download className="w-4 h-4 mr-2" /> Download PDF Report
              </Button>
              <Button
                className="w-full sm:w-1/2 bg-blue-600 hover:bg-blue-700 shadow-sm print:hidden"
                onClick={handleReturnHome}
              >
                <Home className="w-4 h-4 mr-2" /> Return to Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-blue-600">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-lg font-medium text-slate-600">
            Loading clinical report...
          </p>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
