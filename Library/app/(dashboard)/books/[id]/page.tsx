import BookDetails from "@/components/BookDetails";

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookDetails bookId={id} />;
}
