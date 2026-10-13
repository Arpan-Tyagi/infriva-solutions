"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatbotMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
        ul: ({ ...props }) => <ul className="ml-4 list-disc mb-2 last:mb-0" {...props} />,
        ol: ({ ...props }) => <ol className="ml-4 list-decimal mb-2 last:mb-0" {...props} />,
        li: ({ ...props }) => <li className="mb-1 last:mb-0" {...props} />,
        strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
        a: ({ ...props }) => (
          <a className="underline underline-offset-2 hover:text-brand-500" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
