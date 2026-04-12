"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// mermaid is loaded dynamically (browser-only)
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mermaid component for diagrams
const Mermaid = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState("");
  const [id] = useState(() => `mermaid-${Math.random().toString(36).substring(2, 11)}`);

  useEffect(() => {
    const renderMermaid = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily: "Inter, system-ui, sans-serif",
        });
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
      } catch (err) {
        console.error("Mermaid error:", err);
      }
    };

    if (chart) {
      renderMermaid();
    }
  }, [chart, id]);

  return (
    <div className="my-6 bg-white/2 border border-white/6 rounded-xl p-4 flex justify-center overflow-x-auto">
      <div 
        dangerouslySetInnerHTML={{ __html: svg }} 
        className="[&>svg]:max-w-full [&>svg]:h-auto"
      />
    </div>
  );
};

interface ChartConfig {
    type: "bar" | "pie";
    data: Array<{ name: string; value: number }>;
}

// Chart component for JSON chart blocks
const Chart = ({ content }: { content: string }) => {
  let config: ChartConfig | null = null;
  let error: string | null = null;

  try {
    config = JSON.parse(content);
  } catch (err) {
    error = "Invalid JSON in chart block";
    console.error(err);
  }

  if (error || !config) {
    return <pre className="text-xs bg-red-500/10 p-2 rounded">{error || "Chart configuration missing"}</pre>;
  }

  const { type, data } = config;

  if (type === "bar") {
    return (
      <div className="h-72 my-6 bg-white/2 border border-white/6 rounded-2xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis dataKey="name" fontSize={11} stroke="#666" tickLine={false} axisLine={false} />
            <YAxis fontSize={11} stroke="#666" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ 
                  background: "#0a0a0a", 
                  border: "1px solid rgba(255,255,255,0.1)", 
                  borderRadius: "12px",
                  fontSize: "12px"
              }}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "pie") {
      const COLORS = ['#f97316', '#a855f7', '#3b82f6', '#10b981', '#f43f5e', '#eab308'];
      return (
        <div className="h-72 my-6 bg-white/2 border border-white/6 rounded-2xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ 
                  background: "#0a0a0a", 
                  border: "1px solid rgba(255,255,255,0.1)", 
                  borderRadius: "12px",
                  fontSize: "12px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
  }

  return <pre className="text-xs bg-red-500/10 p-2 rounded">Unsupported chart type: {type}</pre>;
};

export function VisualMarkdown({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:whitespace-pre-wrap prose-a:text-primary hover:prose-a:text-orange-400 prose-ul:list-disc prose-ul:ml-4 prose-th:text-left prose-td:border-t prose-td:border-white/10 prose-th:p-2 prose-td:p-2 prose-table:border prose-table:border-white/10 prose-table:rounded-lg text-sm text-foreground/80">
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    const lang = match ? match[1] : "";

                    if (lang === "mermaid") {
                        return <Mermaid chart={String(children).replace(/\n$/, "")} />;
                    }

                    if (lang === "chart") {
                        return <Chart content={String(children).replace(/\n$/, "")} />;
                    }

                    // For multiline code blocks that aren't custom
                    if (children && String(children).includes('\n')) {
                         return (
                            <pre className="bg-white/5 border border-white/10 rounded-xl p-4 my-4 overflow-x-auto">
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            </pre>
                         );
                    }

                    return (
                        <code className={`${className || ""} bg-white/10 px-1.5 py-0.5 rounded text-primary-light`} {...props}>
                            {children}
                        </code>
                    );
                },
                table({ children }) {
                    return (
                        <div className="my-6 overflow-x-auto rounded-xl border border-white/10 bg-white/2">
                            <table className="w-full border-collapse">
                                {children}
                            </table>
                        </div>
                    );
                }
            }}
        >
            {content}
        </ReactMarkdown>
    </div>
  );
}
