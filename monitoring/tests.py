from django.test import TestCase
from rest_framework.test import APIClient

from .models import Reading


class ReadingApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_post_normal_reading_returns_motor_and_led_controls(self):
        response = self.client.post(
            '/api/readings/',
            {
                'current_a': 1.8,
                'peak_current_a': 2.54,
                'rms_current_a': 1.8,
                'power_w': 396,
                'temperature_c': 31.5,
                'humidity_pct': 62,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['system_state'], 'NORMAL')
        self.assertFalse(response.data['critical'])
        self.assertFalse(response.data['alert'])
        self.assertTrue(response.data['motor_enabled'])
        self.assertFalse(response.data['led_white_blink'])
        self.assertTrue(response.data['led_dark_on'])
        self.assertEqual(response.data['peak_current_a'], 2.54)
        self.assertEqual(response.data['rms_current_a'], 1.8)
        self.assertEqual(response.data['power_w'], 396)
        self.assertFalse(
            {'motor_enabled', 'led_white_blink', 'led_dark_on', 'system_state'}
            & {field.name for field in Reading._meta.fields}
        )

    def test_post_critical_reading_returns_motor_and_led_controls(self):
        response = self.client.post(
            '/api/readings/',
            {
                'current_a': 1.7,
                'peak_current_a': 2.4,
                'rms_current_a': 1.7,
                'power_w': 374,
                'temperature_c': 43.4,
                'humidity_pct': 63,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['system_state'], 'CRITICAL')
        self.assertTrue(response.data['critical'])
        self.assertTrue(response.data['alert'])
        self.assertFalse(response.data['motor_enabled'])
        self.assertTrue(response.data['led_white_blink'])
        self.assertFalse(response.data['led_dark_on'])
