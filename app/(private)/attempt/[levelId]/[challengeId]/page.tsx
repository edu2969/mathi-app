import ExcerciseAttemp from "@/app/components/ExcerciseAttempt";

type PageProps = {
  params: Promise<{ challengeId: string, levelId: string }>;  
};

export default async function AttemptPage({ params }: PageProps) {
  const { challengeId, levelId } = await params;
  if(!challengeId || !levelId) {
    return <div>Challenge ID / Level ID - missing</div>;
  } else {
    console.log("PARAMS --->", challengeId, levelId);
  }
  
  return <ExcerciseAttemp 
    challengeId={challengeId} 
    levelId={levelId} />
}