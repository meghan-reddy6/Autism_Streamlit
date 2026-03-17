import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ClipboardList } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 mt-10">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-4">
          <ClipboardList className="w-12 h-12 text-blue-700" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Autism Assessment Tool
        </h1>
        <p className="text-xl text-slate-600">
          A standardized behaviour checklist for screening.
        </p>
      </div>

      <Card className="border-t-4 border-t-blue-600 shadow-lg">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>Please read carefully before proceeding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-slate-700 leading-relaxed">
            Please rate each statement based on how often the behavior occurs. Complete all questions honestly to receive the most accurate screening result.
          </p>
          
          <div className="bg-slate-50 p-6 rounded-lg border">
            <h3 className="font-semibold text-slate-900 mb-4">Scoring Guide</h3>
            <ul className="grid grid-cols-2 gap-4 text-sm text-slate-600">
              <li className="flex items-center"><span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mr-3 font-medium text-xs">1</span> Never</li>
              <li className="flex items-center"><span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mr-3 font-medium text-xs">2</span> Sometimes</li>
              <li className="flex items-center"><span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mr-3 font-medium text-xs">3</span> Often</li>
              <li className="flex items-center"><span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mr-3 font-medium text-xs">4</span> Always</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/details" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-lg h-14 px-8 bg-blue-600 hover:bg-blue-700 shadow-md">
                Start Assessment <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
