"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { HistoryResponse, HistoryEntry } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchHistory();
  }, [isAuthenticated, router]);

  const fetchHistory = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(`Failed to fetch history: ${response.status}`);
      }

      const data: HistoryResponse = await response.json();
      setHistory(data.entries);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-blue-600">
              Learning History
            </h1>
          </div>

          {user && (
            <p className="text-lg text-gray-600">
              Welcome back,{" "}
              <span className="font-medium text-blue-600">{user.username}</span>
              ! Here are your past explanations.
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
            <Button onClick={fetchHistory}>Try Again</Button>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              No History Yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start learning and your explanations will appear here!
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Your First Explanation
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 mb-6">
              You have learned about{" "}
              <span className="font-medium text-blue-600">
                {history.length}
              </span>{" "}
              concepts so far!
            </p>

            {history.map((entry) => (
              <Card
                key={entry.id}
                className="shadow-md hover:shadow-lg transition-shadow"
              >
                <CardHeader
                  className="cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
                  onClick={() => toggleExpanded(entry.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-blue-700 mb-2">
                        {entry.concept}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(entry.created_at)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {expandedId === entry.id ? "Hide" : "Show"} Explanation
                    </Button>
                  </div>
                </CardHeader>

                {expandedId === entry.id && (
                  <CardContent className="pt-4">
                    <div className="prose prose-blue max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1
                              className="text-2xl font-bold mt-4 mb-3 text-blue-700"
                              {...props}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              className="text-xl font-bold mt-3 mb-2 text-blue-600"
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              className="text-lg font-bold mt-2 mb-2 text-blue-500"
                              {...props}
                            />
                          ),
                          p: ({ node, ...props }) => (
                            <p
                              className="my-3 text-gray-700 leading-relaxed"
                              {...props}
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="my-3 list-disc pl-6" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="my-3 list-decimal pl-6" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="mb-1" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong
                              className="font-bold text-blue-700"
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
                              <div className="my-4 rounded-lg overflow-hidden">
                                <pre className="p-3 bg-gray-900 text-white overflow-x-auto">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              </div>
                            );
                          },
                        }}
                      >
                        {entry.explanation}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
