import React from "react";

/**
 * Formats markdown text into React components
 * Handles: **bold**, *italic*, `code`, paragraphs, and line breaks
 */
export function formatMarkdown(text) {
  if (!text) return null;

  // Split by paragraphs (double newlines)
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());

  return paragraphs.map((paragraph, pIndex) => {
    const lines = paragraph.trim().split("\n");

    return (
      <div key={pIndex} className="mb-4 last:mb-0">
        {lines.map((line, lIndex) => {
          if (!line.trim()) return null;

          // Process markdown patterns
          const parts = [];
          let remaining = line;
          let key = 0;

          // Find all markdown patterns with their positions
          const patterns = [];

          // Bold: **text**
          let boldMatch;
          const boldRegex = /\*\*([^*]+)\*\*/g;
          while ((boldMatch = boldRegex.exec(line)) !== null) {
            patterns.push({
              start: boldMatch.index,
              end: boldMatch.index + boldMatch[0].length,
              type: "bold",
              content: boldMatch[1],
            });
          }

          // Italic: *text* (but not **text**)
          let italicMatch;
          const italicRegex = /(?<!\*)\*([^*]+)\*(?!\*)/g;
          while ((italicMatch = italicRegex.exec(line)) !== null) {
            // Check if it's not part of a bold
            const isPartOfBold = patterns.some(
              (p) =>
                p.type === "bold" &&
                italicMatch.index >= p.start &&
                italicMatch.index < p.end
            );
            if (!isPartOfBold) {
              patterns.push({
                start: italicMatch.index,
                end: italicMatch.index + italicMatch[0].length,
                type: "italic",
                content: italicMatch[1],
              });
            }
          }

          // Code: `text`
          let codeMatch;
          const codeRegex = /`([^`]+)`/g;
          while ((codeMatch = codeRegex.exec(line)) !== null) {
            patterns.push({
              start: codeMatch.index,
              end: codeMatch.index + codeMatch[0].length,
              type: "code",
              content: codeMatch[1],
            });
          }

          // Sort by position
          patterns.sort((a, b) => a.start - b.start);

          // Build parts
          if (patterns.length === 0) {
            return (
              <p
                key={lIndex}
                className="leading-relaxed mb-2 last:mb-0 text-textLight"
              >
                {line}
              </p>
            );
          }

          let lastIndex = 0;
          const renderedParts = [];

          patterns.forEach((pattern) => {
            // Add text before pattern
            if (pattern.start > lastIndex) {
              renderedParts.push(
                <span key={key++}>
                  {line.substring(lastIndex, pattern.start)}
                </span>
              );
            }

            // Add pattern component
            if (pattern.type === "bold") {
              renderedParts.push(
                <strong key={key++} className="font-semibold text-textLight">
                  {pattern.content}
                </strong>
              );
            } else if (pattern.type === "italic") {
              renderedParts.push(
                <em key={key++} className="italic text-textLight/90">
                  {pattern.content}
                </em>
              );
            } else if (pattern.type === "code") {
              renderedParts.push(
                <code
                  key={key++}
                  className="bg-black/50 px-1.5 py-0.5 rounded text-orange-400 font-mono text-sm"
                >
                  {pattern.content}
                </code>
              );
            }

            lastIndex = pattern.end;
          });

          // Add remaining text
          if (lastIndex < line.length) {
            renderedParts.push(
              <span key={key++}>{line.substring(lastIndex)}</span>
            );
          }

          return (
            <p
              key={lIndex}
              className="leading-relaxed mb-2 last:mb-0 text-textLight"
            >
              {renderedParts}
            </p>
          );
        })}
      </div>
    );
  });
}

