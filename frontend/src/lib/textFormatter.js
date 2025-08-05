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

  // Convert `code` to inline code
  formatted = formatted.replace(
    /`(.*?)`/g,
    '<code class="bg-base-300 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
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
    /`(.*?)`/, // code
    /^#{1,2} /m, // headers
    /^[\-\*] /m, // lists
  ];

  return patterns.some((pattern) => pattern.test(text));
};
