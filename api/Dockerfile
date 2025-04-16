FROM python:3.12

WORKDIR /api

COPY /api/requirements.txt .

RUN pip install --upgrade setuptools
RUN pip install --no-cache-dir -r requirements.txt

RUN chmod 755 .

COPY /auth/. ./auth/.
COPY /api/. .

EXPOSE 80
VOLUME [ "/certificates" ]
VOLUME [ "/config" ]

CMD [ "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "80", "--log-config", "/config/logging.ini"]
