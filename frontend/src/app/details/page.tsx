"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAssessmentStore, PatientDetails } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Users, ArrowRight } from "lucide-react";

// Form Validation Schema
const formSchema = z.object({
  child_name: z.string().min(2, { message: "Child name must be at least 2 characters." }),
  child_age: z.string().min(1, { message: "Age is required." }),
  child_gender: z.string().min(1, { message: "Please select gender." }),
  parent_name: z.string().min(2, { message: "Parent/Guardian name is required." }),
  contact_number: z.string().min(10, { message: "Valid contact number is required." }),
  contact_email: z.string().email({ message: "Invalid email address." }),
  consent_given: z.boolean().refine(val => val === true, {
    message: "You must provide consent to proceed with the assessment.",
  }),
});

export default function PatientDetailsPage() {
  const router = useRouter();
  const setPatientDetails = useAssessmentStore((state) => state.setPatientDetails);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      child_name: "",
      child_age: "",
      child_gender: "",
      parent_name: "",
      contact_number: "",
      contact_email: "",
      consent_given: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setPatientDetails(values as PatientDetails);
    router.push("/assessment");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 mt-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Patient Registration
        </h1>
        <p className="text-slate-600">
          Please provide the following details to generate an accurate clinical report.
        </p>
      </div>

      <Card className="shadow-lg border-t-4 border-t-blue-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Registration & Consent
          </CardTitle>
          <CardDescription>
            All information is kept confidential and is only used for the final assessment report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Child Details Section */}
              <div className="space-y-4 bg-slate-50 p-6 rounded-lg border">
                <h3 className="text-sm font-semibold text-slate-500 uppercase flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Child&apos;s Details
                </h3>
                
                <FormField
                  control={form.control}
                  name="child_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="child_age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age (Months/Years)</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. 5 Years" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="child_gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Guardian Details Section */}
              <div className="space-y-4 bg-indigo-50/50 p-6 rounded-lg border border-indigo-100">
                <h3 className="text-sm font-semibold text-indigo-500 uppercase flex items-center gap-2">
                  <Users className="w-4 h-4" /> Parent / Guardian Details
                </h3>
                
                <FormField
                  control={form.control}
                  name="parent_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guardian&apos;s Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="jane.doe@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Consent Section */}
              <div className="bg-orange-50/50 p-6 rounded-lg border border-orange-100">
                <FormField
                  control={form.control}
                  name="consent_given"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-base text-slate-800 font-medium cursor-pointer">
                          Data Collection Consent
                        </FormLabel>
                        <FormDescription className="text-sm text-slate-600">
                          I consent to the collection and use of this behavioral data for clinical assessment and tracking purposes. I understand that this tool provides an automated score and is not a replacement for a formal medical diagnosis.
                        </FormDescription>
                        <FormMessage className="text-red-500 font-medium" />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
                  Start Assessment <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
