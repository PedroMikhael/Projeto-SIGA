from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from drf_yasg.utils import swagger_auto_schema
from api.serializers import ProfessorUpdateSerializer


@swagger_auto_schema(method='put', request_body=ProfessorUpdateSerializer)
@api_view(['PUT'])
def update_professor(request, matricula):
    data = request.data
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT fk_cpf FROM PROFESSOR WHERE matricula_professor = %s", [matricula])
            row = cursor.fetchone()
            if not row:
                return Response({"error": "Professor não encontrado"}, status=status.HTTP_404_NOT_FOUND)
            
            cpf_prof = row[0]
            cursor.execute(
                "UPDATE PESSOA SET nome=%s, email=%s, senha=%s WHERE cpf=%s",
                [data.get('nome'), data.get('email'), data.get('senha'), cpf_prof]
            )
            cursor.execute(
                "UPDATE PROFESSOR SET fk_cod_departamento=%s WHERE matricula_professor=%s",
                [data.get('departamento'), matricula]
            )

        return Response({"message": "Dados atualizados!"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)