/**
 * Check if a URL is a presigned URL (contains AWS signature parameters)
 * Presigned URLs don't work well with Next.js Image optimization
 */
export function isPresignedUrl(url: string): boolean {
  if (!url) return false;
  // Presigned URLs typically contain AWS signature parameters
  return (
    url.includes("X-Amz-Algorithm") ||
    url.includes("X-Amz-Signature") ||
    url.includes("X-Amz-Credential") ||
    (url.includes("s3.filebase.com") && url.includes("?"))
  );
}

