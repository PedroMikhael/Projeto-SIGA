import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, TrendingUp, Users, Award, BookOpen } from 'lucide-react';

const Reports = () => {
  const disciplineAverages = [
    { discipline: 'Algoritmos e Programação I', average: 8.2, students: 45 },
    { discipline: 'Banco de Dados', average: 7.8, students: 38 },
    { discipline: 'Estrutura de Dados', average: 7.5, students: 42 },
    { discipline: 'Cálculo I', average: 6.8, students: 50 },
    { discipline: 'Programação Web', average: 8.5, students: 35 },
  ];

  const topStudentsByDiscipline = [
    { 
      discipline: 'Algoritmos e Programação I',
      students: [
        { name: 'Maria Silva', average: 9.8 },
        { name: 'João Pedro', average: 9.5 },
        { name: 'Ana Costa', average: 9.3 }
      ]
    },
    { 
      discipline: 'Banco de Dados',
      students: [
        { name: 'Carlos Oliveira', average: 9.6 },
        { name: 'Fernanda Lima', average: 9.4 },
        { name: 'Pedro Santos', average: 9.2 }
      ]
    },
    { 
      discipline: 'Estrutura de Dados',
      students: [
        { name: 'Julia Santos', average: 9.7 },
        { name: 'Lucas Ferreira', average: 9.3 },
        { name: 'Beatriz Alves', average: 9.1 }
      ]
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Relatórios Avançados</h1>
        <p className="text-muted-foreground mt-1">Análises e estatísticas do sistema acadêmico</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">210</div>
            <p className="text-xs text-muted-foreground">+12% vs semestre anterior</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.8</div>
            <p className="text-xs text-muted-foreground">+0.3 vs semestre anterior</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+5% vs semestre anterior</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disciplinas Ativas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Ativas no sistema</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Média de Notas por Disciplina</CardTitle>
          <CardDescription>Análise comparativa do desempenho acadêmico</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Disciplina</TableHead>
                  <TableHead className="text-center">Alunos</TableHead>
                  <TableHead className="text-center">Média</TableHead>
                  <TableHead className="text-center">Desempenho</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disciplineAverages.map((item) => (
                  <TableRow key={item.discipline}>
                    <TableCell className="font-medium">{item.discipline}</TableCell>
                    <TableCell className="text-center">{item.students}</TableCell>
                    <TableCell className="text-center font-medium">{item.average.toFixed(1)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-primary h-2 rounded-full transition-all"
                            style={{ width: `${(item.average / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Melhores Alunos por Disciplina</CardTitle>
          <CardDescription>Top 3 alunos com melhor desempenho em cada disciplina</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topStudentsByDiscipline.map((item, index) => (
              <Card key={index} className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{item.discipline}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.students.map((student, studentIndex) => (
                    <div key={studentIndex} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          studentIndex === 0 ? 'bg-gradient-primary' : 'bg-muted'
                        }`}>
                          <span className={`text-sm font-bold ${
                            studentIndex === 0 ? 'text-primary-foreground' : 'text-muted-foreground'
                          }`}>
                            {studentIndex + 1}
                          </span>
                        </div>
                        <p className="font-medium text-sm">{student.name}</p>
                      </div>
                      <Badge variant={studentIndex === 0 ? 'default' : 'outline'}>
                        {student.average.toFixed(1)}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
