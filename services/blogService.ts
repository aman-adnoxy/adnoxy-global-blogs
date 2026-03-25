import { r2Client, BUCKETS } from '../lib/r2';
import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { parseMarkdownFile } from '../utils/markdown';
import { BlogPost } from '../types';

export const BlogService = {
  /**
   * Fetch all blog posts from Cloudflare R2 storage
   */
  async getAllPosts(): Promise<BlogPost[]> {
    try {
      let allFiles: any[] = [];
      let continuationToken: string | undefined = undefined;

      // 1. List all files in the bucket with pagination
      let hasMore = true;
      while (hasMore) {
        const command = new ListObjectsV2Command({
          Bucket: BUCKETS.POSTS,
          ContinuationToken: continuationToken,
          MaxKeys: 1000,
        });
        const response = await r2Client.send(command).catch(err => {
          console.error('Error sending ListObjects command:', err);
          return null;
        });
        
        if (!response) break;
        
        const contents = response.Contents || [];
        allFiles = [...allFiles, ...contents];
        
        if (response.IsTruncated) {
          continuationToken = response.NextContinuationToken;
        } else {
          hasMore = false;
        }
      }

      // 2. Filter for .md files and download content
      const postsPromises = allFiles
        .filter(file => file.Key && file.Key.endsWith('.md'))
        .map(async (file) => {
          try {
            const command = new GetObjectCommand({
              Bucket: BUCKETS.POSTS,
              Key: file.Key!,
            });
            const response = await r2Client.send(command);
            if (!response.Body) return null;
            
            const text = await response.Body.transformToString();
            const slug = file.Key!.replace('.md', '');

            // 3. Parse Metadata and HTML
            const post = await parseMarkdownFile(text, slug);

            // 4. Resolve Image URLs (if they are relative paths)
            if (post.coverImage && !post.coverImage.startsWith('http')) {
              post.coverImage = await this.getPublicImageUrl(post.coverImage);
            }

            if (post.authorImage && !post.authorImage.startsWith('http')) {
              post.authorImage = await this.getPublicImageUrl(post.authorImage);
            }

            return post;
          } catch (downloadError) {
            console.error(`Error downloading ${file.Key}:`, downloadError);
            return null;
          }
        });

      const posts = (await Promise.all(postsPromises)).filter((p): p is BlogPost => p !== null);

      return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    }
    catch (error) {
      console.error('Failed to fetch posts from R2:', error);
      return [];
    }
  },

  async getPublicImageUrl(path: string): Promise<string> {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const command = new GetObjectCommand({
      Bucket: BUCKETS.IMAGES,
      Key: cleanPath,
    });
    // Generate a signed URL that expires in 1 hour
    return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  },

};
