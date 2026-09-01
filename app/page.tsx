import AuthGate from '@/components/AuthGate';
import ReadingLibrary from '@/components/ReadingLibrary';

export default function Home() {
  return (
    <main className="min-h-screen">
      <AuthGate>
        <ReadingLibrary />
      </AuthGate>
    </main>
  );
}
