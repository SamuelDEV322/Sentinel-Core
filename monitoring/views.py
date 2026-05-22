from rest_framework.generics import ListCreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Reading
from .serializers import ReadingSerializer


class ReadingListCreateView(ListCreateAPIView):
    queryset = Reading.objects.all()
    serializer_class = ReadingSerializer


class LatestReadingView(APIView):
    def get(self, request):
        reading = Reading.objects.first()
        if reading is None:
            return Response(None)
        return Response(ReadingSerializer(reading).data)


class ReadingStatsView(APIView):
    def get(self, request):
        latest = Reading.objects.first()
        total_readings = Reading.objects.count()
        critical_count = Reading.objects.filter(critical=True).count()

        return Response(
            {
                'total_readings': total_readings,
                'latest_reading': ReadingSerializer(latest).data if latest else None,
                'critical_count': critical_count,
                'normal_count': total_readings - critical_count,
            }
        )


class ClearReadingsView(APIView):
    def delete(self, request):
        deleted_count, _ = Reading.objects.all().delete()
        return Response({'deleted_count': deleted_count})
