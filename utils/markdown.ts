import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { BlogPost } from '../types';

/**
 * Manual YAML frontmatter parser for browser environment
 */
const parseFrontmatter = (fileContent: string): { data: any; content: string } => {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);
  
  if (!match) {
    return { data: {}, content: fileContent };
  }
  
  const yamlContent = match[1];
  const markdownContent = match[2];
  const data: any = {};
  
  const lines = yamlContent.split('\n');
  let currentKey: string | null = null;
  let currentObject: any = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = trimmed.substring(0, colonIndex).trim();
    let value: any = trimmed.substring(colonIndex + 1).trim();
    
    // Detect if this is a nested object (value is empty and next line is indented)
    if (!value && i + 1 < lines.length && lines[i + 1].startsWith('  ')) {
      currentKey = key;
      currentObject = {};
      data[key] = currentObject;
      continue;
    }
    
    // Check if we're inside a nested object
    if (line.startsWith('  ') && currentObject && currentKey) {
      // This is a nested property
      currentObject[key] = parseValue(value);
      continue;
    } else {
      // Reset nested object tracking if we're back to root level
      currentKey = null;
      currentObject = null;
    }
    
    // Parse root level property
    data[key] = parseValue(value);
  }
  
  return { data, content: markdownContent };
};

/**
 * Parse a YAML value (string, number, array, etc.)
 */
const parseValue = (value: string): any => {
  if (!value) return '';
  
  // Remove quotes
  if ((value.startsWith("'") && value.endsWith("'")) || 
      (value.startsWith('"') && value.endsWith('"'))) {
    return value.slice(1, -1);
  }
  
  // Handle arrays
  if (value.startsWith('[') && value.endsWith(']')) {
    return value.slice(1, -1).split(',').map((v: string) => {
      const trimmed = v.trim();
      if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || 
          (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
        return trimmed.slice(1, -1);
      }
      return trimmed;
    }).filter(v => v); // Remove empty strings
  }
  
  // Handle numbers
  if (!isNaN(Number(value)) && value !== '') {
    return Number(value);
  }
  
  return value;
};

/**
 * Parses a raw markdown string with YAML frontmatter.
 * Structure expected:
 * ---
 * title: My Blog
 * ...
 * ---
 * # Header
 * Content...
 */
export const parseMarkdownFile = async (fileContent: string, slug: string): Promise<BlogPost> => {
  let metadata: any = {};
  let content = fileContent;

  try {
    const parsed = parseFrontmatter(fileContent);
    metadata = parsed.data || {};
    content = parsed.content || '';
  } catch (e) {
    console.warn(`Frontmatter parsing failed for ${slug}, falling back to raw content.`, e);
    content = fileContent.replace(/^---\n[\s\S]*?\n---\n/, '');
  }

  // Configure marked options for better HTML output
  marked.setOptions({
    breaks: false,
    gfm: true
  });

  // Parse Content to HTML
  const parsedContent = await marked.parse(content);
  
  // Sanitize but preserve all standard HTML tags and attributes
  const htmlContent = DOMPurify.sanitize(parsedContent, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'strong', 'em', 'img', 'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id']
  });

  // Handle Reading Time (convert "10 minutes" string to number if necessary)
  let readingTime = 5;
  if (metadata.readingTime) {
    if (typeof metadata.readingTime === 'number') {
      readingTime = metadata.readingTime;
    } else if (typeof metadata.readingTime === 'string') {
      const parsed = parseInt(metadata.readingTime, 10);
      if (!isNaN(parsed)) {
        readingTime = parsed;
      }
    }
  }

  // Handle Category (Fallback to first tag or 'General')
  let category = metadata.category;
  if (!category && metadata.tags && Array.isArray(metadata.tags) && metadata.tags.length > 0) {
    category = metadata.tags[0];
  } else if (!category) {
    category = 'General';
  }

  // Ensure tags is always an array
  const tags = Array.isArray(metadata.tags) ? metadata.tags : [];

  return {
    id: metadata.id || Date.now(),
    slug: metadata.slug || slug, // Use metadata slug if available
    title: metadata.title || 'Untitled',
    publishedAt: metadata.publishedAt || new Date().toISOString(),
    updatedAt: metadata.updatedAt,
    author: metadata.author || 'Adnoxy Editorial',
    authorImage: metadata.authorImage || '/images/default-avatar.png',
    excerpt: metadata.excerpt || '',
    coverImage: metadata.coverImage || '',
    tags: tags,
    readingTime: readingTime,
    status: metadata.status || 'draft',
    category: category,
    content: htmlContent,
    metadata: metadata.metadata
  } as BlogPost;
};