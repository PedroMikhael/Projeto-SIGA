import { useEffect, useState } from 'react';
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
  status: 'Aprovado' | 'Cursando' | 'Reprovado' | 'Final';
}

const Grades = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado': return 'bg-green-100 text-green-800';
      case 'Cursando': return 'bg-blue-100 text-blue-800';
      case 'Reprovado': return 'bg-red-100 text-red-800';
      case 'Final': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const overallAverage = grades.length
    ? (grades.reduce((sum, g) => sum + g.average, 0) / grades.length).toFixed(2)
    : "0.00";

  const overallAttendance = grades.length
    ? (grades.reduce((sum, g) => sum + g.attendance, 0) / grades.length).toFixed(1)
    : "0.0";

  const fetchGrades = async () => {
    try {
      const stored = localStorage.getItem("user_data");
      const user = stored ? JSON.parse(stored) : null;

      if (!user || !user.matricula) {
        console.error("Matrícula do aluno não encontrada no localStorage");
        setLoading(false);
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/students/${user.matricula}/grades/`);

      if (response.ok) {
        const data = await response.json();
        setGrades(Array.isArray(data) ? data : []);
      } else {
        console.error("Erro ao buscar notas:", response.statusText);
      }
    } catch (error) {
      console.error("Erro inesperado ao buscar notas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Meu Boletim</h1>
        <p className="text-muted-foreground mt-1">Acompanhe suas notas e frequência</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{overallAverage}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Frequência Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{overallAttendance}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Disciplinas Cursando</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{grades.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Disciplinas do Semestre</CardTitle>
          <CardDescription>Notas e frequência atualizadas pelos professores</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Carregando...</div>
          ) : grades.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">Nenhuma disciplina encontrada.</div>
          ) : (
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
                  {grades.map((g, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{g.subject}</TableCell>
                      <TableCell>{g.professor}</TableCell>
                      <TableCell className="text-center">{g.grade1.toFixed(1)}</TableCell>
                      <TableCell className="text-center">{g.grade2.toFixed(1)}</TableCell>
                      <TableCell className="text-center font-medium">{g.average.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{g.attendance}%</TableCell>
                      <TableCell className="text-center">
                        <Badge className={getStatusColor(g.status)}>{g.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Grades;
