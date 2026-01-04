export default async function Page({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  return <div>Event: {id}</div>;
}
