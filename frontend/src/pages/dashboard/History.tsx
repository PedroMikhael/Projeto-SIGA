import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface HistoryRecord {
  semester: string;
  subject: string;
  finalGrade: number;
  status: 'Aprovado' | 'Reprovado';
  credits: number;
}

const History = () => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const getStatusColor = (status: string) => {
    return status === 'Aprovado' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const stored = localStorage.getItem("user_data");
        const user = stored ? JSON.parse(stored) : null;

        if (!user || !user.matricula) {
          console.error("Matrícula do usuário não encontrada");
          return;
        }

        const response = await fetch(`http://127.0.0.1:8000/api/students/${user.matricula}/history/`);
        if (!response.ok) {
          console.error("Erro ao buscar histórico");
          return;
        }

        const data: HistoryRecord[] = await response.json();
        setHistory(data);
      } catch (error) {
        console.error("Erro inesperado:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Agrupa por semestre
  const groupedHistory = history.reduce((acc, record) => {
    if (!acc[record.semester]) acc[record.semester] = [];
    acc[record.semester].push(record);
    return acc;
  }, {} as Record<string, HistoryRecord[]>);

  const totalCredits = history.reduce((sum, r) => sum + r.credits, 0);
  const overallAverage = history.length > 0 
    ? (history.reduce((sum, r) => sum + r.finalGrade, 0) / history.length).toFixed(2)
    : "0.00";
  const approvedSubjects = history.filter(r => r.status === 'Aprovado').length;

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Carregando histórico...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Histórico Escolar</h1>
        <p className="text-muted-foreground mt-1">Seu desempenho acadêmico completo</p>
      </div>

      {/* Cards superiores */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card bg-gradient-primary text-primary-foreground">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Créditos Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCredits}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Coeficiente de Rendimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{overallAverage}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Disciplinas Aprovadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{approvedSubjects}</div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico por semestre */}
      {Object.entries(groupedHistory).reverse().map(([semester, records]) => (
        <Card key={semester} className="shadow-card">
          <CardHeader>
            <CardTitle>Semestre {semester}</CardTitle>
            <CardDescription>
              {records.length} disciplinas • {records.reduce((sum, r) => sum + r.credits, 0)} créditos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Disciplina</TableHead>
                    <TableHead className="text-center">Créditos</TableHead>
                    <TableHead className="text-center">Média Final</TableHead>
                    <TableHead className="text-center">Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{record.subject}</TableCell>
                      <TableCell className="text-center">{record.credits}</TableCell>
                      <TableCell className="text-center font-medium">{record.finalGrade.toFixed(1)}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Média do semestre: {(records.reduce((sum, r) => sum + r.finalGrade, 0) / records.length).toFixed(2)}
              </span>
              <span className="text-sm font-medium">
                Total: {records.reduce((sum, r) => sum + r.credits, 0)} créditos
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default History;
