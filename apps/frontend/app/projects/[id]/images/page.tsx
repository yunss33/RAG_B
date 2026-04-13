import { ImageSelectionForm } from "@/components/image-selection-form";
import { getImageSuggestions } from "@/lib/api";

export default async function ImagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const suggestions = await getImageSuggestions(id);
  return <ImageSelectionForm projectId={id} suggestions={suggestions} />;
}

