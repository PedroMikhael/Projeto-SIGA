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
  const history: HistoryRecord[] = [
    { semester: '2024.2', subject: 'Introdução à Computação', finalGrade: 9.0, status: 'Aprovado', credits: 4 },
    { semester: '2024.2', subject: 'Cálculo I', finalGrade: 8.5, status: 'Aprovado', credits: 6 },
    { semester: '2024.2', subject: 'Álgebra Linear', finalGrade: 7.5, status: 'Aprovado', credits: 4 },
    { semester: '2024.1', subject: 'Lógica de Programação', finalGrade: 9.5, status: 'Aprovado', credits: 4 },
    { semester: '2024.1', subject: 'Matemática Discreta', finalGrade: 8.0, status: 'Aprovado', credits: 4 },
    { semester: '2024.1', subject: 'Física I', finalGrade: 7.0, status: 'Aprovado', credits: 6 },
  ];

  const groupedHistory = history.reduce((acc, record) => {
    if (!acc[record.semester]) {
      acc[record.semester] = [];
    }
    acc[record.semester].push(record);
    return acc;
  }, {} as Record<string, HistoryRecord[]>);

  const totalCredits = history.reduce((sum, record) => sum + record.credits, 0);
  const overallAverage = (history.reduce((sum, record) => sum + record.finalGrade, 0) / history.length).toFixed(2);
  const approvedSubjects = history.filter(r => r.status === 'Aprovado').length;

  const getStatusColor = (status: string) => {
    return status === 'Aprovado' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Histórico Escolar</h1>
        <p className="text-muted-foreground mt-1">Seu desempenho acadêmico completo</p>
      </div>

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
                  {records.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.subject}</TableCell>
                      <TableCell className="text-center">{record.credits}</TableCell>
                      <TableCell className="text-center font-medium">
                        {record.finalGrade.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
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
