import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, TrendingUp, Users, Award, BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Interfaces dos dados vindos da API
interface DashboardData {
  kpis: {
    total_students: number;
    global_average: number;
    approval_rate: number;
    active_disciplines: number;
  };
  discipline_averages: {
    discipline: string;
    average: number;
    students: number;
  }[];
  top_students: {
    discipline: string;
    students: {
      name: string;
      average: number;
    }[];
  }[];
}

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.matricula) return;

    const fetchReports = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/professores/${user.matricula}/reports/`);
        
        if (res.ok) {
          const result = await res.json();
          setData(result);
        } else {
          throw new Error('Falha ao carregar relatórios');
        }
      } catch (error) {
        console.error(error);
        toast({ title: 'Erro', description: 'Não foi possível carregar os dados estatísticos.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  if (loading) {
    return (
        <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Calculando estatísticas...</p>
        </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Relatórios Avançados</h1>
        <p className="text-muted-foreground mt-1">Análises e estatísticas do desempenho acadêmico das suas turmas</p>
      </div>

      {/* KPIS GERAIS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.total_students}</div>
            <p className="text-xs text-muted-foreground">Alunos distintos matriculados</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.global_average}</div>
            <p className="text-xs text-muted-foreground">Média de todas as notas</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.approval_rate}%</div>
            <p className="text-xs text-muted-foreground">Alunos com média &ge; 7.0</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disciplinas Ativas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.active_disciplines}</div>
            <p className="text-xs text-muted-foreground">Turmas com alunos</p>
          </CardContent>
        </Card>
      </div>

      {/* MÉDIA POR DISCIPLINA */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Desempenho por Disciplina</CardTitle>
          <CardDescription>Comparativo de média de notas entre suas turmas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Disciplina</TableHead>
                  <TableHead className="text-center">Alunos</TableHead>
                  <TableHead className="text-center">Média da Turma</TableHead>
                  <TableHead className="text-center">Indicador</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.discipline_averages.map((item) => (
                  <TableRow key={item.discipline}>
                    <TableCell className="font-medium">{item.discipline}</TableCell>
                    <TableCell className="text-center">{item.students}</TableCell>
                    <TableCell className="text-center font-bold text-slate-700">{item.average.toFixed(1)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-2.5 rounded-full transition-all ${
                                item.average >= 7 ? 'bg-green-500' : item.average >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min((item.average / 10) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-left">
                            {((item.average / 10) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {data.discipline_averages.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                            Nenhuma turma com notas lançadas ainda.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* TOP ALUNOS */}
      {data.top_students.length > 0 && (
        <Card className="shadow-card border-none bg-transparent shadow-none">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">Destaques Acadêmicos</h2>
                <p className="text-sm text-gray-500">Top 3 alunos com melhores médias por disciplina</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.top_students.map((item, index) => (
                <Card key={index} className="shadow-hover hover:scale-[1.01] transition-transform">
                <CardHeader className="pb-3 border-b bg-slate-50/50">
                    <CardTitle className="text-base font-semibold text-primary truncate" title={item.discipline}>
                        {item.discipline}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    {item.students.map((student, studentIndex) => (
                    <div key={studentIndex} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                            studentIndex === 0 ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200' : 
                            studentIndex === 1 ? 'bg-slate-100 text-slate-700' : 'bg-orange-50 text-orange-800'
                        }`}>
                            {studentIndex + 1}º
                        </div>
                        <p className="font-medium text-sm truncate max-w-[140px]" title={student.name}>{student.name}</p>
                        </div>
                        <Badge variant="secondary" className={`font-mono ${studentIndex === 0 ? 'bg-green-50 text-green-700 hover:bg-green-100' : ''}`}>
                        {student.average.toFixed(1)}
                        </Badge>
                    </div>
                    ))}
                    {item.students.length === 0 && <p className="text-xs text-muted-foreground text-center">Sem notas lançadas</p>}
                </CardContent>
                </Card>
            ))}
            </div>
        </Card>
      )}
    </div>
  );
};

export default Reports;