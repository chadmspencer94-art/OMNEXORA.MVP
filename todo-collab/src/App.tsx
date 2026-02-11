import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/AuthForm';
import { TodoList } from './components/TodoList';

function App() {
  const { user, loading, isDemoMode, signIn, signUp, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />;
  }

  return (
    <TodoList
      userId={user.id}
      userEmail={user.email}
      isDemoMode={isDemoMode}
      onSignOut={signOut}
    />
  );
}

export default App;
