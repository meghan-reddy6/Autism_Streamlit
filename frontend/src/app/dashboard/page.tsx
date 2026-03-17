import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-slate-600">This is a placeholder for the future admin and research dashboard.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Analytics Integration</CardTitle>
            <CardDescription>Future ML pipeline insights</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Medical Imaging</CardTitle>
            <CardDescription>MRI data uploads module</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
