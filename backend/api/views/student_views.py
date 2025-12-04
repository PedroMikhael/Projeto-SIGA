from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# --- SCHEMAS ---
student_update_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'nome': openapi.Schema(type=openapi.TYPE_STRING),
        'email': openapi.Schema(type=openapi.TYPE_STRING),
        'senha': openapi.Schema(type=openapi.TYPE_STRING),
        'curso': openapi.Schema(type=openapi.TYPE_STRING),
    }
)

# --- VIEWS DE ALUNO ---

@swagger_auto_schema(method='put', request_body=student_update_schema)
@api_view(['PUT'])
def update_student(request, matricula):
    """
    Atualiza dados do Aluno e Pessoa vinculada via SQL.
    """
    data = request.data
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT fk_cpf FROM ALUNO WHERE matricula_aluno = %s", [matricula])
            row = cursor.fetchone()
            if not row: return Response({"error": "Aluno não encontrado"}, status=status.HTTP_404_NOT_FOUND)
            
            cpf_aluno = row[0]
            cursor.execute("UPDATE PESSOA SET nome=%s, email=%s, senha=%s WHERE cpf=%s", 
                           [data.get('nome'), data.get('email'), data.get('senha'), cpf_aluno])
            cursor.execute("UPDATE ALUNO SET curso=%s WHERE matricula_aluno=%s", 
                           [data.get('curso'), matricula])

        return Response({"message": "Dados atualizados!"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(method='delete')
@api_view(['DELETE'])
def delete_student(request, matricula):
    """
    Deleta conta do aluno (Cascade manual).
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT fk_cpf FROM ALUNO WHERE matricula_aluno = %s", [matricula])
            row = cursor.fetchone()
            if not row: return Response({"error": "Aluno não encontrado"}, status=status.HTTP_404_NOT_FOUND)
            
            cpf_aluno = row[0]

            # Cascade Delete Manual
            cursor.execute("DELETE FROM AVALIACAO WHERE fk_matricula_aluno = %s", [matricula])
            cursor.execute("DELETE FROM MATRICULA WHERE fk_matricula_aluno = %s", [matricula])
            cursor.execute("DELETE FROM ALUNO WHERE matricula_aluno = %s", [matricula])

            # Verifica se é professor antes de apagar Pessoa
            cursor.execute("SELECT matricula_professor FROM PROFESSOR WHERE fk_cpf = %s", [cpf_aluno])
            if not cursor.fetchone():
                cursor.execute("DELETE FROM PESSOA WHERE cpf = %s", [cpf_aluno])

        return Response({"message": "Aluno excluído."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)