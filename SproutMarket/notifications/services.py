# notifications/services.py

import boto3
from django.conf import settings
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """
    Servicio para enviar emails usando AWS SES
    Emails de texto plano (sin HTML por ahora)
    """
    
    def __init__(self):
        self.ses_client = boto3.client(
            'ses',
            region_name=settings.AWS_SES_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        self.from_email = settings.DEFAULT_FROM_EMAIL
    
    def send_email(self, to_email, subject, message):
        """
        Enviar email de texto plano usando SES
        
        Args:
            to_email (str): Email del destinatario
            subject (str): Asunto del email
            message (str): Contenido del email (texto plano)
        
        Returns:
            dict: Respuesta de SES o None si falla
        """
        try:
            response = self.ses_client.send_email(
                Source=self.from_email,
                Destination={
                    'ToAddresses': [to_email]
                },
                Message={
                    'Subject': {
                        'Data': subject,
                        'Charset': 'UTF-8'
                    },
                    'Body': {
                        'Text': {
                            'Data': message,
                            'Charset': 'UTF-8'
                        }
                    }
                }
            )
            
            logger.info(f"Email sent successfully to {to_email}. MessageId: {response['MessageId']}")
            return response
            
        except ClientError as e:
            logger.error(f"Error sending email to {to_email}: {e.response['Error']['Message']}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error sending email to {to_email}: {str(e)}")
            return None


class PushNotificationService:
    """
    Servicio para enviar notificaciones push usando AWS SNS
    """
    
    def __init__(self):
        self.sns_client = boto3.client(
            'sns',
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        self.topic_arn = getattr(settings, 'SNS_TOPIC_ARN', None)
    
    def send_push(self, subject, message):
        """
        Enviar notificación push via SNS
        
        Args:
            subject (str): Asunto/título de la notificación
            message (str): Mensaje de la notificación
        
        Returns:
            dict: Respuesta de SNS o None si falla
        """
        if not self.topic_arn:
            logger.warning("SNS_TOPIC_ARN not configured. Skipping push notification.")
            return None
        
        try:
            response = self.sns_client.publish(
                TopicArn=self.topic_arn,
                Subject=subject,
                Message=message
            )
            
            logger.info(f"Push notification sent. MessageId: {response['MessageId']}")
            return response
            
        except ClientError as e:
            logger.error(f"Error sending push notification: {e.response['Error']['Message']}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error sending push notification: {str(e)}")
            return None


class NotificationService:
    """
    Servicio unificado de notificaciones
    Combina Email (SES) y Push (SNS) + guarda en DB
    """
    
    def __init__(self):
        self.email_service = EmailService()
        self.push_service = PushNotificationService()
    
    def notify_user(self, user, notification_type, subject, message, metadata=None, send_email=True, send_push=False):
        """
        Enviar notificación a un usuario (email y/o push) y guardar en DB
        
        Args:
            user: Instancia del modelo User
            notification_type (str): Tipo de notificación
            subject (str): Asunto/título
            message (str): Mensaje de la notificación
            metadata (dict, optional): Datos adicionales
            send_email (bool): Si enviar email
            send_push (bool): Si enviar push
        
        Returns:
            dict: Resultado del envío
        """
        from notifications.models import Notification
        from django.utils import timezone
        
        results = {
            'email_sent': False,
            'push_sent': False,
            'notification_id': None
        }
        
        # Crear registro en DB
        notification = Notification.objects.create(
            user=user,
            type=notification_type,
            title=subject,
            message=message,
            metadata=metadata or {}
        )
        results['notification_id'] = notification.id
        
        # Enviar email si está habilitado
        if send_email and user.email and user.is_email_verified:
            email_response = self.email_service.send_email(
                to_email=user.email,
                subject=subject,
                message=message
            )
            
            if email_response:
                notification.email_sent = True
                notification.email_sent_at = timezone.now()
                results['email_sent'] = True
        
        # Enviar push si está habilitado
        if send_push:
            push_response = self.push_service.send_push(
                subject=subject,
                message=message
            )
            
            if push_response:
                notification.push_sent = True
                notification.push_sent_at = timezone.now()
                results['push_sent'] = True
        
        notification.save()
        return results


# ==========================================
# FUNCIONES HELPER PARA USAR EN VIEWS
# ==========================================

def send_purchase_confirmation(order, buyer):
    """
    Enviar confirmación de compra al comprador
    
    Args:
        order: Instancia del modelo Order
        buyer: Instancia del modelo User (comprador)
    """
    service = NotificationService()
    
    subject = f'Confirmación de compra - Orden #{order.id}'
    message = f"""
Hola {order.buyer_name},

Tu orden ha sido confirmada exitosamente.

DETALLES DE LA ORDEN:
- Número de orden: #{order.id}
- Total pagado: ${order.total_mxn} MXN
- Productos: {len(order.items)} artículo(s)

INFORMACIÓN DE ENTREGA:
- Nombre: {order.buyer_name}
- Teléfono: {order.buyer_phone}
- Dirección: {order.buyer_address}

Los vendedores han sido notificados y se pondrán en contacto contigo para coordinar la entrega.

Gracias por tu compra en SproutMarket.

Saludos,
Equipo SproutMarket
    """
    
    return service.notify_user(
        user=buyer,
        notification_type='purchase_confirmation',
        subject=subject,
        message=message.strip(),
        metadata={'order_id': order.id},
        send_email=True,
        send_push=True
    )


def send_sale_notification(order, seller, seller_items):
    """
    Enviar notificación de venta al vendedor
    
    Args:
        order: Instancia del modelo Order
        seller: Instancia del modelo User (vendedor)
        seller_items: Lista de items vendidos por este seller
    """
    service = NotificationService()
    
    # Calcular total del seller (90% después de comisión)
    from decimal import Decimal
    subtotal = sum(Decimal(str(item['subtotal'])) for item in seller_items)
    seller_earnings = subtotal * Decimal('0.90')
    
    # Construir lista de productos
    products_list = '\n'.join([
        f"- {item['product_name']} x{item['quantity']} = ${item['subtotal']}"
        for item in seller_items
    ])
    
    subject = f'¡Nueva venta! - Orden #{order.id}'
    message = f"""
Hola {seller.get_full_name() or seller.username},

¡Felicidades! Has realizado una venta en SproutMarket.

PRODUCTOS VENDIDOS:
{products_list}

GANANCIAS:
- Subtotal: ${subtotal} MXN
- Tu ganancia (90%): ${seller_earnings} MXN
- Comisión plataforma (10%): ${subtotal * Decimal('0.10')} MXN

INFORMACIÓN DEL COMPRADOR:
- Nombre: {order.buyer_name}
- Teléfono: {order.buyer_phone}
- Dirección: {order.buyer_address}

PRÓXIMOS PASOS:
1. Contacta al comprador para coordinar la entrega
2. Tus ganancias estarán disponibles en tu balance
3. Podrás solicitar un retiro cuando lo desees

Gracias por vender en SproutMarket.

Saludos,
Equipo SproutMarket
    """
    
    return service.notify_user(
        user=seller,
        notification_type='sale_notification',
        subject=subject,
        message=message.strip(),
        metadata={'order_id': order.id, 'earnings': float(seller_earnings)},
        send_email=True,
        send_push=True
    )


def send_exchange_offer_notification(exchange, offer):
    """
    Notificar al publisher que recibió una nueva oferta
    
    Args:
        exchange: Instancia del modelo Exchange
        offer: Instancia del modelo ExchangeOffer
    """
    service = NotificationService()
    
    subject = f'Nueva oferta de intercambio - {exchange.plant_common_name}'
    message = f"""
Hola {exchange.user.get_full_name() or exchange.user.username},

Has recibido una nueva oferta para tu publicación de intercambio.

TU PLANTA:
- Nombre: {exchange.plant_common_name}
- Nombre científico: {exchange.plant_scientific_name}

PLANTA OFRECIDA:
- Usuario: {offer.offeror.get_full_name() or offer.offeror.username}
- Nombre: {offer.plant_common_name}
- Nombre científico: {offer.plant_scientific_name}
- Tamaño: {offer.width_cm} cm x {offer.height_cm} cm
- Descripción: {offer.description}

Tienes {exchange.pending_offers_count}/4 ofertas pendientes.

Puedes aceptar o rechazar esta oferta desde tu perfil.

Saludos,
Equipo SproutMarket
    """
    
    return service.notify_user(
        user=exchange.user,
        notification_type='exchange_offer',
        subject=subject,
        message=message.strip(),
        metadata={'exchange_id': exchange.id, 'offer_id': offer.id},
        send_email=True,
        send_push=True
    )


def send_offer_accepted_notification(exchange, offer):
    """
    Notificar a ambas partes que la oferta fue aceptada
    
    Args:
        exchange: Instancia del modelo Exchange
        offer: Instancia del modelo ExchangeOffer
    """
    service = NotificationService()
    
    # Notificar al offeror (su oferta fue aceptada)
    offeror_subject = f'¡Tu oferta fue aceptada! - {exchange.plant_common_name}'
    offeror_message = f"""
Hola {offer.offeror.get_full_name() or offer.offeror.username},

¡Excelentes noticias! Tu oferta de intercambio ha sido aceptada.

PLANTA QUE OFRECISTE:
- {offer.plant_common_name} ({offer.plant_scientific_name})

PLANTA QUE RECIBIRÁS:
- {exchange.plant_common_name} ({exchange.plant_scientific_name})

INFORMACIÓN DE CONTACTO:
- Nombre: {exchange.user.get_full_name() or exchange.user.username}
- Email: {exchange.user.email}
- Teléfono: {exchange.user.phone_number or 'No proporcionado'}
- Ubicación: {exchange.location}

PRÓXIMOS PASOS:
1. Contacta al usuario para coordinar fecha y lugar del intercambio
2. Asegúrate de que tu planta esté en buenas condiciones
3. Realiza el intercambio en el lugar acordado

¡Disfruta tu nueva planta!

Saludos,
Equipo SproutMarket
    """
    
    # Notificar al publisher (aceptó una oferta)
    publisher_subject = f'Intercambio confirmado - {exchange.plant_common_name}'
    publisher_message = f"""
Hola {exchange.user.get_full_name() or exchange.user.username},

Has aceptado una oferta de intercambio.

TU PLANTA:
- {exchange.plant_common_name} ({exchange.plant_scientific_name})

PLANTA QUE RECIBIRÁS:
- {offer.plant_common_name} ({offer.plant_scientific_name})

INFORMACIÓN DE CONTACTO:
- Nombre: {offer.offeror.get_full_name() or offer.offeror.username}
- Email: {offer.offeror.email}
- Teléfono: {offer.offeror.phone_number or 'No proporcionado'}

PRÓXIMOS PASOS:
1. El usuario te contactará para coordinar el intercambio
2. Coordina fecha y lugar para realizar el intercambio
3. Asegúrate de que tu planta esté en buenas condiciones

¡Disfruta tu nueva planta!

Saludos,
Equipo SproutMarket
    """
    
    results = {
        'offeror': service.notify_user(
            user=offer.offeror,
            notification_type='offer_accepted',
            subject=offeror_subject,
            message=offeror_message.strip(),
            metadata={'exchange_id': exchange.id, 'offer_id': offer.id},
            send_email=True,
            send_push=True
        ),
        'publisher': service.notify_user(
            user=exchange.user,
            notification_type='offer_accepted',
            subject=publisher_subject,
            message=publisher_message.strip(),
            metadata={'exchange_id': exchange.id, 'offer_id': offer.id},
            send_email=True,
            send_push=True
        )
    }
    
    return results


def send_offer_rejected_notification(exchange, offer):
    """
    Notificar al offeror que su oferta fue rechazada
    
    Args:
        exchange: Instancia del modelo Exchange
        offer: Instancia del modelo ExchangeOffer
    """
    service = NotificationService()
    
    subject = f'Oferta no aceptada - {exchange.plant_common_name}'
    message = f"""
Hola {offer.offeror.get_full_name() or offer.offeror.username},

Tu oferta de intercambio no fue aceptada en esta ocasión.

PLANTA QUE OFRECISTE:
- {offer.plant_common_name} ({offer.plant_scientific_name})

PUBLICACIÓN:
- {exchange.plant_common_name} ({exchange.plant_scientific_name})

No te desanimes, puedes:
- Hacer otra oferta con una planta diferente
- Explorar otras publicaciones de intercambio
- Crear tu propia publicación de intercambio ($90 MXN)

Gracias por participar en SproutMarket.

Saludos,
Equipo SproutMarket
    """
    
    return service.notify_user(
        user=offer.offeror,
        notification_type='offer_rejected',
        subject=subject,
        message=message.strip(),
        metadata={'exchange_id': exchange.id, 'offer_id': offer.id},
        send_email=True,
        send_push=False  # No enviar push para rechazos
    )


def send_low_stock_alert(product, seller):
    """
    Alerta de stock bajo al vendedor
    
    Args:
        product: Instancia del modelo Product
        seller: Instancia del modelo User (vendedor)
    """
    service = NotificationService()
    
    subject = f'Alerta de stock bajo - {product.common_name}'
    message = f"""
Hola {seller.get_full_name() or seller.username},

Tu producto tiene stock bajo y podría agotarse pronto.

PRODUCTO:
- Nombre: {product.common_name}
- Stock actual: {product.quantity} unidades
- Precio: ${product.price_mxn} MXN

RECOMENDACIÓN:
- Actualiza tu inventario si tienes más unidades disponibles
- Si se agota, el producto aparecerá como "Agotado" hasta que agregues más stock

Gracias por vender en SproutMarket.

Saludos,
Equipo SproutMarket
    """
    
    return service.notify_user(
        user=seller,
        notification_type='low_stock',
        subject=subject,
        message=message.strip(),
        metadata={'product_id': product.id, 'quantity': product.quantity},
        send_email=True,
        send_push=False
    )