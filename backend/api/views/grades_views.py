from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

@swagger_auto_schema(
    method='get',
    operation_description="Retorna o boletim do aluno com notas P1, P2, Média, Frequência e Status."
)
@api_view(['GET'])
def get_student_grades(request, matricula):
    """
    Busca notas e frequência de um aluno específico.
    Calcula média e status automaticamente.
    """
    try:
        with connection.cursor() as cursor:
            # SQL AVANÇADO:
            # 1. Fazemos JOIN de Matricula com Turma, Disciplina, Professor e Pessoa (para pegar o nome do prof).
            # 2. Fazemos LEFT JOIN com Avaliação.
            # 3. Usamos MAX(CASE...) para transformar as linhas da tabela Avaliação em colunas P1 e P2.
            sql = """
                SELECT 
                    D.nome_disciplina,
                    P_PROF.nome AS nome_professor,
                    M.frequencia,
                    -- Pivoting para pegar Nota P1
                    MAX(CASE WHEN AV.id_avaliacao = 'P1' THEN AV.nota ELSE NULL END) as nota_p1,
                    -- Pivoting para pegar Nota P2
                    MAX(CASE WHEN AV.id_avaliacao = 'P2' THEN AV.nota ELSE NULL END) as nota_p2
                FROM MATRICULA M
                JOIN TURMA T ON M.fk_cod_turma = T.cod_turma AND M.fk_cod_disciplina = T.fk_cod_disciplina
                JOIN DISCIPLINA D ON T.fk_cod_disciplina = D.cod_disciplina
                JOIN PROFESSOR PR ON T.fk_matricula_prof = PR.matricula_professor
                JOIN PESSOA P_PROF ON PR.fk_cpf = P_PROF.cpf
                LEFT JOIN AVALIACAO AV ON M.fk_matricula_aluno = AV.fk_matricula_aluno 
                                      AND M.fk_cod_disciplina = AV.fk_cod_disciplina
                                      AND M.fk_cod_turma = AV.fk_cod_turma
                WHERE M.fk_matricula_aluno = %s
                GROUP BY D.nome_disciplina, P_PROF.nome, M.frequencia
            """
            
            cursor.execute(sql, [matricula])
            rows = cursor.fetchall()
            
            boletim = []
            
            for row in rows:
                nome_disciplina = row[0]
                nome_professor = row[1]
                frequencia = float(row[2]) if row[2] is not None else 0.0
                nota1 = float(row[3]) if row[3] is not None else 0.0
                nota2 = float(row[4]) if row[4] is not None else 0.0
                
                # Regra de Negócio (Cálculo da Média)
                # Se faltar alguma nota, consideramos que ainda está cursando ou nota é 0
                media = (nota1 + nota2) / 2
                
                # Regra de Status
                status_aluno = "Cursando"
                if row[3] is not None and row[4] is not None: # Se tem as duas notas
                    if media >= 7.0 and frequencia >= 75:
                        status_aluno = "Aprovado"
                    elif media < 4.0:
                        status_aluno = "Reprovado"
                    else:
                        status_aluno = "Final" # Entre 4 e 7
                
                boletim.append({
                    "subject": nome_disciplina,
                    "professor": nome_professor,
                    "grade1": nota1,
                    "grade2": nota2,
                    "average": media,
                    "attendance": frequencia,
                    "status": status_aluno
                })

        return Response(boletim, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)