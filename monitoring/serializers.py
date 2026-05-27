from rest_framework import serializers

from .models import Reading


class ReadingSerializer(serializers.ModelSerializer):
    motor_enabled = serializers.SerializerMethodField()
    led_white_blink = serializers.SerializerMethodField()
    led_dark_on = serializers.SerializerMethodField()
    system_state = serializers.SerializerMethodField()

    class Meta:
        model = Reading
        fields = [
            'id',
            'current_a',
            'peak_current_a',
            'rms_current_a',
            'power_w',
            'temperature_c',
            'humidity_pct',
            'alert',
            'critical',
            'motor_enabled',
            'led_white_blink',
            'led_dark_on',
            'system_state',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'alert',
            'critical',
            'motor_enabled',
            'led_white_blink',
            'led_dark_on',
            'system_state',
            'created_at',
        ]

    def validate_current_a(self, value):
        if value < 0:
            raise serializers.ValidationError('La corriente debe ser mayor o igual a 0.')
        return value

    def validate_humidity_pct(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError('La humedad debe estar entre 0 y 100.')
        return value

    def get_motor_enabled(self, obj):
        return not obj.critical

    def get_led_white_blink(self, obj):
        return obj.critical

    def get_led_dark_on(self, obj):
        return not obj.critical

    def get_system_state(self, obj):
        return 'CRITICAL' if obj.critical else 'NORMAL'

    def create(self, validated_data):
        temperature = validated_data['temperature_c']
        current = validated_data['current_a']
        humidity = validated_data['humidity_pct']
        critical = temperature < 20 or temperature > 40 or current >= 2.5 or humidity > 90
        validated_data['critical'] = critical
        validated_data['alert'] = critical
        return super().create(validated_data)
