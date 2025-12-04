from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from datetime import datetime

# --- SCHEMAS ---
ticket_purchase_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'matricula': openapi.Schema(type=openapi.TYPE_STRING, description="Matrícula do usuário"),
        'tipo': openapi.Schema(type=openapi.TYPE_STRING, description='Tipo de usuário: "student" ou "teacher"'),
        'codigo_ru': openapi.Schema(type=openapi.TYPE_INTEGER),
        'id_cardapio': openapi.Schema(type=openapi.TYPE_INTEGER),
    },
    required=['matricula', 'tipo', 'codigo_ru', 'id_cardapio']
)

# --- FUNÇÃO AUXILIAR ---
def get_cpf_by_matricula_tipo(matricula, tipo):
    """
    Retorna o CPF a partir da matrícula e tipo de usuário.
    Retorna None se não encontrado ou tipo inválido.
    """
    with connection.cursor() as cursor:
        if tipo.lower() == 'student':
            cursor.execute("SELECT fk_cpf FROM ALUNO WHERE matricula_aluno = %s", [matricula])
        elif tipo.lower() == 'teacher':
            cursor.execute("SELECT fk_cpf FROM PROFESSOR WHERE matricula_professor = %s", [matricula])
        else:
            return None
        row = cursor.fetchone()
        return row[0] if row else None

# --- VIEWS ---
@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter('matricula', openapi.IN_QUERY, description="Matrícula do usuário", type=openapi.TYPE_STRING, required=True),
        openapi.Parameter('tipo', openapi.IN_QUERY, description='Tipo de usuário: "student" ou "teacher"', type=openapi.TYPE_STRING, required=True)
    ]
)
@api_view(['GET'])
def get_user_balance(request):
    """
    Retorna o saldo e histórico de tickets do usuário.
    """
    matricula = request.query_params.get('matricula')
    tipo = request.query_params.get('tipo')

    if not matricula or not tipo:
        return Response({"error": "Parâmetros matricula e tipo são obrigatórios"}, status=status.HTTP_400_BAD_REQUEST)

    cpf = get_cpf_by_matricula_tipo(matricula, tipo)
    if not cpf:
        return Response({"error": "Usuário não encontrado ou tipo inválido"}, status=status.HTTP_404_NOT_FOUND)

    try:
        with connection.cursor() as cursor:
            # Saldo
            cursor.execute("SELECT saldo FROM PESSOA WHERE cpf = %s", [cpf])
            row = cursor.fetchone()
            saldo = float(row[0]) if row else 0.0

            # Últimos tickets
            cursor.execute("""
                SELECT R.data_hora, RU.nome, C.prato_principal
                FROM REGISTRO_USO R
                JOIN RESTAURANTE_UNIVERSITARIO RU ON R.fk_codigo_ru = RU.codigo_ru
                JOIN CARDAPIO_DIA C ON R.fk_id_cardapio = C.id_cardapio
                WHERE R.fk_cpf = %s
                ORDER BY R.data_hora DESC
                LIMIT 5
            """, [cpf])
            tickets = [{"data": t[0], "restaurante": t[1], "prato": t[2]} for t in cursor.fetchall()]

        return Response({"cpf": cpf, "saldo": saldo, "historico_tickets": tickets}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(method='post', request_body=ticket_purchase_schema)
@api_view(['POST'])
def buy_ticket(request):
    """
    Compra um ticket do RU. Recebe matrícula e tipo, busca CPF, verifica saldo e registra o uso.
    """
    matricula = request.data.get('matricula')
    tipo = request.data.get('tipo')
    ru_id = request.data.get('codigo_ru')
    cardapio_id = request.data.get('id_cardapio')

    if not matricula or not tipo or not ru_id or not cardapio_id:
        return Response({"error": "Todos os parâmetros são obrigatórios"}, status=status.HTTP_400_BAD_REQUEST)

    cpf = get_cpf_by_matricula_tipo(matricula, tipo)
    if not cpf:
        return Response({"error": "Usuário não encontrado ou tipo inválido"}, status=status.HTTP_404_NOT_FOUND)

    PRECO_TICKET = 1.00

    try:
        with connection.cursor() as cursor:
            # Verificar saldo
            cursor.execute("SELECT saldo FROM PESSOA WHERE cpf = %s", [cpf])
            row = cursor.fetchone()
            saldo_atual = float(row[0]) if row else 0.0

            if saldo_atual < PRECO_TICKET:
                return Response({"error": "Saldo insuficiente!"}, status=status.HTTP_400_BAD_REQUEST)

            # Atualizar saldo e registrar ticket
            novo_saldo = saldo_atual - PRECO_TICKET
            data_hora_atual = datetime.now()

            cursor.execute("UPDATE PESSOA SET saldo = %s WHERE cpf = %s", [novo_saldo, cpf])
            cursor.execute("""
                INSERT INTO REGISTRO_USO (fk_cpf, fk_codigo_ru, fk_id_cardapio, data_hora)
                VALUES (%s, %s, %s, %s)
            """, [cpf, ru_id, cardapio_id, data_hora_atual])

        return Response({
            "message": "Ticket comprado com sucesso!",
            "novo_saldo": novo_saldo,
            "ticket_id": f"TICKET-{int(datetime.timestamp(data_hora_atual))}"
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter('matricula', openapi.IN_QUERY, description="Matrícula do usuário", type=openapi.TYPE_STRING, required=True),
        openapi.Parameter('tipo', openapi.IN_QUERY, description='Tipo de usuário: "student" ou "teacher"', type=openapi.TYPE_STRING, required=True)
    ]
)
@api_view(['GET'])
def get_cpf(request):
    """
    Retorna o CPF a partir da matrícula e tipo.
    """
    matricula = request.GET.get('matricula')
    tipo = request.GET.get('tipo')

    if not matricula or not tipo:
        return Response({'error': 'Parâmetros matricula e tipo são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)

    cpf = get_cpf_by_matricula_tipo(matricula, tipo)
    if not cpf:
        return Response({'error': 'Usuário não encontrado ou tipo inválido'}, status=status.HTTP_404_NOT_FOUND)

    return Response({'cpf': cpf}, status=status.HTTP_200_OK)
