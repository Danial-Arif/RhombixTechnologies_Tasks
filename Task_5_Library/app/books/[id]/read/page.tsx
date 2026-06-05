import BookReader from "@/components/BookReader";

export default async function ReadBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookReader bookId={id} />;
}
