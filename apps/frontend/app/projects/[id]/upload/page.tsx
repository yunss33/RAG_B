import { UploadForm } from "@/components/upload-form";

export default async function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UploadForm projectId={id} />;
}

