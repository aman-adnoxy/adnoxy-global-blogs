import { supabase, BUCKETS } from '../lib/supabase';
import { parseMarkdownFile } from '../utils/markdown';
import { BlogPost } from '../types';

export const BlogService = {
  /**
   * Fetch all blog posts from Supabase storage
   */
  async getAllPosts(): Promise<BlogPost[]> {
    try {
      let allFiles: any[] = [];
      let page = 0;
      const PAGE_SIZE = 1000;
      let hasMore = true;

      // 1. List all files in the bucket with pagination
      while (hasMore) {
        const { data: files, error } = await supabase
          .storage
          .from(BUCKETS.POSTS)
          .list('', {
            limit: PAGE_SIZE,
            offset: page * PAGE_SIZE,
            sortBy: { column: 'name', order: 'asc' }
          });

        if (error) {
          console.error('Error listing files:', error);
          break;
        }

        if (files && files.length > 0) {
          allFiles = [...allFiles, ...files];
          if (files.length < PAGE_SIZE) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }

      // 2. Filter for .md files and download content
      const postsPromises = allFiles
        .filter(file => file.name.endsWith('.md'))
        .map(async (file) => {
          const { data, error: downloadError } = await supabase
            .storage
            .from(BUCKETS.POSTS)
            .download(file.name);

          if (downloadError) {
            console.error(`Error downloading ${file.name}:`, downloadError);
            return null;
          }

          const text = await data.text();
          const slug = file.name.replace('.md', '');

          // 3. Parse Metadata and HTML
          const post = await parseMarkdownFile(text, slug);

          // 4. Resolve Image URLs (if they are relative paths)
          if (post.coverImage && !post.coverImage.startsWith('http')) {
            post.coverImage = this.getPublicImageUrl(post.coverImage);
          }

          if (post.authorImage && !post.authorImage.startsWith('http')) {
            post.authorImage = this.getPublicImageUrl(post.authorImage);
          }

          return post;
        });

      const posts = (await Promise.all(postsPromises)).filter((p): p is BlogPost => p !== null);

      return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    }
    catch (error) {
      console.error('Failed to fetch posts from Supabase:', error);
      return [];
    }
  },

  getPublicImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const { data } = supabase.storage.from(BUCKETS.IMAGES).getPublicUrl(cleanPath);
    return data.publicUrl;
  },


};
