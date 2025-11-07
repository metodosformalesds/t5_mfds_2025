# core/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .authentication import CognitoClient, sync_cognito_user_to_db

User = get_user_model()


class UserRegistrationSerializer(serializers.Serializer):
    """Serializer para registro de usuarios con Cognito"""
    
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    phone_number = serializers.CharField(max_length=15, required=False)
    
    def validate(self, attrs):
        """Validar que las contraseñas coincidan"""
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'Las contraseñas no coinciden'
            })
        
        # Verificar que el username no exista en DB local
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({
                'username': 'Este nombre de usuario ya está en uso'
            })
        
        # Verificar que el email no exista en DB local
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({
                'email': 'Este email ya está registrado'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Registrar usuario en Cognito"""
        cognito = CognitoClient()
        
        # Construir nombre completo
        name = f"{validated_data.get('first_name', '')} {validated_data.get('last_name', '')}".strip()
        
        # Registrar en Cognito
        response = cognito.sign_up(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            name=name or validated_data['username'],
            phone_number=validated_data.get('phone_number', '')
        )
        
        if not response:
            raise serializers.ValidationError('Error al registrar usuario en Cognito')
        
        # Crear usuario en DB local (sin contraseña, se maneja en Cognito)
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            is_email_verified=False  # Se verifica con código
        )
        
        return user


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer para verificar email con código"""
    
    username = serializers.CharField()
    verification_code = serializers.CharField(max_length=6)
    
    def validate(self, attrs):
        """Verificar código en Cognito"""
        cognito = CognitoClient()
        
        success = cognito.confirm_sign_up(
            username=attrs['username'],
            confirmation_code=attrs['verification_code']
        )
        
        if not success:
            raise serializers.ValidationError({
                'verification_code': 'Código inválido o expirado'
            })
        
        # Actualizar usuario en DB local
        try:
            user = User.objects.get(username=attrs['username'])
            user.is_email_verified = True
            user.save()
        except User.DoesNotExist:
            pass
        
        return attrs


class UserLoginSerializer(serializers.Serializer):
    """Serializer para login de usuarios"""
    
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Autenticar con Cognito"""
        cognito = CognitoClient()
        
        tokens = cognito.sign_in(
            username=attrs['username'],
            password=attrs['password']
        )
        
        if not tokens:
            raise serializers.ValidationError({
                'non_field_errors': 'Credenciales inválidas'
            })
        
        # Obtener info del usuario desde Cognito
        user_data = cognito.get_user(tokens['access_token'])
        
        if not user_data:
            raise serializers.ValidationError({
                'non_field_errors': 'Error al obtener información del usuario'
            })
        
        # Sincronizar con DB local
        user = sync_cognito_user_to_db(user_data)
        
        # Agregar tokens y usuario a los datos validados
        attrs['tokens'] = tokens
        attrs['user'] = user
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer para el perfil de usuario"""
    
    product_limit = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'profile_image', 'city', 'state', 'location',
            'business_name', 'is_premium', 'premium_expires_at',
            'is_email_verified', 'available_balance_mxn', 'product_limit',
            'created_at'
        ]
        read_only_fields = [
            'id', 'username', 'email', 'is_premium', 'premium_expires_at',
            'is_email_verified', 'available_balance_mxn', 'created_at'
        ]


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar perfil"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number', 'profile_image',
            'city', 'state', 'location', 'business_name'
        ]
    
    def update(self, instance, validated_data):
        """Actualizar perfil y subir imagen a S3 si es necesario"""
        
        # Si hay imagen nueva, subirla a S3
        if 'profile_image' in validated_data:
            from core.utils.s3_utils import upload_profile_image
            
            image_file = validated_data['profile_image']
            if image_file:
                # Eliminar imagen anterior si existe
                if instance.profile_image:
                    from core.utils.s3_utils import delete_image
                    delete_image(instance.profile_image)
                
                # Subir nueva imagen
                image_url = upload_profile_image(image_file)
                validated_data['profile_image'] = image_url
        
        return super().update(instance, validated_data)


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer para solicitar reset de contraseña"""
    
    username = serializers.CharField()
    
    def validate_username(self, value):
        """Verificar que el usuario existe"""
        if not User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Usuario no encontrado')
        return value
    
    def save(self):
        """Iniciar proceso de reset en Cognito"""
        cognito = CognitoClient()
        username = self.validated_data['username']
        
        success = cognito.forgot_password(username)
        
        if not success:
            raise serializers.ValidationError('Error al solicitar reset de contraseña')
        
        return {'message': 'Código de verificación enviado al email registrado'}


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer para confirmar reset de contraseña"""
    
    username = serializers.CharField()
    verification_code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Validar que las contraseñas coincidan"""
        if attrs['new_password'] != attrs.pop('new_password_confirm'):
            raise serializers.ValidationError({
                'new_password_confirm': 'Las contraseñas no coinciden'
            })
        return attrs
    
    def save(self):
        """Confirmar nueva contraseña en Cognito"""
        cognito = CognitoClient()
        
        success = cognito.confirm_forgot_password(
            username=self.validated_data['username'],
            confirmation_code=self.validated_data['verification_code'],
            new_password=self.validated_data['new_password']
        )
        
        if not success:
            raise serializers.ValidationError('Código inválido o expirado')
        
        return {'message': 'Contraseña actualizada exitosamente'}