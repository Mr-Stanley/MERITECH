import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireAuth } from "@/lib/auth";
import { nanoid } from "nanoid";
import { S3Client } from "@aws-sdk/client-s3";

// Configure S3 client for Filebase (mirrors the provided structure)
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.FILEBASE_SECRET_ACCESS_KEY || "",
  },
  endpoint: "https://s3.filebase.com",
  region: "us-east-1",
  forcePathStyle: true,
  // Additional compatibility options
  useAccelerateEndpoint: false as any,
  useDualstackEndpoint: false as any,
  requestHandler: {
    requestTimeout: 30000,
  } as any,
});

function validateFile(file: any, allowedTypes: string[], maxSizeMB: number) {
  const fileType = file.mimetype || file.type;
  const fileSize = file.size;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!allowedTypes.includes(fileType)) {
    throw new Error(`Invalid file type. Only .jpg and .png allowed.`);
  }

  if (fileSize > maxSizeBytes) {
    throw new Error(`File too large. Maximum size: ${maxSizeMB}MB`);
  }

  return true;
}

async function uploadImageToS3(file: any) {
  const filePath = file.filepath || file.path;
  const originalName = file.originalFilename || file.name || "image";
  const ext = originalName.split(".").pop();
  const uniqueName = `product_${Date.now()}_${nanoid(6)}.${ext}`;

  const data = fs.readFileSync(filePath);
  const contentType = file.mimetype || file.type || "application/octet-stream";

  const params = {
    Bucket: process.env.FILEBASE_BUCKET_NAME || "",
    Key: `products/${uniqueName}`,
    ContentType: contentType,
    Body: data,
    CacheControl: "max-age=31536000",
    Metadata: {
      "original-filename": originalName,
      "upload-timestamp": new Date().toISOString(),
    },
  };

  await s3Client.send(new PutObjectCommand(params));

  // Generate presigned GET URL
  const getObjectCommand = new GetObjectCommand({
    Bucket: process.env.FILEBASE_BUCKET_NAME || "",
    Key: `products/${uniqueName}`,
  });

  const presignedUrl = await getSignedUrl(s3Client, getObjectCommand, {
    expiresIn: 60 * 60 * 24 * 365,
  }); // 1 year

  return presignedUrl;
}

export async function POST(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.json(
      { success: false, message: "Method not allowed, use POST" },
      { status: 405 }
    );
  }

  try {
    await requireAuth();
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  if (!process.env.FILEBASE_ACCESS_KEY_ID || !process.env.FILEBASE_SECRET_ACCESS_KEY) {
    console.error("Missing Filebase S3 credentials");
    return NextResponse.json(
      { success: false, error: "Storage service not configured" },
      { status: 500 }
    );
  }

  try {
    // Parse form data (App Router provides direct FormData)
    const formData = await request.formData();
    // First file-like entry
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Read File into buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a temp file-like object compatible with the provided pattern
    const tempFile = {
      mimetype: file.type,
      size: file.size,
      name: file.name,
      originalFilename: file.name,
      type: file.type,
      data: buffer,
    } as any;

    try {
      validateFile(tempFile, ["image/jpeg", "image/png"], 5);
    } catch (e: any) {
      return NextResponse.json(
        { success: false, message: e.message },
        { status: 400 }
      );
    }

    // Derive content type like the provided file
    const originalName = tempFile.originalFilename || tempFile.name || "image";
    let contentType = tempFile.mimetype || tempFile.type || "application/octet-stream";
    if (originalName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      if (contentType === "application/octet-stream") {
        const ext = originalName.toLowerCase().split(".").pop();
        contentType = `image/${ext === "jpg" ? "jpeg" : ext}`;
      }
    }

    const uniqueName = `${Date.now()}-${nanoid(6)}-${originalName}`;

    const params = {
      Bucket: process.env.FILEBASE_BUCKET_NAME || "",
      Key: `products/${uniqueName}`,
      ContentType: contentType,
      Body: buffer,
      CacheControl: "max-age=31536000",
      Metadata: {
        "original-filename": originalName,
        "upload-timestamp": new Date().toISOString(),
      },
    } as const;

    // Log minimal info for debugging
    console.log("Uploading to S3 with params:", {
      Bucket: params.Bucket,
      Key: params.Key,
      ContentType: params.ContentType,
      BodySize: buffer.length,
    });

    try {
      const uploadResult = await s3Client.send(new PutObjectCommand(params));
      console.log("S3 upload result:", uploadResult?.$metadata);
    } catch (s3Error: any) {
      console.error("S3 Upload Error Details:", {
        name: s3Error?.name,
        message: s3Error?.message,
        code: s3Error?.code,
        statusCode: s3Error?.$metadata?.httpStatusCode,
        requestId: s3Error?.$metadata?.requestId,
      });
      return NextResponse.json(
        { success: false, message: "Failed to upload image to storage" },
        { status: 500 }
      );
    }

    // Generate presigned GET URL
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.FILEBASE_BUCKET_NAME || "",
      Key: `products/${uniqueName}`,
    });

    const presignedUrl = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 60 * 60 * 24 * 7, // 7 days (to mirror provided file)
    });

    return NextResponse.json({
      success: true,
      message: "Product image uploaded.",
      url: presignedUrl,
    });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { success: false, message: `Upload failed: ${e.message}` },
      { status: 500 }
    );
  }
}
