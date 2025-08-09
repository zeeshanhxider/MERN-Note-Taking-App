// Simple markdown-style text formatter for preview mode
export const formatText = (text) => {
  if (!text) return "";

  let formatted = text;

  // Convert **text** to bold
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert *text* to italic
  formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Convert __text__ to underline
  formatted = formatted.replace(/__(.*?)__/g, "<u>$1</u>");

  // Convert code blocks FIRST (before inline code to avoid conflicts)
  // Handle both proper ```lang and malformed `lang blocks
  formatted = formatted.replace(
    /```(\w+)?\s*([\s\S]*?)```/g,
    '<pre class="bg-base-300 p-4 rounded-lg mt-2 mb-2 overflow-x-auto"><code class="text-sm font-mono">$2</code></pre>'
  );

  // Handle malformed single-backtick code blocks (common AI mistake)
  formatted = formatted.replace(
    /`(\w+)\s*([\s\S]*?)`/g,
    '<pre class="bg-base-300 p-4 rounded-lg mt-2 mb-2 overflow-x-auto"><code class="text-sm font-mono">$2</code></pre>'
  );

  // Convert `code` to inline code (after code blocks) - only single words/short phrases
  formatted = formatted.replace(
    /`([^`\n]+)`/g,
    '<code class="bg-base-300 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
  );

  // Convert ### to h3
  formatted = formatted.replace(
    /^### (.*$)/gm,
    '<h3 class="text-lg font-bold mt-3 mb-2">$1</h3>'
  );

  // Convert ## to h2
  formatted = formatted.replace(
    /^## (.*$)/gm,
    '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>'
  );

  // Convert # to h1
  formatted = formatted.replace(
    /^# (.*$)/gm,
    '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>'
  );

  // Convert - or * at start of line to bullet points
  formatted = formatted.replace(
    /^[\-\*] (.*$)/gm,
    '<li class="ml-4">• $1</li>'
  );

  // Wrap consecutive list items in ul
  formatted = formatted.replace(
    /(<li.*<\/li>\s*)+/g,
    '<ul class="mb-2">$&</ul>'
  );

  // Convert line breaks to <br>
  formatted = formatted.replace(/\n/g, "<br>");

  return formatted;
};

// Check if text contains formatting
export const hasFormatting = (text) => {
  const patterns = [
    /\*\*(.*?)\*\*/, // bold
    /\*(.*?)\*/, // italic
    /__(.*?)__/, // underline
    /`([^`\n]+)`/, // inline code
    /```[\s\S]*?```/, // proper code blocks
    /`\w+\s*[\s\S]*?`/, // malformed code blocks
    /^#{1,3} /m, // headers (including ###)
    /^[\-\*] /m, // lists
  ];

  return patterns.some((pattern) => pattern.test(text));
};
