"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ConceptResponse } from "@/types";

// Set a fallback API URL if the environment variable is undefined
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [concept, setConcept] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the explanation when the component mounts
    fetchExplanation();
  }, []);

  const fetchExplanation = async () => {
    setLoading(true);
    try {
      console.log("Fetching from:", `${API_URL}/api/explain`); // Add this for debugging

      const response = await fetch(`${API_URL}/api/explain`);

      if (!response.ok) {
        throw new Error("Failed to fetch explanation");
      }

      const data: ConceptResponse = await response.json();
      setConcept(data.concept);
      setExplanation(data.explanation);
      setError(null);
    } catch (err) {
      setError("Something went wrong. Please try again later.");
      console.error("Error fetching explanation:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">
          LearnInFive
        </h1>
        <p className="text-lg text-center mb-12 text-gray-600">
          Computer Science Concepts Explained Like You&apos;re Five
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchExplanation}>Try Again</Button>
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader className="bg-blue-500 text-white">
              <CardTitle className="text-2xl text-center">{concept}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-8 px-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {explanation}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-gray-500">
        <p>© 2025 LearnInFive. All rights reserved.</p>
      </footer>
    </div>
  );
}
