from typing import Any, List, Tuple, Optional

from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


@swagger_auto_schema(
    method="get",
    operation_description="Retorna o boletim do aluno com notas N1, N2, Média, Frequência e Status.",
    manual_parameters=[
        openapi.Parameter(
            name="matricula",
            in_=openapi.IN_PATH,
            description="Matrícula do aluno",
            type=openapi.TYPE_STRING,
            required=True,
        )
    ],
)
@api_view(["GET"])
def get_student_grades(request, matricula) -> Response:
    """
    Busca notas e frequência de um aluno específico.
    Calcula média e status automaticamente.
    """
    try:
        with connection.cursor() as cursor:
            # SQL otimizado com CASE WHEN para transformar linhas (N1, N2) em colunas
            sql = """
                SELECT 
                    D.nome_disciplina,
                    P_PROF.nome AS nome_professor,
                    M.frequencia,
                    MAX(CASE WHEN AV.id_avaliacao = 'N1' THEN AV.nota ELSE NULL END) as nota_n1,
                    MAX(CASE WHEN AV.id_avaliacao = 'N2' THEN AV.nota ELSE NULL END) as nota_n2
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
            rows: List[Tuple[Any, ...]] = cursor.fetchall()

            boletim: List[dict] = []

            for row in rows:
                nome_disciplina = row[0]
                nome_professor = row[1]
                # Se frequência for None, assume 100% (ainda não lançada ou total)
                frequencia = float(row[2]) if row[2] is not None else 100.0
                
                # Notas podem ser None se não lançadas
                raw_n1 = row[3]
                raw_n2 = row[4]
                
                nota1 = float(raw_n1) if raw_n1 is not None else 0.0
                nota2 = float(raw_n2) if raw_n2 is not None else 0.0

                media = (nota1 + nota2) / 2

                # Lógica de Status
                status_aluno = "Cursando"
                
                # Só calcula status final se AMBAS as notas existirem
                if raw_n1 is not None and raw_n2 is not None:
                    if frequencia < 75:
                        status_aluno = "Reprovado por Falta"
                    elif media >= 7.0:
                        status_aluno = "Aprovado"
                    elif media < 4.0:
                        status_aluno = "Reprovado"
                    else:
                        status_aluno = "Final"
                elif frequencia < 75:
                     # Se já estourou em faltas, já reprova mesmo sem nota
                     status_aluno = "Reprovado por Falta"

                boletim.append({
                    "subject": nome_disciplina,
                    "professor": nome_professor,
                    "grade1": nota1,
                    "grade2": nota2,
                    "average": media,
                    "attendance": frequencia,
                    "status": status_aluno,
                })

        return Response(boletim, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method="get",
    operation_description="Retorna o histórico completo do aluno, agrupado por semestre (turma).",
    manual_parameters=[
        openapi.Parameter(
            name="matricula",
            in_=openapi.IN_PATH,
            description="Matrícula do aluno",
            type=openapi.TYPE_STRING,
            required=True,
        )
    ],
)
@api_view(["GET"])
def get_student_history(request, matricula) -> Response:
    """
    Retorna o histórico completo do aluno, agrupado por semestre (turma).
    Cada disciplina tem notas finais, status e créditos.
    """
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT 
                    T.semestre,
                    D.nome_disciplina,
                    D.creditos,
                    MAX(CASE WHEN AV.id_avaliacao = 'N1' THEN AV.nota ELSE NULL END) as nota_n1,
                    MAX(CASE WHEN AV.id_avaliacao = 'N2' THEN AV.nota ELSE NULL END) as nota_n2,
                    M.frequencia
                FROM MATRICULA M
                JOIN TURMA T ON M.fk_cod_turma = T.cod_turma AND M.fk_cod_disciplina = T.fk_cod_disciplina
                JOIN DISCIPLINA D ON T.fk_cod_disciplina = D.cod_disciplina
                LEFT JOIN AVALIACAO AV ON M.fk_matricula_aluno = AV.fk_matricula_aluno 
                                      AND M.fk_cod_disciplina = AV.fk_cod_disciplina
                                      AND M.fk_cod_turma = AV.fk_cod_turma
                WHERE M.fk_matricula_aluno = %s
                GROUP BY T.semestre, D.nome_disciplina, D.creditos, M.frequencia
                ORDER BY T.semestre DESC, D.nome_disciplina
            """
            cursor.execute(sql, [matricula])
            rows: List[Tuple[Any, ...]] = cursor.fetchall()

            history: List[dict] = []

            for row in rows:
                semestre = row[0]
                disciplina = row[1]
                creditos = row[2]
                raw_n1 = row[3]
                raw_n2 = row[4]
                freq = float(row[5]) if row[5] is not None else 100.0

                nota1 = float(raw_n1) if raw_n1 is not None else 0.0
                nota2 = float(raw_n2) if raw_n2 is not None else 0.0
                media = (nota1 + nota2) / 2

                # Lógica simplificada para histórico
                status_final = "Cursando"
                
                if raw_n1 is not None and raw_n2 is not None:
                    if freq < 75:
                        status_final = "Reprovado por Falta"
                    elif media >= 7.0:
                        status_final = "Aprovado"
                    elif media < 4.0:
                        status_final = "Reprovado"
                    else:
                        status_final = "Final" # No histórico, talvez queira mostrar nota da final depois
                elif freq < 75:
                     status_final = "Reprovado por Falta"

                history.append({
                    "semester": semestre,
                    "subject": disciplina,
                    "finalGrade": media,
                    "status": status_final,
                    "credits": creditos,
                })

        return Response(history, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)