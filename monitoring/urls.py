from django.urls import path

from .views import ClearReadingsView, LatestReadingView, ReadingListCreateView, ReadingStatsView


urlpatterns = [
    path('readings/', ReadingListCreateView.as_view(), name='reading-list-create'),
    path('readings/latest/', LatestReadingView.as_view(), name='reading-latest'),
    path('readings/stats/', ReadingStatsView.as_view(), name='reading-stats'),
    path('readings/clear/', ClearReadingsView.as_view(), name='reading-clear'),
]
