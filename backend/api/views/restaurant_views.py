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
        'cpf_pessoa': openapi.Schema(type=openapi.TYPE_STRING),
        'codigo_ru': openapi.Schema(type=openapi.TYPE_INTEGER),
        'id_cardapio': openapi.Schema(type=openapi.TYPE_INTEGER),
    },
    required=['cpf_pessoa', 'codigo_ru', 'id_cardapio']
)

# --- VIEWS ---

@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter('cpf', openapi.IN_QUERY, description="CPF da Pessoa", type=openapi.TYPE_STRING)
    ]
)
@api_view(['GET'])
def get_user_balance(request):
    """
    Retorna o saldo atual do usuário e seus tickets (histórico de uso recente).
    """
    cpf = request.query_params.get('cpf')
    if not cpf:
        return Response({"error": "CPF é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with connection.cursor() as cursor:
            # 1. Pegar Saldo
            cursor.execute("SELECT saldo FROM PESSOA WHERE cpf = %s", [cpf])
            row = cursor.fetchone()
            if not row:
                return Response({"error": "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)
            
            saldo = float(row[0])

            # 2. Pegar últimos tickets comprados (Histórico)
            cursor.execute("""
                SELECT R.data_hora, RU.nome, C.prato_principal 
                FROM REGISTRO_USO R
                JOIN RESTAURANTE_UNIVERSITARIO RU ON R.fk_codigo_ru = RU.codigo_ru
                JOIN CARDAPIO_DIA C ON R.fk_id_cardapio = C.id_cardapio
                WHERE R.fk_cpf = %s
                ORDER BY R.data_hora DESC
                LIMIT 5
            """, [cpf])
            
            tickets = []
            for t in cursor.fetchall():
                tickets.append({
                    "data": t[0],
                    "restaurante": t[1],
                    "prato": t[2]
                })

        return Response({"saldo": saldo, "historico_tickets": tickets}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(method='post', request_body=ticket_purchase_schema)
@api_view(['POST'])
def buy_ticket(request):
    """
    Compra um ticket do RU.
    Verifica saldo -> Desconta valor (R$ 1,00) -> Cria Registro de Uso.
    """
    cpf = request.data.get('cpf_pessoa')
    ru_id = request.data.get('codigo_ru')
    cardapio_id = request.data.get('id_cardapio')
    
    PRECO_TICKET = 1.00

    try:
        with connection.cursor() as cursor:
            # 1. Verificar Saldo
            cursor.execute("SELECT saldo FROM PESSOA WHERE cpf = %s", [cpf])
            row = cursor.fetchone()
            
            if not row:
                return Response({"error": "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)
            
            saldo_atual = float(row[0])

            if saldo_atual < PRECO_TICKET:
                return Response({"error": "Saldo insuficiente!"}, status=status.HTTP_400_BAD_REQUEST)

            # 2. Transação: Descontar Saldo e Criar Registro
            novo_saldo = saldo_atual - PRECO_TICKET
            data_hora_atual = datetime.now()

            # Update Saldo
            cursor.execute("UPDATE PESSOA SET saldo = %s WHERE cpf = %s", [novo_saldo, cpf])

            # Insert Registro de Uso (O Ticket)
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