FROM python:3.12

WORKDIR /api

COPY /api/requirements.txt .

RUN pip install --upgrade setuptools
RUN pip install --no-cache-dir -r requirements.txt

RUN chmod 755 .

COPY /shared_config/. ./shared_config/.
COPY /certificates/. ./certificates/.
COPY /utils/. ./utils/.
COPY /cache/. ./cache/.
COPY /middleware/. ./middleware/.
COPY /api/. .

EXPOSE 80

CMD [ "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "80" ]
