import { EditForm } from "@/components/edit-form";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditForm id={id} />;
}
