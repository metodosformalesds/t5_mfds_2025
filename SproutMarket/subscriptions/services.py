# subscriptions/services.py

import stripe
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
from .models import Subscription
from payments.models import Transaction

# Configurar Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class SubscriptionService:
    """
    Servicio para manejar suscripciones premium con Stripe
    """
    
    @staticmethod
    def create_subscription(user):
        """
        Crear una suscripción premium para un usuario
        
        Args:
            user: Instancia del modelo User
            
        Returns:
            dict: Información de la suscripción creada
            
        Raises:
            stripe.error.StripeError: Si hay error en Stripe
        """
        
        # 1. Crear o obtener Customer en Stripe
        if not user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=user.email,
                name=user.get_full_name() or user.username,
                metadata={
                    'user_id': user.id,
                    'username': user.username
                }
            )
            user.stripe_customer_id = customer.id
            user.save(update_fields=['stripe_customer_id'])
        else:
            customer = stripe.Customer.retrieve(user.stripe_customer_id)
        
        # 2. Crear suscripción en Stripe
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{
                'price': settings.STRIPE_PREMIUM_PRICE_ID,
            }],
            payment_behavior='default_incomplete',
            payment_settings={
                'save_default_payment_method': 'on_subscription'
            },
            expand=['latest_invoice.payment_intent'],
            metadata={
                'user_id': user.id,
                'user_email': user.email
            }
        )
        
        # 3. Guardar suscripción en DB
        db_subscription = Subscription.objects.create(
            user=user,
            stripe_subscription_id=subscription.id,
            stripe_customer_id=customer.id,
            stripe_price_id=settings.STRIPE_PREMIUM_PRICE_ID,
            status=subscription.status,
            current_period_start=timezone.datetime.fromtimestamp(
                subscription.current_period_start,
                tz=timezone.utc
            ),
            current_period_end=timezone.datetime.fromtimestamp(
                subscription.current_period_end,
                tz=timezone.utc
            ),
            metadata={
                'stripe_subscription': subscription.id
            }
        )
        
        # 4. Retornar información para el frontend
        return {
            'subscription_id': subscription.id,
            'client_secret': subscription.latest_invoice.payment_intent.client_secret,
            'status': subscription.status,
            'current_period_end': db_subscription.current_period_end,
            'amount': 199.00  # $199 MXN
        }
    
    @staticmethod
    def cancel_subscription(user):
        """
        Cancelar la suscripción premium de un usuario
        
        Args:
            user: Instancia del modelo User
            
        Returns:
            dict: Información de la cancelación
        """
        
        # 1. Verificar que el usuario tenga suscripción activa
        if not user.stripe_subscription_id:
            raise ValueError('El usuario no tiene una suscripción activa')
        
        # 2. Cancelar en Stripe (al final del periodo)
        subscription = stripe.Subscription.modify(
            user.stripe_subscription_id,
            cancel_at_period_end=True
        )
        
        # 3. Actualizar en DB
        try:
            db_subscription = Subscription.objects.get(
                stripe_subscription_id=subscription.id
            )
            db_subscription.status = 'canceled'
            db_subscription.canceled_at = timezone.now()
            db_subscription.save()
        except Subscription.DoesNotExist:
            pass
        
        # 4. El usuario mantiene premium hasta el final del periodo
        return {
            'message': 'Suscripción cancelada. Mantendrás acceso premium hasta el fin del periodo.',
            'cancel_at': timezone.datetime.fromtimestamp(
                subscription.current_period_end,
                tz=timezone.utc
            ),
            'status': 'canceled'
        }
    
    @staticmethod
    def reactivate_subscription(user):
        """
        Reactivar una suscripción cancelada antes de que termine el periodo
        
        Args:
            user: Instancia del modelo User
            
        Returns:
            dict: Información de la reactivación
        """
        
        if not user.stripe_subscription_id:
            raise ValueError('El usuario no tiene una suscripción')
        
        # Reactivar en Stripe
        subscription = stripe.Subscription.modify(
            user.stripe_subscription_id,
            cancel_at_period_end=False
        )
        
        # Actualizar en DB
        try:
            db_subscription = Subscription.objects.get(
                stripe_subscription_id=subscription.id
            )
            db_subscription.status = 'active'
            db_subscription.canceled_at = None
            db_subscription.save()
        except Subscription.DoesNotExist:
            pass
        
        return {
            'message': 'Suscripción reactivada exitosamente',
            'status': 'active',
            'current_period_end': timezone.datetime.fromtimestamp(
                subscription.current_period_end,
                tz=timezone.utc
            )
        }
    
    @staticmethod
    def get_subscription_status(user):
        """
        Obtener el estado actual de la suscripción de un usuario
        
        Args:
            user: Instancia del modelo User
            
        Returns:
            dict: Estado de la suscripción
        """
        
        if not user.stripe_subscription_id:
            return {
                'has_subscription': False,
                'is_premium': False,
                'status': None
            }
        
        try:
            # Obtener de Stripe para info más actualizada
            subscription = stripe.Subscription.retrieve(user.stripe_subscription_id)
            
            return {
                'has_subscription': True,
                'is_premium': subscription.status == 'active',
                'status': subscription.status,
                'current_period_start': timezone.datetime.fromtimestamp(
                    subscription.current_period_start,
                    tz=timezone.utc
                ),
                'current_period_end': timezone.datetime.fromtimestamp(
                    subscription.current_period_end,
                    tz=timezone.utc
                ),
                'cancel_at_period_end': subscription.cancel_at_period_end
            }
        except stripe.error.StripeError:
            return {
                'has_subscription': False,
                'is_premium': False,
                'status': 'error'
            }
    
    @staticmethod
    def handle_subscription_webhook(event):
        """
        Manejar webhooks de Stripe relacionados con suscripciones
        
        Args:
            event: Evento de Stripe
            
        Returns:
            dict: Resultado del procesamiento
        """
        
        event_type = event['type']
        subscription_data = event['data']['object']
        
        # Obtener el usuario
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(
                stripe_customer_id=subscription_data['customer']
            )
        except User.DoesNotExist:
            return {'status': 'error', 'message': 'Usuario no encontrado'}
        
        # Procesar según el tipo de evento
        if event_type == 'customer.subscription.created':
            # Suscripción creada
            user.is_premium = True
            user.stripe_subscription_id = subscription_data['id']
            user.premium_expires_at = timezone.datetime.fromtimestamp(
                subscription_data['current_period_end'],
                tz=timezone.utc
            )
            user.save()
            
            return {'status': 'success', 'message': 'Suscripción activada'}
        
        elif event_type == 'customer.subscription.updated':
            # Suscripción actualizada
            db_subscription = Subscription.objects.filter(
                stripe_subscription_id=subscription_data['id']
            ).first()
            
            if db_subscription:
                db_subscription.status = subscription_data['status']
                db_subscription.current_period_end = timezone.datetime.fromtimestamp(
                    subscription_data['current_period_end'],
                    tz=timezone.utc
                )
                db_subscription.save()
            
            # Actualizar estado premium del usuario
            user.is_premium = subscription_data['status'] == 'active'
            user.premium_expires_at = timezone.datetime.fromtimestamp(
                subscription_data['current_period_end'],
                tz=timezone.utc
            )
            user.save()
            
            return {'status': 'success', 'message': 'Suscripción actualizada'}
        
        elif event_type == 'customer.subscription.deleted':
            # Suscripción cancelada/terminada
            user.is_premium = False
            user.premium_expires_at = None
            user.save()
            
            db_subscription = Subscription.objects.filter(
                stripe_subscription_id=subscription_data['id']
            ).first()
            
            if db_subscription:
                db_subscription.status = 'canceled'
                db_subscription.ended_at = timezone.now()
                db_subscription.save()
            
            return {'status': 'success', 'message': 'Suscripción terminada'}
        
        elif event_type == 'invoice.payment_succeeded':
            # Pago exitoso (renovación)
            invoice = subscription_data
            
            # Registrar transacción
            Transaction.record_subscription(
                user=user,
                amount=Decimal(str(invoice['amount_paid'] / 100)),  # Convertir centavos a pesos
                stripe_id=invoice['payment_intent']
            )
            
            # Enviar notificación
            from notifications.models import Notification
            Notification.objects.create(
                user=user,
                type='subscription_renewal',
                title='Suscripción Premium Renovada',
                message=f'Tu suscripción premium se ha renovado exitosamente por ${invoice["amount_paid"] / 100} MXN.',
                metadata={'invoice_id': invoice['id']}
            )
            
            return {'status': 'success', 'message': 'Pago procesado'}
        
        elif event_type == 'invoice.payment_failed':
            # Pago fallido
            invoice = subscription_data
            
            # Notificar al usuario
            from notifications.models import Notification
            Notification.objects.create(
                user=user,
                type='subscription_renewal',
                title='Error en pago de suscripción',
                message='No pudimos procesar el pago de tu suscripción premium. Por favor actualiza tu método de pago.',
                metadata={'invoice_id': invoice['id']}
            )
            
            return {'status': 'success', 'message': 'Notificación enviada'}
        
        return {'status': 'ignored', 'message': f'Evento {event_type} no manejado'}