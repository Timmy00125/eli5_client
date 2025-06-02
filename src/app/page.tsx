"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save, CheckCircle } from "lucide-react";
import { ConceptResponse } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

// Set a fallback API URL if the environment variable is undefined
const API_URL = process.env.NEXT_PUBLIC_API_URL;
// const API_URL =
//   process.env.NEXT_PUBLIC_API_URL_LOCAL || "http://localhost:8000";

export default function Home() {
  const [concept, setConcept] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    // Fetch the explanation when the component mounts
    fetchExplanation();
  }, [useFallback]);

  useEffect(() => {
    // Reset saved state when concept changes
    setSaved(false);
  }, [concept]);

  const fetchExplanation = async () => {
    setLoading(true);
    try {
      // Use authenticated endpoint if user is logged in, otherwise use public endpoint
      const endpoint =
        isAuthenticated && !useFallback
          ? "/api/explain/authenticated"
          : useFallback
          ? "/api/fallback-explain"
          : "/api/explain";

      console.log("Fetching from:", `${API_URL}${endpoint}`);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add authorization header if authenticated
      if (isAuthenticated && token && !useFallback) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers,
      });

      if (!response.ok) {
        if (!useFallback && response.status === 500) {
          // If main endpoint fails with 500, try the fallback
          setUseFallback(true);
          return;
        }
        throw new Error(`Failed to fetch explanation: ${response.status}`);
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

  const saveToHistory = async () => {
    if (!isAuthenticated || !token || !concept || !explanation) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          concept,
          explanation,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save to history");
      }

      setSaved(true);
      // Auto-hide the saved indicator after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving to history:", err);
      setError("Failed to save to history");
    } finally {
      setSaving(false);
    }
  };

  const retryMainEndpoint = () => {
    setUseFallback(false);
    fetchExplanation();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-blue-600">LearnInFive</h1>
          <p className="text-lg text-gray-600">
            Computer Science Concepts Explained Like You&apos;re Five
          </p>
          {isAuthenticated && (
            <p className="text-sm text-blue-600 mt-2">
              Signed in - your explanations will be saved to your history!
            </p>
          )}
        </div>

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
          <Card className="max-w-4xl mx-auto shadow-lg">
            <CardHeader className="bg-blue-500 text-white">
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl flex-1">{concept}</CardTitle>
                {isAuthenticated && concept && explanation && (
                  <div className="ml-4">
                    {saved ? (
                      <div className="flex items-center gap-2 text-green-200">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm">Saved!</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={saveToHistory}
                        disabled={saving}
                        className="text-blue-500 bg-white hover:bg-gray-100"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
              {useFallback && (
                <p className="text-white text-sm mt-2">
                  Using backup explanation
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryMainEndpoint}
                    className="ml-2 text-blue-500 bg-white hover:bg-gray-100"
                  >
                    Try AI version
                  </Button>
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-6 pb-8 px-6">
              <div className="prose prose-blue max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeHighlight]}
                  components={{
                    // Custom components for markdown elements
                    h1: ({ node, ...props }) => (
                      <h1
                        className="text-3xl font-bold mt-6 mb-4 text-blue-700"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-2xl font-bold mt-5 mb-3 text-blue-600"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-xl font-bold mt-4 mb-2 text-blue-500"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p
                        className="my-4 text-gray-700 leading-relaxed"
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="my-4 list-disc pl-6" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="my-4 list-decimal pl-6" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="mb-1" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-bold text-blue-700" {...props} />
                    ),
                    em: ({ node, ...props }) => (
                      <em className="italic text-indigo-600" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        className="text-blue-600 underline hover:text-blue-800"
                        {...props}
                      />
                    ),
                    code: ({
                      node,
                      inline,
                      className,
                      children,
                      ...props
                    }: {
                      node?: any;
                      inline?: boolean;
                      className?: string;
                      children?: React.ReactNode;
                    } & React.HTMLAttributes<HTMLElement>) => {
                      if (inline) {
                        return (
                          <code
                            className="px-1 py-0.5 bg-gray-100 rounded text-pink-600 font-mono text-sm"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                      return (
                        <div className="my-6 rounded-lg overflow-hidden">
                          <pre className="p-4 bg-gray-900 text-white overflow-x-auto">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      );
                    },
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="pl-4 border-l-4 border-blue-500 italic text-gray-600 my-4"
                        {...props}
                      />
                    ),
                  }}
                >
                  {explanation}
                </ReactMarkdown>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
                <Button
                  onClick={fetchExplanation}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    "Get New Explanation"
                  )}
                </Button>
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
