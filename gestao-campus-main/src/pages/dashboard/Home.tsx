import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Calendar, TrendingUp } from 'lucide-react';

const DashboardHome = () => {
  const { user } = useAuth();

  const studentStats = [
    { title: 'Disciplinas Cursando', value: '5', icon: BookOpen, color: 'text-primary' },
    { title: 'Média Geral', value: '8.5', icon: TrendingUp, color: 'text-accent' },
    { title: 'Frequência Média', value: '92%', icon: Calendar, color: 'text-secondary' },
    { title: 'Créditos Concluídos', value: '120', icon: Users, color: 'text-primary' },
  ];

  const professorStats = [
    { title: 'Turmas Ativas', value: '3', icon: BookOpen, color: 'text-primary' },
    { title: 'Total de Alunos', value: '87', icon: Users, color: 'text-accent' },
    { title: 'Disciplinas', value: '2', icon: Calendar, color: 'text-secondary' },
  ];

  const stats = user?.type === 'student' ? studentStats : professorStats;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo, {user?.name}!</h1>
        <p className="text-muted-foreground mt-1">
          {user?.type === 'student' ? `Curso: ${user.course}` : `Departamento: ${user.department}`}
        </p>
      </div>

      <div className={`grid gap-4 md:grid-cols-2 ${user?.type === 'student' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card hover:shadow-hover transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Próximas Aulas</CardTitle>
            <CardDescription>Suas próximas atividades acadêmicas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">{i}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {user?.type === 'student' ? 'Algoritmos e Programação' : 'Turma A - Algoritmos'}
                    </p>
                    <p className="text-sm text-muted-foreground">Hoje às {8 + i}:00</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Avisos Importantes</CardTitle>
            <CardDescription>Últimas notificações do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg border-l-4 border-primary bg-muted/50">
                <p className="font-medium">Período de matrícula aberto</p>
                <p className="text-sm text-muted-foreground">Até 15/12/2025</p>
              </div>
              <div className="p-3 rounded-lg border-l-4 border-accent bg-muted/50">
                <p className="font-medium">Novo cardápio no RU</p>
                <p className="text-sm text-muted-foreground">Confira as novidades</p>
              </div>
              <div className="p-3 rounded-lg border-l-4 border-secondary bg-muted/50">
                <p className="font-medium">Atualização de notas</p>
                <p className="text-sm text-muted-foreground">Verifique seu boletim</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
