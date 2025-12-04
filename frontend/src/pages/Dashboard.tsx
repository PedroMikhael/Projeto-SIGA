import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom'; // Adicione Outlet aqui
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

const Dashboard = () => {
  const { isAuthenticated, loading } = useAuth(); // Pegue o loading
  const navigate = useNavigate();

  useEffect(() => {
    // Só redireciona se NÃO estiver carregando e NÃO estiver autenticado
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

  // Se estiver carregando, mostra uma tela branca ou loading simples
  // Isso impede que ele tente renderizar a Sidebar sem dados e quebre
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  // Se chegou aqui, está autenticado e carregado
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6 w-full">
          <SidebarTrigger />
          <Outlet /> {/* Isso aqui renderiza a página Enrollment dentro do Dashboard */}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;