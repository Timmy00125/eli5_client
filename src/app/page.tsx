"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ConceptResponse } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

// Set a fallback API URL if the environment variable is undefined
const API_URL = "https://eli5-server.onrender.com";

export default function Home() {
  const [concept, setConcept] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState<boolean>(false);

  useEffect(() => {
    // Fetch the explanation when the component mounts
    fetchExplanation();
  }, [useFallback]);

  const fetchExplanation = async () => {
    setLoading(true);
    try {
      // Use the fallback endpoint if the main one failed previously
      const endpoint = useFallback ? "/api/fallback-explain" : "/api/explain";
      console.log("Fetching from:", `${API_URL}${endpoint}`);

      const response = await fetch(`${API_URL}${endpoint}`);

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

  const retryMainEndpoint = () => {
    setUseFallback(false);
    fetchExplanation();
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
          <Card className="max-w-4xl mx-auto shadow-lg">
            <CardHeader className="bg-blue-500 text-white">
              <CardTitle className="text-2xl text-center">{concept}</CardTitle>
              {useFallback && (
                <p className="text-white text-sm text-center mt-2">
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
