import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Grade {
  subject: string;
  professor: string;
  grade1: number;
  grade2: number;
  average: number;
  attendance: number;
  status: 'Aprovado' | 'Cursando' | 'Reprovado';
}

const Grades = () => {
  const currentGrades: Grade[] = [
    { 
      subject: 'Algoritmos e Programação I', 
      professor: 'Prof. Carlos Silva',
      grade1: 8.5, 
      grade2: 9.0, 
      average: 8.75, 
      attendance: 95,
      status: 'Cursando'
    },
    { 
      subject: 'Banco de Dados', 
      professor: 'Prof. Maria Santos',
      grade1: 7.5, 
      grade2: 8.0, 
      average: 7.75, 
      attendance: 92,
      status: 'Cursando'
    },
    { 
      subject: 'Estruturas de Dados', 
      professor: 'Prof. João Oliveira',
      grade1: 9.0, 
      grade2: 9.5, 
      average: 9.25, 
      attendance: 98,
      status: 'Cursando'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado': return 'bg-green-100 text-green-800';
      case 'Cursando': return 'bg-blue-100 text-blue-800';
      case 'Reprovado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const overallAverage = (currentGrades.reduce((sum, g) => sum + g.average, 0) / currentGrades.length).toFixed(2);
  const overallAttendance = (currentGrades.reduce((sum, g) => sum + g.attendance, 0) / currentGrades.length).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Meu Boletim</h1>
        <p className="text-muted-foreground mt-1">Acompanhe suas notas e frequência</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{overallAverage}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Frequência Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{overallAttendance}%</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Disciplinas Cursando</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{currentGrades.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Disciplinas do Semestre</CardTitle>
          <CardDescription>Notas e frequência atualizadas pelos professores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead className="text-center">Nota 1</TableHead>
                  <TableHead className="text-center">Nota 2</TableHead>
                  <TableHead className="text-center">Média</TableHead>
                  <TableHead className="text-center">Frequência</TableHead>
                  <TableHead className="text-center">Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentGrades.map((grade, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{grade.subject}</TableCell>
                    <TableCell>{grade.professor}</TableCell>
                    <TableCell className="text-center">{grade.grade1.toFixed(1)}</TableCell>
                    <TableCell className="text-center">{grade.grade2.toFixed(1)}</TableCell>
                    <TableCell className="text-center font-medium">{grade.average.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{grade.attendance}%</TableCell>
                    <TableCell className="text-center">
                      <Badge className={getStatusColor(grade.status)}>
                        {grade.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Grades;
