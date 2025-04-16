FROM python:3.12

WORKDIR /app

COPY /bridge/requirements.txt .

RUN pip install --upgrade setuptools
RUN pip install --no-cache-dir -r requirements.txt

COPY /schemas/. ./schemas/.
COPY /shared_config/. ./shared_config/.
COPY /cache/. ./cache/.
COPY /auth/. ./auth/.
COPY /bridge/. .

EXPOSE 80
VOLUME [ "/certificates" ]

CMD [ "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "80" ]
