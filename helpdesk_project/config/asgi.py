# config/asgi.py

import os
from django.core.asgi import get_asgi_application

# 👇 บรรทัดนี้ก็ต้องเป็น 'config.settings'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_asgi_application()