from django.db import models


class Reading(models.Model):
    current_a = models.FloatField()
    peak_current_a = models.FloatField(null=True, blank=True)
    rms_current_a = models.FloatField(null=True, blank=True)
    power_w = models.FloatField(null=True, blank=True)
    temperature_c = models.FloatField()
    humidity_pct = models.FloatField()
    alert = models.BooleanField(default=False)
    critical = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.current_a} A | {self.temperature_c} C'
