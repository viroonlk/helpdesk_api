#!/usr/bin/env bash
# build.sh

# 1. หยุดถ้ามีคำสั่งไหนพลาด
set -o errexit

# 2. รวบรวมไฟล์ Static (ตามที่ WhiteNoise บอก)
python manage.py collectstatic --noinput

# 3. รัน Migrate
python manage.py migrate