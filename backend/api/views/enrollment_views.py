from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db.models import Count, F


# --- SCHEMAS ---
enrollment_request_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'matricula_aluno': openapi.Schema(type=openapi.TYPE_INTEGER),
        'cod_turma': openapi.Schema(type=openapi.TYPE_STRING),
        'cod_disciplina': openapi.Schema(type=openapi.TYPE_INTEGER),
    },
    required=['matricula_aluno', 'cod_turma', 'cod_disciplina']
)


# ==========================================
# 1) SEARCH DE DISCIPLINAS
# ==========================================
@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter(
            'search',
            openapi.IN_QUERY,
            description="Nome da disciplina",
            type=openapi.TYPE_STRING
        )
    ]
)
@api_view(['GET'])
def search_disciplines(request):
    """
    Busca disciplinas pelo nome (case-insensitive).
    """
    search = request.query_params.get("search", "")
    pattern = f"%{search}%"

    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT cod_disciplina, nome_disciplina, creditos, fk_cod_departamento
                FROM disciplina
                WHERE LOWER(nome_disciplina) LIKE LOWER(%s)
                ORDER BY cod_disciplina ASC
            """
            cursor.execute(sql, [pattern])
            rows = cursor.fetchall()

        results = []
        for row in rows:
            results.append({
                "cod_disciplina": row[0],
                "nome_disciplina": row[1],
                "creditos": row[2],
                "fk_cod_departamento": row[3],
            })

        return Response(results, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==========================================
# 2) MATRICULAR ALUNO
# ==========================================
@swagger_auto_schema(method='post', request_body=enrollment_request_schema)
@api_view(['POST'])
def enroll_student(request):
    aluno_id = request.data.get('matricula_aluno')
    disciplina_id = request.data.get('cod_disciplina')

    # Agora NÃO recebemos turma_id da requisição
    try:
        with connection.cursor() as cursor:

            # 1️⃣ Buscar a primeira turma disponível para essa disciplina
            cursor.execute("""
                SELECT cod_turma
                FROM TURMA
                WHERE fk_cod_disciplina = %s
                ORDER BY cod_turma ASC
                LIMIT 1
            """, [disciplina_id])

            turma_row = cursor.fetchone()

            if not turma_row:
                return Response(
                    {"error": "Nenhuma turma encontrada para esta disciplina."},
                    status=status.HTTP_404_NOT_FOUND
                )

            turma_id = turma_row[0]  # primeira turma

            # 2️⃣ Verificar vagas
            cursor.execute("""
                SELECT capacidade,
                    (SELECT COUNT(*)
                     FROM MATRICULA 
                     WHERE fk_cod_turma = %s AND fk_cod_disciplina = %s)
                FROM TURMA
                WHERE cod_turma = %s AND fk_cod_disciplina = %s
            """, [turma_id, disciplina_id, turma_id, disciplina_id])

            row = cursor.fetchone()
            if not row:
                return Response({"error": "Turma não encontrada"}, status=status.HTTP_404_NOT_FOUND)

            capacidade, inscritos = row

            if inscritos >= capacidade:
                return Response(
                    {"error": "Turma cheia! Não há vagas disponíveis."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 3️⃣ Verificar se aluno já está matriculado
            cursor.execute("""
                SELECT 1 FROM MATRICULA
                WHERE fk_matricula_aluno = %s 
                AND fk_cod_turma = %s 
                AND fk_cod_disciplina = %s
            """, [aluno_id, turma_id, disciplina_id])

            if cursor.fetchone():
                return Response(
                    {"error": "Aluno já matriculado nesta turma."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 4️⃣ Criar matrícula automática
            cursor.execute("""
                INSERT INTO MATRICULA (fk_matricula_aluno, fk_cod_disciplina, fk_cod_turma, frequencia)
                VALUES (%s, %s, %s, 0.0)
            """, [aluno_id, disciplina_id, turma_id])

        return Response(
            {"message": "Matrícula realizada com sucesso!", "turma_usada": turma_id},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# ==========================================
# 3) LISTAR TODAS AS DISCIPLINAS
# ==========================================
@swagger_auto_schema(method='get')
@api_view(['GET'])
def list_all_disciplines(request):
    """
    Retorna TODAS as disciplinas (uma linha por disciplina),
    incluindo: nome do departamento, um horário representativo (de uma turma),
    capacidade (representativa) e total de inscritos (soma sobre todas as turmas).
    """
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT
                    d.cod_disciplina,
                    d.nome_disciplina,
                    d.creditos,
                    dept.nome_departamento,
                    -- pega um horário representativo (por exemplo: menor valor lexicográfico)
                    MIN(t.horario) AS horario,
                    -- pega capacidade representativa (ex: maior capacidade dentre turmas)
                    MAX(t.capacidade) AS capacidade,
                    -- total de inscritos na disciplina (soma sobre todas as turmas)
                    COALESCE((
                        SELECT COUNT(*)
                        FROM MATRICULA m
                        WHERE m.fk_cod_disciplina = d.cod_disciplina
                    ), 0) AS ocupadas
                FROM DISCIPLINA d
                LEFT JOIN DEPARTAMENTO dept ON d.fk_cod_departamento = dept.cod_departamento
                LEFT JOIN TURMA t ON t.fk_cod_disciplina = d.cod_disciplina
                GROUP BY
                    d.cod_disciplina,
                    d.nome_disciplina,
                    d.creditos,
                    dept.nome_departamento
                ORDER BY d.cod_disciplina ASC;
            """
            cursor.execute(sql)
            rows = cursor.fetchall()

        results = []
        for row in rows:
            disciplina = {
                "cod_disciplina": row[0],
                "nome_disciplina": row[1],
                "creditos": row[2],
                "nome_departamento": row[3],
                "horario": row[4],         # horário representativo (pode ser NULL)
                "capacidade": row[5],      # capacidade representativa (pode ser NULL)
                "ocupadas": row[6] or 0
            }
            results.append(disciplina)

        return Response(results, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==========================================
# 4) LISTAR TURMAS + VAGAS DISPONÍVEIS
# ==========================================
@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter(
            'search',
            openapi.IN_QUERY,
            description="Nome da disciplina",
            type=openapi.TYPE_STRING
        )
    ]
)
@api_view(['GET'])
def list_available_classes(request):
    """
    Lista todas as turmas, com vagas e info da disciplina.
    """
    search = request.query_params.get("search", "")
    pattern = f"%{search}%"

    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT
                    t.cod_turma,
                    t.capacidade,
                    d.cod_disciplina,
                    d.nome_disciplina,
                    d.creditos,
                    (
                        SELECT COUNT(*)
                        FROM matricula m
                        WHERE m.fk_cod_turma = t.cod_turma
                          AND m.fk_cod_disciplina = d.cod_disciplina
                    ) AS inscritos
                FROM turma t
                JOIN disciplina d ON t.fk_cod_disciplina = d.cod_disciplina
                WHERE LOWER(d.nome_disciplina) LIKE LOWER(%s)
                ORDER BY d.nome_disciplina ASC, t.cod_turma ASC
            """
            cursor.execute(sql, [pattern])
            rows = cursor.fetchall()

        results = []
        for row in rows:
            cod_turma, capacidade, cod_disc, nome_disc, creditos, inscritos = row

            results.append({
                "cod_turma": cod_turma,
                "capacidade": capacidade,
                "inscritos": inscritos,
                "vagas_restantes": capacidade - inscritos,
                "disciplina": {
                    "cod_disciplina": cod_disc,
                    "nome_disciplina": nome_disc,
                    "creditos": creditos,
                }
            })

        return Response(results, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
