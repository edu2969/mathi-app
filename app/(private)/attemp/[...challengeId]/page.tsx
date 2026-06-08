import ExcerciseAttemp from "@/app/components/ExcerciseAttemp";

type PageProps = {
  params: Promise<{ challengeId: string }>;
};

export default async function AttemptPage({ params }: PageProps) {
  const { challengeId } = await params as unknown as { challengeId: string };
  if(!challengeId) {
    return <div>Challenge ID is missing</div>;
  }
  
  return <ExcerciseAttemp challengeId={challengeId} />
}