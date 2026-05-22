from rest_framework import serializers

from .models import Reading


class ReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reading
        fields = [
            'id',
            'current_a',
            'temperature_c',
            'humidity_pct',
            'alert',
            'critical',
            'created_at',
        ]
        read_only_fields = ['id', 'alert', 'critical', 'created_at']

    def validate_current_a(self, value):
        if value < 0:
            raise serializers.ValidationError('La corriente debe ser mayor o igual a 0.')
        return value

    def validate_humidity_pct(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError('La humedad debe estar entre 0 y 100.')
        return value

    def create(self, validated_data):
        temperature = validated_data['temperature_c']
        current = validated_data['current_a']
        humidity = validated_data['humidity_pct']
        critical = temperature < 20 or temperature > 40 or current >= 2.5 or humidity > 90
        validated_data['critical'] = critical
        validated_data['alert'] = critical
        return super().create(validated_data)
